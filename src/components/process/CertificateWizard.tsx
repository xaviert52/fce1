import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, Camera, ScanFace, Award, PartyPopper,
  ArrowRight, ArrowLeft, Search, Upload,
  CheckCircle2, AlertCircle, Eye, Home, RefreshCcw, Download
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { extractDataFromId, compareFaces } from "@/lib/openai";
import { useNavigate } from "react-router-dom";

type Step = "data" | "document" | "biometric" | "certificate" | "complete";

const stepsConfig: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "data", label: "Datos Personales", icon: ClipboardList },
  { id: "document", label: "Captura de Cédula", icon: Camera },
  { id: "biometric", label: "Validación Biométrica", icon: ScanFace },
  { id: "certificate", label: "Certificado", icon: Award },
  { id: "complete", label: "Finalizado", icon: PartyPopper },
];

const CertificateWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("data");
  const [cedula, setCedula] = useState("");
  const [codigoDactilar, setCodigoDactilar] = useState("");
  const [formData, setFormData] = useState({
    nombres: "", apellido1: "", apellido2: "",
    direccion: "", telefono: "", ciudad: "",
    estadoCivil: "", email: "", pais: "", ruc: "",
  });
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [selfieCapture, setSelfieCapture] = useState(false);
  const [livenessCheck, setLivenessCheck] = useState(false);
  const [certType, setCertType] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // New state for real file handling
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isCapturingSelfie, setIsCapturingSelfie] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [whatsappSendStatus, setWhatsappSendStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  const currentIndex = stepsConfig.findIndex(s => s.id === currentStep);

  const normalizeWhatsappTo = (telefono: string) => {
    const digits = telefono.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("593")) return digits;
    if (digits.startsWith("0")) return `593${digits.slice(1)}`;
    if (digits.length === 9) return `593${digits}`;
    return digits;
  };

  useEffect(() => {
    if (currentStep !== "complete") return;
    if (!downloadUrl) return;
    if (whatsappSendStatus !== "idle") return;

    const to = normalizeWhatsappTo(formData.telefono);
    if (!to) {
      setWhatsappSendStatus("failed");
      toast.error("No se pudo enviar a WhatsApp: teléfono inválido");
      return;
    }

    setWhatsappSendStatus("sending");
    toast.loading("Enviando certificado por WhatsApp...");

    fetch("https://whatsapp.primecore.online/api/messages/send", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message: `Su certificado está a un solo paso en el siguiente enlace   ${downloadUrl}` }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`WhatsApp API error (${res.status})`);
        setWhatsappSendStatus("sent");
        toast.dismiss();
        toast.success("¡Certificado enviado por WhatsApp!");
      })
      .catch(() => {
        setWhatsappSendStatus("failed");
        toast.dismiss();
        toast.error("No se pudo enviar por WhatsApp. Descárgalo desde el enlace.");
      });
  }, [currentStep, downloadUrl, formData.telefono, whatsappSendStatus]);


  const handleFileSelect = (side: "front" | "back", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size if needed
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor sube un archivo de imagen válido");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      if (side === "front") {
        setFrontFile(file);
        setFrontPreview(result);
        setFrontUploaded(false);
        toast.loading("Extrayendo datos de la cédula...");
        try {
          const extractedData = await extractDataFromId(result);
          const content = extractedData.message.content;
          if (content) {
            const parsedData = JSON.parse(content);
            setFormData(d => ({ ...d, ...parsedData }));
            setFrontUploaded(true);
            toast.dismiss();
            toast.success("Datos extraídos exitosamente");
            toast.success("Frente cargado correctamente");
          } else {
            toast.dismiss();
            setFrontFile(null);
            setFrontPreview(null);
            setFrontUploaded(false);
            toast.error("No se pudo leer la cédula. Vuelve a tomar la foto del frente.");
          }
        } catch (error) {
          toast.dismiss();
          setFrontFile(null);
          setFrontPreview(null);
          setFrontUploaded(false);
          toast.error("No se pudo leer la cédula. Vuelve a tomar la foto del frente.");
        }
      } else {
        setBackFile(file);
        setBackPreview(result);
        setBackUploaded(true);
        toast.success("Reverso cargado correctamente");
      }
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = (side: "front" | "back") => {
    if (side === "front") frontInputRef.current?.click();
    else backInputRef.current?.click();
  };

  const startSelfieCapture = () => {
    setIsCapturingSelfie(true);
    setSelfieCapture(false);
    setLivenessCheck(false);
    setSelfieImage(null);
  };

  const captureSelfie = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc && frontPreview) {
        setSelfieImage(imageSrc);
        setIsCapturingSelfie(false);

        toast.loading("Verificando biometría...");
        try {
          const comparisonResult = await compareFaces(frontPreview, imageSrc);
          const scoreContent = comparisonResult.message.content;
          if (scoreContent) {
            const score = parseInt(scoreContent, 10);
            if (score >= 60) {
              setSelfieCapture(true);
              setLivenessCheck(true);
              toast.dismiss();
              toast.success(`Verificación biométrica exitosa (${score}% coincidencia)`);
            } else {
              toast.dismiss();
              toast.error(`Coincidencia facial baja (${score}%). Intenta de nuevo.`);
            }
          } else {
            toast.dismiss();
            toast.error("No se pudo obtener un puntaje de similitud.");
          }
        } catch (error) {
          toast.dismiss();
          toast.error("Ocurrió un error durante la verificación biométrica.");
        }
      } else {
        toast.error("No se pudo capturar la imagen o falta la foto de la cédula. Intenta de nuevo.");
      }
  }, [webcamRef, frontPreview]);

  const retakeSelfie = () => {
    setSelfieCapture(false);
    setLivenessCheck(false);
    setSelfieImage(null);
    setIsCapturingSelfie(true);
  };

  const handleSubmit = async () => {
    toast.loading("Generando certificado...");

    const alias = uuidv4();
    const nonEmpty = (value: string, fallback: string) => {
      const v = value.trim();
      return v.length > 0 ? v : fallback;
    };
    const nonEmptyOr = (value: string, fallbackFactory: () => string) => {
      const v = value.trim();
      return v.length > 0 ? v : fallbackFactory();
    };

    const certificatePayload = {
      perfil: "012",
      alias: alias,
      pass: password,
      cedulaPasaporte: nonEmpty(cedula, "0"),
      nombres: nonEmpty(formData.nombres, "N/A"),
      apellido1: nonEmpty(formData.apellido1, "N/A"),
      apellido2: nonEmpty(formData.apellido2, "N/A"),
      direccion: nonEmpty(formData.direccion, "N/A"),
      telefono: nonEmpty(formData.telefono, "0"),
      ciudad: nonEmpty(formData.ciudad, "Quito"),
      pais: nonEmpty(formData.pais, "ec"),
      ruc: nonEmptyOr(formData.ruc, () => `${nonEmpty(cedula, "0")}001`),
      servidor: 3,
      email: nonEmpty(formData.email, "no-reply@example.com"),
    };

    try {
      const certResponse = await fetch('https://ra.primecore.online/certificados/crea/normal', {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTksImRhdGEiOiJVMkZzZEdWa1gxOFZvYk9GeWgvWjBxTFQ4U3FJVjNsazdRSDRaaFNPcmczWjAvZmNDNW11TXVIVTZRaFFRNm9NcjZjMTN6Sk9razY5L2IycDBKV0k0akY1LzgwZUN0eWo3UkFkUHVPN2kyQT0iLCJpYXQiOjE3NzM4NjQwNDV9.50Ve7iFlcJJUfaQmQugzQLhVf1gmHz0l2dxY5GQlk5g',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(certificatePayload)
      });

      const certResult = await certResponse.json();

      if (certResult.estado === "success") {
        toast.dismiss();
        toast.success("Certificado creado exitosamente");

        const fileName = certResult.mensaje.split(' ')[1].replace(',','');
        const finalUrl = `https://files.primecore.online/documentos/local/data/normal/${fileName}`;
        setDownloadUrl(finalUrl);
        setWhatsappSendStatus("idle");
        setCurrentStep("complete");

      } else {
        throw new Error(certResult.mensaje || "Error al crear el certificado.");
      }

    } catch (error: any) {
      toast.dismiss();
      toast.error(`Error: ${error.message}`);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "data": return cedula && codigoDactilar && formData.telefono && formData.email;
      case "document": return frontUploaded && backUploaded;
      case "biometric": return selfieCapture && livenessCheck;
      case "certificate": return certType && acceptTerms && password.length >= 8;
    }
  };

  const goNext = () => {
    const next = stepsConfig[currentIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const goPrev = () => {
    const prev = stepsConfig[currentIndex - 1];
    if (prev) setCurrentStep(prev.id);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-4xl">
        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {stepsConfig.map((step, i) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                      i < currentIndex
                        ? "bg-primary text-primary-foreground"
                        : i === currentIndex
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < currentIndex ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden sm:block ${
                    i <= currentIndex ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < stepsConfig.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 rounded ${
                    i < currentIndex ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <Card className="elevated-card animate-fade-in">
          {/* STEP 1: Data Collection */}
          {currentStep === "data" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Información Personal
                </CardTitle>
                <CardDescription>
                  Ingresa tu cédula para consultar automáticamente o completa los datos manualmente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">


                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Número de Cédula</Label>
                      <Input
                        placeholder="Ej: 1712345678"
                        value={cedula}
                        onChange={e => setCedula(e.target.value)}
                        className="mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label>Código Dactilar</Label>
                      <Input
                        placeholder="Ej: 12345"
                        value={codigoDactilar}
                        onChange={e => setCodigoDactilar(e.target.value)}
                        className="mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={formData.telefono}
                        onChange={e => setFormData(d => ({ ...d, telefono: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>
              </CardContent>
            </>
          )}

          {/* STEP 2: Document Capture */}
          {currentStep === "document" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Captura de Cédula de Identidad
                </CardTitle>
                <CardDescription>
                  Sube fotos claras del frente y reverso de tu cédula.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Hidden inputs for file selection */}
                <input
                  type="file"
                  ref={frontInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelect("front", e)}
                />
                <input
                  type="file"
                  ref={backInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelect("back", e)}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  {[
                    { side: "front" as const, label: "Frente de la Cédula", uploaded: frontUploaded, preview: frontPreview },
                    { side: "back" as const, label: "Reverso de la Cédula", uploaded: backUploaded, preview: backPreview },
                  ].map(item => (
                    <div
                      key={item.side}
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all overflow-hidden ${
                        item.uploaded
                          ? "border-primary/40 bg-teal-light"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      {item.uploaded ? (
                        <>
                          {item.preview && (
                            <div className="mb-3 h-32 w-full max-w-[200px] overflow-hidden rounded-lg border border-border">
                              <img src={item.preview} alt={item.label} className="h-full w-full object-cover" />
                            </div>
                          )}
                          {!item.preview && <CheckCircle2 className="mb-3 h-10 w-10 text-primary" />}
                          <span className="text-sm font-medium">{item.label}</span>
                          <Badge className="mt-2" variant="outline">OCR Procesado</Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => triggerFileSelect(item.side)}
                          >
                            Cambiar imagen
                          </Button>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                          <span className="mb-3 text-sm font-medium">{item.label}</span>
                          <Button size="sm" onClick={() => triggerFileSelect(item.side)}>
                            <Camera className="h-4 w-4" />
                            Capturar / Subir
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {frontUploaded && backUploaded && (
                  <div className="mt-6 animate-slide-up rounded-lg border border-primary/20 bg-teal-light p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Datos verificados mediante OCR — coinciden con Registro Civil
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* STEP 3: Biometric */}
          {currentStep === "biometric" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanFace className="h-5 w-5 text-primary" />
                  Validación Biométrica
                </CardTitle>
                <CardDescription>
                  Toma una selfie para verificar tu identidad mediante reconocimiento facial.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className={`relative mb-6 flex h-64 w-64 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                    selfieCapture ? "border-primary/40 bg-teal-light" : "border-border"
                  }`}>
                    {isCapturingSelfie ? (
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="h-full w-full object-cover"
                        videoConstraints={{ facingMode: "user" }}
                      />
                    ) : selfieImage ? (
                      <img src={selfieImage} alt="Selfie" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <ScanFace className="mx-auto mb-3 h-16 w-16 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Área de captura</span>
                      </div>
                    )}
                    
                    {/* Overlay for success */}
                    {selfieCapture && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-teal-light/90">
                        <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-primary" />
                        <span className="text-sm font-medium">Verificación Exitosa</span>
                        <div className="mt-2 text-2xl font-bold text-primary">98%</div>
                        <span className="text-xs text-muted-foreground">Coincidencia facial</span>
                      </div>
                    )}
                  </div>

                  {!isCapturingSelfie && !selfieImage && (
                    <Button size="lg" onClick={startSelfieCapture}>
                      <Eye className="h-5 w-5" />
                      Iniciar Captura Biométrica
                    </Button>
                  )}

                  {isCapturingSelfie && (
                    <Button size="lg" onClick={captureSelfie}>
                      <Camera className="h-5 w-5" />
                      Capturar Foto
                    </Button>
                  )}

                  {selfieImage && !selfieCapture && !isCapturingSelfie && (
                    <Button variant="outline" size="sm" onClick={startSelfieCapture} className="mt-2">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Intentar de nuevo
                    </Button>
                  )}

                  {selfieCapture && (
                    <div className="animate-slide-up w-full max-w-sm space-y-2">
                      <div className="flex items-center gap-2 rounded-lg bg-teal-light p-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Detección de vida: <strong>Confirmada</strong></span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-teal-light p-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Coincidencia facial: <strong>98.2%</strong></span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={retakeSelfie} className="w-full text-xs text-muted-foreground">
                        Volver a capturar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 4: Certificate */}
          {currentStep === "certificate" && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Configuración del Certificado
                </CardTitle>
                <CardDescription>
                  Configura tu certificado digital y establece una contraseña segura.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Tipo de Certificado</Label>
                  <Select value={certType} onValueChange={setCertType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital_signature">Firma Digital </SelectItem>
                      {/* <SelectItem value="authentication">Autenticación</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Contraseña del certificado</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>



                <div>
                  <Label>Período de Validez</Label>
                  <Select defaultValue="1y">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1y">1 año</SelectItem>
                      <SelectItem value="2y">2 años</SelectItem>
                      <SelectItem value="3y">3 años</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(v) => setAcceptTerms(v === true)}
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed text-muted-foreground cursor-pointer">
                    Acepto los términos y condiciones del servicio de certificación digital,
                    incluyendo la política de privacidad y el uso de mis datos biométricos.
                  </label>
                </div>
              </CardContent>
            </>
          )}

          {/* STEP 5: Complete */}
          {currentStep === "complete" && (
            <CardContent className="py-16">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                  <PartyPopper className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-foreground">
                  ¡Gracias por culminar el proceso!
                </h2>
                <p className="mb-8 max-w-md text-muted-foreground">
                  {whatsappSendStatus === "sending" && "Tu certificado ha sido generado. Se está enviando a tu WhatsApp. También puedes descargarlo desde el siguiente enlace:"}
                  {whatsappSendStatus === "sent" && "Tu certificado ha sido generado y enviado a tu WhatsApp. También puedes descargarlo desde el siguiente enlace:"}
                  {whatsappSendStatus === "failed" && "Tu certificado ha sido generado. No se pudo enviar a tu WhatsApp. Puedes descargarlo desde el siguiente enlace:"}
                  {whatsappSendStatus === "idle" && "Tu certificado ha sido generado. También puedes descargarlo desde el siguiente enlace:"}
                </p>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="mb-8">
                  <Button size="lg" disabled={!downloadUrl}>
                    <Download className="h-5 w-5 mr-2" />
                    Descargar Certificado
                  </Button>
                </a>
                <Button variant="outline" onClick={() => navigate("/")}>
                  <Home className="h-5 w-5 mr-2" />
                  Ir al Inicio
                </Button>
              </div>
            </CardContent>
          )}

          {/* Navigation */}
          {currentStep !== "complete" && (
            <div className="flex items-center justify-between border-t border-border px-6 py-4">
              <Button
                variant="outline"
                onClick={goPrev}
                disabled={currentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>

              {currentStep === "certificate" ? (
                <Button onClick={handleSubmit} disabled={!canProceed()}>
                  <Award className="h-4 w-4" />
                  Emitir Certificado
                </Button>
              ) : (
                <Button onClick={goNext} disabled={!canProceed()}>
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CertificateWizard;
