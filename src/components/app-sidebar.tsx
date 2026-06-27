import {
  Boxes,
  ChartNoAxesCombined,
  CirclePlus,
  Database,
  FileText,
  GalleryVerticalEndIcon,
  List,
  ListOrdered,
  Package,
  ShoppingCart,
  StickyNote,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
// import { NavUser } from "@/components/nav-user" // TODO: enable once the user/profile section is implemented
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarFooter, // TODO: re-enable together with NavUser
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useCartContext } from "@/contexts/cart/UseCartContext";
import { formatPrice } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";

// Navigation tree for the d10 admin. Icons are reused from the previous
// navigation menus (home buttons + per-section side menus).
const data = {
  navMain: [
    {
      title: "Productos",
      url: "/product",
      icon: <Package />,
      items: [
        { title: "Lista", url: "/product", icon: <ListOrdered /> },
        { title: "Stock", url: "/product/stock", icon: <Package /> },
        { title: "Packs", url: "/product/packs", icon: <Boxes /> },
        {
          title: "Eliminados",
          url: "/product/discontinued",
          icon: <XCircle />,
        },
        { title: "Crear", url: "/product/create", icon: <CirclePlus /> },
        {
          title: "Precios",
          url: "/product/update-price",
          icon: <TrendingUp />,
        },
      ],
    },
    {
      title: "Clientes",
      url: "/client",
      icon: <Users />,
      items: [
        { title: "Lista", url: "/client", icon: <ListOrdered /> },
        { title: "Crear", url: "/client/create", icon: <CirclePlus /> },
      ],
    },
    {
      title: "Ventas",
      url: "/invoice",
      icon: <FileText />,
    },
    {
      title: "Caja",
      url: "/cash-register",
      icon: <Wallet />,
      items: [
        { title: "Resumen", url: "/cash-register", icon: <Wallet /> },
        {
          title: "Transacciones",
          url: "/cash-register/transactions",
          icon: <List />,
        },
        {
          title: "Ajustar saldo",
          url: "/cash-register/adjust",
          icon: <CirclePlus />,
        },
      ],
    },
    {
      title: "Datos",
      url: "/data",
      icon: <Database />,
      desktopOnly: true,
      items: [
        { title: "Ingresos", url: "/data", icon: <ChartNoAxesCombined /> },
      ],
    },
    {
      title: "Notas",
      url: "/note",
      icon: <StickyNote />,
      items: [
        { title: "Lista", url: "/note", icon: <ListOrdered /> },
        { title: "Crear", url: "/note/create", icon: <CirclePlus /> },
      ],
    },
    // Envíos: the route exists but is currently disabled in the home menu.
    // Uncomment to bring it back into the sidebar.
    // {
    //   title: "Envíos",
    //   url: "/shipment",
    //   icon: <Truck />,
    //   items: [
    //     { title: "Lista", url: "/shipment", icon: <ListOrdered /> },
    //     { title: "Crear", url: "/shipment/create", icon: <CirclePlus /> },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { cart } = useCartContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEndIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Diseño 10</span>
                  <span className="truncate text-xs">Administración</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ShoppingCart className="size-4" />
                </div>
                <div className="text-sm leading-tight flex w-full justify-between items-center">
                  <span className="font-semibold">Carrito</span>
                  <Badge>$ {formatPrice(cart.total)}</Badge>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
