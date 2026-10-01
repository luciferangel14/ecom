import Hero from "@/components/Hero";
import PopularPicks from "@/components/PopularPicks";
import IdentityShowcase from "@/components/IdentityShowcase";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProduct from "@/components/FeaturedProduct";
import NewArrivals from "@/components/NewArrivals";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <PopularPicks />
      <IdentityShowcase />
      <CategoryGrid />
      <FeaturedProduct />
      <NewArrivals />
      <Testimonials />
      <Footer />
    </main>
  );
}
