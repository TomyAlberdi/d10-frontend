import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { formatPrice } from "@/lib/utils";
import { FileText, Package, ShoppingCart, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type QuickLink = {
  title: string;
  url: string;
  icon: ReactNode;
  /** Optional trailing content, mirroring the sidebar cart total. */
  badge?: ReactNode;
};

// Same destinations, labels and icons as the sidebar entries these tiles
// duplicate, so both menus stay recognizable as the same navigation.
export function HomeQuickAccess() {
  const { cart } = useCartContext();

  const quickLinks: QuickLink[] = [
    { title: "Productos", url: "/product", icon: <Package className="size-6" /> },
    { title: "Ventas", url: "/invoice", icon: <FileText className="size-6" /> },
    { title: "Caja", url: "/cash-register", icon: <Wallet className="size-6" /> },
    {
      title: "Carrito",
      url: "/cart",
      icon: <ShoppingCart className="size-6" />,
      badge: <Badge>$ {formatPrice(cart.total)}</Badge>,
    },
  ];

  return (
    <Card className="h-full p-5 md:p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold">Accesos rápidos</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {quickLinks.map((link) => (
          <Button
            key={link.url}
            asChild
            variant="outline"
            className="h-auto flex-col gap-2 py-6 md:py-8"
          >
            <Link to={link.url}>
              {link.icon}
              <span className="text-sm md:text-base font-medium">
                {link.title}
              </span>
              {link.badge}
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
}
