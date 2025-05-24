import { HeroSection } from "./components/hero-section";
import { FeaturesGrid } from "./components/features-grid";

export default function FeaturesPage() {
  return (
    <>
      {/* Content container with full-width background */}
      <div className="relative min-h-screen w-full
        bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 
        dark:from-gray-950 dark:via-gray-900 dark:to-gray-950
        text-gray-50 dark:text-white
        [&_p]:text-gray-200 dark:[&_p]:text-gray-100
        [&_h1]:text-white dark:[&_h1]:text-white
        [&_h2]:text-white dark:[&_h2]:text-white
        [&_h3]:text-white dark:[&_h3]:text-white
        [&_button]:text-white dark:[&_button]:text-white
        antialiased"
      >
        <HeroSection />
        <FeaturesGrid />
      </div>
    </>
  );
} 