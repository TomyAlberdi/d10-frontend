import { Button } from "@/components/ui/button";
import { isBackendReachable } from "@/lib/utils";
import {
  Database,
  FileText,
  Package,
  ShoppingCart,
  StickyNote,
  Truck,
  Users,
  Wallet,
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      {/* show banner when backend is down */}
      {backendAvailable === false && (
        <div className="w-full bg-red-600 text-white py-2 text-center mb-4">
          <p>Servidor desconectado. Por favor inténtalo más tarde.</p>
        </div>
      )}

      <h1 className="text-4xl font-bold text-foreground mb-12 text-center alternate-font">
        Diseño 10 Olavarría <br /> Administración
      </h1>
      <div className="md:grid flex flex-col grid-cols-2 gap-4 w-full md:w-auto">
        <Button size="lg" asChild className="h-25 w-full md:w-64">
          <Link to="/product" className="flex items-center gap-3 text-xl">
            <Package className="big-icon" />
            Productos
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-full md:w-64">
          <Link to="/client" className="flex items-center gap-3 text-xl">
            <Users className="big-icon" />
            Clientes
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-full md:w-64">
          <Link to="/invoice" className="flex items-center gap-3 text-xl">
            <FileText className="big-icon" />
            Ventas
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-full md:w-64">
          <Link to="/cart" className="flex items-center gap-3 text-xl">
            <ShoppingCart className="big-icon" />
            Carrito
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 col-span-2">
          <Link to="/cash-register" className="flex items-center gap-3 text-xl">
            <Wallet className="big-icon" />
            Caja
          </Link>
        </Button>
        <Button
          size="lg"
          asChild
          className="h-25 w-full md:w-64 hidden md:flex"
        >
          <Link to="/data" className="flex items-center gap-3 text-xl">
            <Database className="big-icon" />
            Datos
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-full md:w-64">
          <Link to="/note" className="flex items-center gap-3 text-xl">
            <StickyNote className="big-icon" />
            Notas
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 col-span-2">
          <Link to="/shipment" className="flex items-center gap-3 text-xl">
            <Truck className="big-icon" />
            Envíos Diseño 10
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
