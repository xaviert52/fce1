import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Fingerprint, FileCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-secondary/85" />
      </div>

      <div className="container relative z-10 py-24 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Plataforma de Certificación Digital
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-secondary-foreground sm:text-5xl lg:text-6xl">
            Emisión de Certificados con{" "}
            <span className="text-gradient">Validación Biométrica</span>
          </h1>

          <p className="mb-10 text-lg leading-relaxed text-secondary-foreground/70 sm:text-xl">
            Proceso seguro, rápido y completamente digital. Valida tu identidad
            con reconocimiento facial y obtén tu certificado en minutos.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/proceso">
              <Button variant="hero" size="xl">
                Solicitar Certificado
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="hero-outline" size="xl">
                Panel Administrativo
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: FileCheck, label: "Certificados Emitidos", value: "12,847" },
            { icon: Fingerprint, label: "Validaciones Biométricas", value: "99.7%" },
            { icon: ShieldCheck, label: "Seguridad Garantizada", value: "256-bit" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl border border-primary/10 bg-secondary-foreground/5 p-6 text-center backdrop-blur-md"
            >
              <stat.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
              <div className="text-2xl font-bold text-secondary-foreground">{stat.value}</div>
              <div className="mt-1 text-sm text-secondary-foreground/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
