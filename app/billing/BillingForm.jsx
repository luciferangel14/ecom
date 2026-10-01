"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildInvoicePdf, SHOP_NAME } from "@/lib/invoicePdf";

const COUNTRY_CODE = "91"; // added when the number is entered as 10 digits

const rupees = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function toWhatsAppNumber(raw) {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? COUNTRY_CODE + digits : digits;
}

function whatsappLink({ phone, name, invoiceNo, total, url }) {
  const text =
    `Hi ${name}, thank you for shopping with ${SHOP_NAME}!\n` +
    `Your invoice #${invoiceNo} (${rupees(total)}) is ready:\n${url}`;
  return `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(text)}`;
}

const field =
  "w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-ink/40";

export default function BillingForm() {
  const supabase = useMemo(() => createClient(), []);

  const [products, setProducts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");

  useEffect(() => {
    supabase
      .from("products")
      .select("id, name, price")
      .order("name")
      .then(({ data }) => setProducts(data || []));
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRecent() {
    const { data } = await supabase
      .from("invoices")
      .select("id, invoice_no, customer_name, customer_phone, total, pdf_url, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setRecent(data || []);
  }

  const q = query.trim().toLowerCase();
  const matches = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return as - bs || a.name.localeCompare(b.name);
    })
    .slice(0, 20);
  const exactExists = products.some((p) => p.name.toLowerCase() === q);

  async function saveNewProduct() {
    setError("");
    const name = newName.trim();
    const price = Number(newPrice);
    if (!name) return setError("Enter the product name.");
    if (!(price >= 0) || newPrice === "") return setError("Enter the product price.");
    const { data, error: insErr } = await supabase
      .from("products")
      .insert({ name, price })
      .select("id, name, price")
      .single();
    if (insErr) return setError(insErr.message);
    setProducts((list) => [...list, data]);
    addProduct(data); // also puts it straight into the bill
    setAddingNew(false);
    setNewName("");
    setNewPrice("");
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const rawDiscount =
    discountType === "percent"
      ? (subtotal * Math.min(Number(discountValue) || 0, 100)) / 100
      : Number(discountValue) || 0;
  const discount = Math.min(Math.max(rawDiscount, 0), subtotal);
  const total = subtotal - discount;

  function addProduct(p) {
    setCart((c) => {
      const existing = c.find((i) => i.product_id === p.id);
      if (existing) return c.map((i) => (i.product_id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product_id: p.id, name: p.name, price: Number(p.price), qty: 1 }];
    });
    setQuery("");
    setOpen(false);
  }

  const setQty = (id, qty) =>
    setCart((c) => c.map((i) => (i.product_id === id ? { ...i, qty: Math.max(1, Number(qty) || 1) } : i)));
  const removeItem = (id) => setCart((c) => c.filter((i) => i.product_id !== id));

  async function sendInvoice() {
    setError("");
    if (!customerName.trim()) return setError("Enter the customer's name.");
    if (toWhatsAppNumber(customerPhone).length < 11) return setError("Enter a valid mobile number.");
    if (cart.length === 0) return setError("Add at least one product.");

    // Open the tab now (inside the click) so the browser doesn't block it later.
    const waTab = window.open("", "_blank");
    setBusy(true);

    try {
      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .insert({
          customer_name: customerName.trim(),
          customer_phone: toWhatsAppNumber(customerPhone),
          subtotal,
          discount,
          total,
        })
        .select("id, invoice_no, created_at")
        .single();
      if (invErr) throw invErr;

      const items = cart.map((i) => ({
        invoice_id: inv.id,
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        line_total: i.price * i.qty,
      }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(items);
      if (itemsErr) throw itemsErr;

      const doc = buildInvoicePdf({
        invoiceNo: inv.invoice_no,
        customerName: customerName.trim(),
        customerPhone: toWhatsAppNumber(customerPhone),
        items,
        subtotal,
        discount,
        total,
        date: inv.created_at,
      });

      const path = `${inv.id}.pdf`;
      const { error: upErr } = await supabase.storage
        .from("invoices")
        .upload(path, doc.output("blob"), { contentType: "application/pdf" });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("invoices").getPublicUrl(path);
      const url = pub.publicUrl;

      const { error: updErr } = await supabase.from("invoices").update({ pdf_url: url }).eq("id", inv.id);
      if (updErr) throw updErr;

      doc.save(`Invoice-${inv.invoice_no}.pdf`); // local copy

      const link = whatsappLink({
        phone: customerPhone,
        name: customerName.trim(),
        invoiceNo: inv.invoice_no,
        total,
        url,
      });
      if (waTab) waTab.location.href = link;
      else window.location.href = link;

      setDone({ invoiceNo: inv.invoice_no, url, link });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscountValue("");
      loadRecent();
    } catch (e) {
      if (waTab) waTab.close();
      setError(e?.message || "Something went wrong. Nothing was sent.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-4xl bg-white p-8 shadow-neu">
        <h2 className="font-serif text-xl text-ink">Customer</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className={field}
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className={field}
            placeholder="WhatsApp mobile number"
            inputMode="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-4xl bg-white p-8 shadow-neu">
        <h2 className="font-serif text-xl text-ink">Items</h2>

        <div className="relative mt-4">
          <input
            className={field}
            placeholder="Search products to add"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
          {open && (
            <ul className="absolute z-10 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-ink/10 bg-white shadow-neu">
              {matches.length === 0 ? (
                <li className="px-4 py-3 text-sm text-ink/50">
                  {products.length === 0 ? "No products yet. Type a name to add one." : "No match."}
                </li>
              ) : (
                matches.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addProduct(p)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-ink hover:bg-ink/5"
                    >
                      <span>{p.name}</span>
                      <span className="text-ink/60">{rupees(p.price)}</span>
                    </button>
                  </li>
                ))
              )}
              {q && !exactExists && (
                <li className="border-t border-ink/10">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setNewName(query.trim());
                      setAddingNew(true);
                      setOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-ink underline"
                  >
                    + Add “{query.trim()}” as a new product
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>

        {addingNew ? (
          <div className="mt-4 grid gap-3 rounded-2xl border border-ink/10 p-4 md:grid-cols-[1fr_9rem_auto]">
            <input
              className={field}
              placeholder="Product name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className={field}
              type="number"
              min={0}
              placeholder="Price ₹"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveNewProduct}
                className="rounded-full bg-ink px-5 py-3 text-sm text-white"
              >
                Save product
              </button>
              <button
                type="button"
                onClick={() => setAddingNew(false)}
                className="px-3 text-sm text-ink/60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingNew(true)}
            className="mt-3 text-sm text-ink/60 underline"
          >
            + New product
          </button>
        )}

        {cart.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm text-ink">
              <thead className="text-left text-ink/50">
                <tr>
                  <th className="pb-2 font-normal">Product</th>
                  <th className="pb-2 font-normal">Price</th>
                  <th className="pb-2 font-normal">Qty</th>
                  <th className="pb-2 text-right font-normal">Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.map((i) => (
                  <tr key={i.product_id} className="border-t border-ink/10">
                    <td className="py-3 pr-2">{i.name}</td>
                    <td className="py-3 pr-2">{rupees(i.price)}</td>
                    <td className="py-3 pr-2">
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) => setQty(i.product_id, e.target.value)}
                        className="w-16 rounded-xl border border-ink/10 px-2 py-1"
                      />
                    </td>
                    <td className="py-3 text-right">{rupees(i.price * i.qty)}</td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeItem(i.product_id)}
                        className="text-ink/40 hover:text-ink"
                        aria-label={`Remove ${i.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm text-ink/60">Discount</span>
          <select
            className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value)}
          >
            <option value="percent">%</option>
            <option value="flat">₹ flat</option>
          </select>
          <input
            type="number"
            min={0}
            className="w-28 rounded-xl border border-ink/10 px-3 py-2 text-sm"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder="0"
          />
        </div>

        <dl className="mt-6 space-y-1 text-sm text-ink">
          <div className="flex justify-between">
            <dt className="text-ink/60">Subtotal</dt>
            <dd>{rupees(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Discount</dt>
            <dd>− {rupees(discount)}</dd>
          </div>
          <div className="flex justify-between pt-2 font-serif text-2xl">
            <dt>Total</dt>
            <dd>{rupees(total)}</dd>
          </div>
        </dl>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={sendInvoice}
          disabled={busy}
          className="mt-6 w-full rounded-full bg-ink px-6 py-4 text-sm text-white disabled:opacity-50"
        >
          {busy ? "Saving invoice…" : "Send invoice"}
        </button>
        <p className="mt-2 text-center text-xs text-ink/50">
          Saves the bill, downloads a PDF copy, and opens WhatsApp with the invoice link ready to send.
        </p>
      </section>

      {done && (
        <section className="rounded-4xl bg-white p-6 text-sm text-ink shadow-neu">
          Invoice #{done.invoiceNo} saved.{" "}
          <a className="underline" href={done.url} target="_blank" rel="noreferrer">
            Open PDF link
          </a>
          {" · "}
          <a className="underline" href={done.link} target="_blank" rel="noreferrer">
            Open WhatsApp again
          </a>
        </section>
      )}

      <section className="rounded-4xl bg-white p-8 shadow-neu">
        <h2 className="font-serif text-xl text-ink">Recent invoices</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink/50">No invoices yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10 text-sm text-ink">
            {recent.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span>
                  #{r.invoice_no} · {r.customer_name}
                </span>
                <span className="flex items-center gap-4">
                  <span className="text-ink/60">{rupees(r.total)}</span>
                  {r.pdf_url && (
                    <>
                      <a className="underline" href={r.pdf_url} target="_blank" rel="noreferrer">
                        PDF
                      </a>
                      <a
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                        href={whatsappLink({
                          phone: r.customer_phone,
                          name: r.customer_name,
                          invoiceNo: r.invoice_no,
                          total: r.total,
                          url: r.pdf_url,
                        })}
                      >
                        WhatsApp
                      </a>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
