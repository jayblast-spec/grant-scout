import { SiteHeader } from "@/components/gs/SiteHeader";
import { Hero } from "@/components/gs/Hero";
import { HowItWorks } from "@/components/gs/HowItWorks";
import { TrustSources } from "@/components/gs/TrustSources";
import { SmartUseCases } from "@/components/gs/SmartUseCases";
import { AgentPattern } from "@/components/gs/AgentPattern";
import { TryIt } from "@/components/gs/TryIt";
import { SiteFooter } from "@/components/gs/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <TryIt />
        <HowItWorks />
        <TrustSources />
        <SmartUseCases />
        <AgentPattern />
      </main>
      <SiteFooter />
    </div>
  );
}
