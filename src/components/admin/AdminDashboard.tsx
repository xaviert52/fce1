import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Search, Eye, RotateCcw, XCircle,
  CheckCircle2, Clock, AlertTriangle, FileX,
  Users, FileCheck, Activity, ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";

type ProcessStatus = "pending" | "in_progress" | "completed" | "failed" | "requires_review";

interface MockProcess {
  id: string;
  cedula: string;
  nombre: string;
  status: ProcessStatus;
  currentStep: string;
  updatedAt: string;
  admin?: string;
}

const mockProcesses: MockProcess[] = [
  { id: "P-001", cedula: "170****01", nombre: "Juan C. Rodríguez", status: "completed", currentStep: "certificate_issuance", updatedAt: "2026-02-24 10:30" },
  { id: "P-002", cedula: "171****52", nombre: "María L. Gómez", status: "in_progress", currentStep: "biometric_validation", updatedAt: "2026-02-24 09:15" },
  { id: "P-003", cedula: "172****83", nombre: "Carlos A. Mendoza", status: "requires_review", currentStep: "document_capture", updatedAt: "2026-02-23 16:45" },
  { id: "P-004", cedula: "173****14", nombre: "Ana P. Torres", status: "failed", currentStep: "biometric_validation", updatedAt: "2026-02-23 14:20" },
  { id: "P-005", cedula: "174****25", nombre: "Diego R. Salazar", status: "pending", currentStep: "data_collection", updatedAt: "2026-02-24 08:00" },
  { id: "P-006", cedula: "175****36", nombre: "Lucía M. Herrera", status: "completed", currentStep: "certificate_issuance", updatedAt: "2026-02-22 11:00" },
  { id: "P-007", cedula: "176****47", nombre: "Roberto F. Silva", status: "in_progress", currentStep: "data_collection", updatedAt: "2026-02-24 07:30", admin: "Admin-01" },
];

const statusConfig: Record<ProcessStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-muted text-muted-foreground", icon: Clock },
  in_progress: { label: "En Proceso", color: "bg-info/10 text-info", icon: Activity },
  completed: { label: "Completado", color: "bg-success/10 text-success", icon: CheckCircle2 },
  failed: { label: "Fallido", color: "bg-destructive/10 text-destructive", icon: FileX },
  requires_review: { label: "Requiere Revisión", color: "bg-warning/10 text-warning", icon: AlertTriangle },
};

const stepLabels: Record<string, string> = {
  data_collection: "Datos Personales",
  document_capture: "Captura Cédula",
  biometric_validation: "Biometría",
  certificate_issuance: "Emisión",
};

const AdminDashboard = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = mockProcesses.filter(p => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase()) && !p.cedula.includes(search)) return false;
    return true;
  });

  const stats = [
    { label: "Total Procesos", value: mockProcesses.length, icon: Users, color: "text-foreground" },
    { label: "Completados", value: mockProcesses.filter(p => p.status === "completed").length, icon: FileCheck, color: "text-success" },
    { label: "En Proceso", value: mockProcesses.filter(p => p.status === "in_progress").length, icon: Activity, color: "text-info" },
    { label: "Requieren Revisión", value: mockProcesses.filter(p => p.status === "requires_review").length, icon: ShieldAlert, color: "text-warning" },
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="mt-1 text-muted-foreground">Gestión y seguimiento de procesos de certificación</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(stat => (
            <Card key={stat.label} className="elevated-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="elevated-card mb-6">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o cédula..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_progress">En Proceso</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="failed">Fallidos</SelectItem>
                <SelectItem value="requires_review">Requiere Revisión</SelectItem>
              </SelectContent>
            </Select>
            <Link to="/proceso">
              <Button>+ Crear Proceso</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="elevated-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Paso Actual</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(process => {
                const st = statusConfig[process.status];
                return (
                  <TableRow key={process.id}>
                    <TableCell className="font-mono text-sm">{process.id}</TableCell>
                    <TableCell className="font-mono text-sm">{process.cedula}</TableCell>
                    <TableCell className="font-medium">{process.nombre}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stepLabels[process.currentStep] || process.currentStep}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${st.color} gap-1`}>
                        <st.icon className="h-3 w-3" />
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{process.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/proceso/${process.id}`}>
                          <Button variant="ghost" size="icon" title="Ver detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {process.status === "failed" && (
                          <Button variant="ghost" size="icon" title="Reintentar">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {process.status === "requires_review" && (
                          <Button variant="ghost" size="icon" title="Rechazar">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
