import HeroSection from "@/components/marketing/HeroSection";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import ProblemSection from "@/components/marketing/ProblemSection";
import SolutionSection from "@/components/marketing/SolutionSection";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import TechStackSection from "@/components/marketing/TechStackSection";
import StashPriceModelsSection from "@/components/marketing/StashPriceModelsSection";
import SDGSection from "@/components/marketing/SDGSection";
import CTASection from "@/components/marketing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProductShowcase />
      <ProblemSection />
      <SolutionSection />
      <FeaturesGrid />
      <HowItWorksSection />
      <TechStackSection />
      <StashPriceModelsSection />
      <SDGSection />
      <CTASection />
    </>
  );
}
