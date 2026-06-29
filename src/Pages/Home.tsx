import { Button } from "@/components/ui/button";
import { isBackendReachable } from "@/lib/utils";
import {
  Database,
  FileText,
  Package,
  ShoppingCart,
  StickyNote,
  Users,
  Wallet
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Home = () => {
  const [backendAvailable, setBackendAvailable] = useState<boolean>(true);

  useEffect(() => {
    async function checkBackend() {
      const available = await isBackendReachable();
      if (available) {
        setBackendAvailable(true);
      } else {
        setBackendAvailable(false);
        toast.error(
          "El servidor de back-end no está disponible. Algunas funciones pueden no funcionar.",
        );
      }
    }
    checkBackend();
  }, []);

  return (
    <div className="h-full bg-background flex flex-col items-center justify-center p-8">
      {/* show banner when backend is down */}
      {backendAvailable === false && (
        <div className="w-full bg-red-600 text-white py-2 text-center mb-4">
          <p>Servidor desconectado. Por favor inténtalo más tarde.</p>
        </div>
      )}
      <h1 className="text-4xl font-bold text-foreground mb-12 text-center alternate-font">
        Diseño 10 Olavarría <br /> Administración
      </h1>
    </div>
  );
};

export default Home;
