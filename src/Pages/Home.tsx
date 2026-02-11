import { Button } from "@/components/ui/button";
import { FileText, Package, ShoppingCart, Users, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-foreground mb-12 text-center alternate-font">
        Diseño 10 Olavarría - Administración
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" asChild className="h-25 w-64">
          <Link to="/product" className="flex items-center gap-3 text-xl">
            <Package className="big-icon" />
            Productos
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-64">
          <Link to="/client" className="flex items-center gap-3 text-xl">
            <Users className="big-icon" />
            Clientes
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-64">
          <Link to="/invoice" className="flex items-center gap-3 text-xl">
            <FileText className="big-icon" />
            Presupuestos
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-64">
          <Link to="/cart" className="flex items-center gap-3 text-xl">
            <ShoppingCart className="big-icon" />
            Carrito
          </Link>
        </Button>
        <Button size="lg" asChild className="h-25 w-64">
          <Link
            to="/cash-register"
            className="flex items-center gap-3 text-xl"
          >
            <Wallet className="big-icon" />
            Caja
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Home;
