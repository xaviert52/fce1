import { UserCheck, ScanFace, FileText, Bell, ShieldCheck, Clock } from "lucide-react";

const features = [
  {
    icon: UserCheck,
    title: "Consulta Automática",
    description: "Ingresa tu número de cédula y consultamos automáticamente tus datos en el Registro Civil.",
  },
  {
    icon: ScanFace,
    title: "Validación Biométrica",
    description: "Verificación facial en tiempo real comparada con tu documento de identidad.",
  },
  {
    icon: FileText,
    title: "OCR Inteligente",
    description: "Extracción automática de datos de tu cédula mediante reconocimiento óptico de caracteres.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Avanzada",
    description: "Encriptación de extremo a extremo, detección de vida y auditoría completa.",
  },
  {
    icon: Clock,
    title: "Proceso en Minutos",
    description: "Completa todo el proceso de certificación desde tu dispositivo en menos de 10 minutos.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    description: "Recibe actualizaciones en tiempo real sobre el estado de tu certificado.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Proceso <span className="text-gradient">Simplificado</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Un flujo diseñado para ser seguro, transparente y sin complicaciones.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="elevated-card group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-light">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
