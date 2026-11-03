import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEndIcon } from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "d10_authenticated";

function readAuthenticated() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Keeps the app behind the password in VITE_PASSWORD. Unlocking lasts for the
 * tab's session (sessionStorage), so closing the tab locks it again.
 */
export function PasswordProtection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(readAuthenticated);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_PASSWORD;

    if (correctPassword && password === correctPassword) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // ignore storage errors
      }
      setPassword("");
      setError("");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <Card className="w-96 max-w-full gap-4 p-6">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Diseño 10</span>
            <span className="truncate text-xs text-muted-foreground">
              Ingresá la contraseña para continuar
            </span>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full">
            Ingresar
          </Button>
        </form>
      </Card>
    </div>
  );
}
