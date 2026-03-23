import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  FileX, Activity, RotateCcw, SkipForward, XCircle, Mail
} from "lucide-react";

const steps = [
  { id: "data_collection", label: "Datos Personales", time: "2026-02-24 08:00", status: "completed" as const },
  { id: "document_capture", label: "Captura de Cédula", time: "2026-02-24 08:05", status: "completed" as const },
  { id: "biometric_validation", label: "Validación Biométrica", time: "2026-02-24 08:12", status: "failed" as const },
  { id: "certificate_issuance", label: "Emisión de Certificado", time: null, status: "pending" as const },
];

const statusStyles = {
  completed: { icon: CheckCircle2, class: "text-success border-success/30 bg-success/10" },
  failed: { icon: FileX, class: "text-destructive border-destructive/30 bg-destructive/10" },
  pending: { icon: Clock, class: "text-muted-foreground border-border bg-muted" },
  in_progress: { icon: Activity, class: "text-info border-info/30 bg-info/10" },
};

const ProcessDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-4xl">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Proceso {id}</h1>
            <p className="text-muted-foreground">Detalle y timeline del proceso de certificación</p>
          </div>
          <Badge variant="outline" className="gap-1 bg-warning/10 text-warning">
            <AlertTriangle className="h-3 w-3" />
            Requiere Revisión
          </Badge>
        </div>

        {/* Info */}
        <Card className="elevated-card mb-8">
          <CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">Cédula</div>
              <div className="font-mono font-medium">172****83</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Nombre</div>
              <div className="font-medium">Carlos A. Mendoza</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Creado</div>
              <div className="text-sm">2026-02-23 16:45</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">IP de Origen</div>
              <div className="font-mono text-sm">192.168.1.***</div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="elevated-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Timeline del Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {steps.map((step, i) => {
                const style = statusStyles[step.status];
                return (
                  <div key={step.id} className="flex gap-4">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${style.class}`}>
                        <style.icon className="h-5 w-5" />
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[3rem] ${
                          step.status === "completed" ? "bg-success/30" : "bg-border"
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-8">
                      <div className="font-medium">{step.label}</div>
                      {step.time && (
                        <div className="text-xs text-muted-foreground">{step.time}</div>
                      )}
                      {step.status === "failed" && (
                        <div className="mt-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                          <strong>Error:</strong> Coincidencia facial inferior al umbral (67%). Posible problema de iluminación.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Admin actions */}
        <Card className="elevated-card">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Administrativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="default" size="sm">
                <RotateCcw className="h-4 w-4" />
                Reintentar Paso Fallido
              </Button>
              <Button variant="outline" size="sm">
                <SkipForward className="h-4 w-4" />
                Saltar Paso (con justificación)
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
                Contactar Usuario
              </Button>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4" />
                Rechazar Proceso
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessDetail;
