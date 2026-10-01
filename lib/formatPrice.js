export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // use 2 if you want paise, e.g. ₹104.00
  }).format(value);
}