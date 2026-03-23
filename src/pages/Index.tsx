import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ProcessSteps from "@/components/landing/ProcessSteps";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProcessSteps />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="container">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">CertiBio</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 CertiBio — Sistema de Certificación Digital con Validación Biométrica
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
