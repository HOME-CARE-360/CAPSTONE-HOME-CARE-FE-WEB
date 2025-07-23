import Header from '@/components/Header';
import FeaturedServices from '@/components/FeaturedService';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import WhyChooseUs from '@/components/WhyChooseUs';

export default function RootPage() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeaturedServices />
      <WhyChooseUs />
      <Footer />
    </div>
  );
}
