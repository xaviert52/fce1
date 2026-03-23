import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Menu, X, User, LogIn, UserPlus, KeyRound } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

type AuthView = "login" | "register" | "recover";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authView === "recover") {
      toast.success("Se ha enviado un enlace de recuperación a tu correo.");
    } else {
      toast.success(authView === "login" ? "Sesión iniciada correctamente" : "Cuenta creada correctamente");
    }
    setAuthOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">CertiBio</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link to="/">
            <Button variant="ghost" size="sm" className={location.pathname === "/" ? "text-primary" : ""}>
              Inicio
            </Button>
          </Link>
          <Link to="/proceso">
            <Button variant="ghost" size="sm" className={location.pathname === "/proceso" ? "text-primary" : ""}>
              Solicitar Certificado
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className={isAdmin ? "text-primary" : ""}>
              Administración
            </Button>
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/proceso">
            <Button size="sm">Iniciar Proceso</Button>
          </Link>
          <Popover open={authOpen} onOpenChange={setAuthOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4" />
                Acceder
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-foreground">
                    {authView === "login" && "Iniciar Sesión"}
                    {authView === "register" && "Crear Cuenta"}
                    {authView === "recover" && "Recuperar Contraseña"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {authView === "recover"
                      ? "Ingresa tu correo para recibir un enlace"
                      : "Accede al sistema de certificación"}
                  </p>
                </div>

                {authView !== "recover" && (
                  <>
                    <div>
                      <Label className="text-xs">Correo Electrónico</Label>
                      <Input type="email" placeholder="tu@email.com" className="mt-1 h-9" required />
                    </div>
                    <div>
                      <Label className="text-xs">Contraseña</Label>
                      <Input type="password" placeholder="••••••••" className="mt-1 h-9" required />
                    </div>
                  </>
                )}

                {authView === "register" && (
                  <div>
                    <Label className="text-xs">Confirmar Contraseña</Label>
                    <Input type="password" placeholder="••••••••" className="mt-1 h-9" required />
                  </div>
                )}

                {authView === "recover" && (
                  <div>
                    <Label className="text-xs">Correo Electrónico</Label>
                    <Input type="email" placeholder="tu@email.com" className="mt-1 h-9" required />
                  </div>
                )}

                <Button type="submit" className="w-full" size="sm">
                  {authView === "login" && <><LogIn className="h-4 w-4" /> Entrar</>}
                  {authView === "register" && <><UserPlus className="h-4 w-4" /> Registrarse</>}
                  {authView === "recover" && <><KeyRound className="h-4 w-4" /> Enviar Enlace</>}
                </Button>

                <div className="flex flex-col items-center gap-1 text-xs">
                  {authView === "login" && (
                    <>
                      <button type="button" className="text-primary hover:underline" onClick={() => setAuthView("recover")}>
                        ¿Olvidaste tu contraseña?
                      </button>
                      <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setAuthView("register")}>
                        ¿No tienes cuenta? <span className="text-primary">Regístrate</span>
                      </button>
                    </>
                  )}
                  {authView === "register" && (
                    <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setAuthView("login")}>
                      ¿Ya tienes cuenta? <span className="text-primary">Inicia sesión</span>
                    </button>
                  )}
                  {authView === "recover" && (
                    <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setAuthView("login")}>
                      Volver a <span className="text-primary">iniciar sesión</span>
                    </button>
                  )}
                </div>
              </form>
            </PopoverContent>
          </Popover>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden animate-slide-up">
          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Inicio</Button>
            </Link>
            <Link to="/proceso" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Solicitar Certificado</Button>
            </Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Administración</Button>
            </Link>
            <Link to="/proceso" onClick={() => setMobileOpen(false)}>
              <Button className="w-full mt-2">Iniciar Proceso</Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); setAuthOpen(true); }}>
              <User className="h-4 w-4" />
              Acceder
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
