import { ClipboardList, Camera, ScanFace, Award } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Datos Personales",
    description: "Ingresa tu cédula para consulta automática o completa tus datos manualmente.",
  },
  {
    icon: Camera,
    step: "02",
    title: "Captura de Cédula",
    description: "Toma fotos del frente y reverso de tu cédula de identidad.",
  },
  {
    icon: ScanFace,
    step: "03",
    title: "Validación Biométrica",
    description: "Selfie en tiempo real para verificar tu identidad con reconocimiento facial.",
  },
  {
    icon: Award,
    step: "04",
    title: "Emisión del Certificado",
    description: "Configura tu certificado digital y descárgalo al instante.",
  },
];

const ProcessSteps = () => {
  return (
    <section className="bg-muted/50 py-20 lg:py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            ¿Cómo <span className="text-gradient">Funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Cuatro pasos simples para obtener tu certificado digital.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-0 md:grid-cols-4">
            {steps.map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center px-4">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-0.5 w-full translate-x-1/2 bg-border md:block">
                    <div className="absolute inset-0 gradient-teal opacity-30" />
                  </div>
                )}

                <div className="relative z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-md border border-border">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>

                <span className="mb-2 font-mono text-xs font-bold text-primary">{item.step}</span>
                <h3 className="mb-2 text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSteps;
