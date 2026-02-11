import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import FloatingBackButton from "./components/FloatingBackButton";
import { Toaster } from "./components/ui/sonner";
import CartContextComponent from "./contexts/cart/CartContextComponent";
import CashRegisterContextComponent from "./contexts/cashRegister/CashRegisterContextComponent";
import ClientContextComponent from "./contexts/client/ClientContextComponent";
import InvoiceContextComponent from "./contexts/invoice/InvoiceContextComponent";
import ProductContextComponent from "./contexts/product/ProductContextComponent";
import ClientCreate from "./Pages/client/ClientCreate";
import ClientUpdate from "./Pages/client/ClientUpdate";
import Home from "./Pages/Home";
import Invoices from "./Pages/invoice/Invoices";
import UpdateInvoice from "./Pages/invoice/UpdateInvoice";
import Cart from "./Pages/cart/Cart";
import ClientsList from "./Pages/client/ClientsList";
import Clients from "./Pages/client/Clients";
import CashRegister from "./Pages/cashRegister/CashRegister";
import CashRegisterOverview from "./Pages/cashRegister/CashRegisterOverview";
import CashRegisterAdjust from "./Pages/cashRegister/CashRegisterAdjust";
import ProductAddToCart from "./Pages/product/ProductAddToCart";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductUpdate from "./Pages/product/ProductUpdate";
import UpdateProductStock from "./Pages/product/UpdateProductStock";

const DESKTOP_MIN_WIDTH = 1024;

function MobileTabletMessage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        textAlign: "center",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      <p style={{ fontSize: "1.125rem", maxWidth: "24rem" }}>
        Aplicación no disponible para dispositivos móviles.
      </p>
    </div>
  );
}

export function App() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!isDesktop) {
    return <MobileTabletMessage />;
  }

  return (
    <Router>
      <FloatingBackButton />
      <Toaster />
      <ProductContextComponent>
        <CartContextComponent>
          <ClientContextComponent>
            <InvoiceContextComponent>
              <CashRegisterContextComponent>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product" element={<Products />}>
                    <Route index element={<ProductList />} />
                    <Route path="create" element={<ProductCreate />} />
                    <Route path="add/:productId" element={<ProductAddToCart />} />
                    <Route path=":id" element={<ProductDetail />} />
                    <Route path=":id/update" element={<ProductUpdate />} />
                    <Route path=":id/stock" element={<UpdateProductStock />} />
                  </Route>
                  <Route path="/client" element={<Clients />}>
                    <Route index element={<ClientsList />} />
                    <Route path="create" element={<ClientCreate />} />
                    <Route path=":id/update" element={<ClientUpdate />} />
                  </Route>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/client/create" element={<ClientCreate />} />
                  <Route path="/invoice" element={<Invoices />} />
                  <Route path="/invoice/:id/update" element={<UpdateInvoice />} />
                  <Route path="/cash-register" element={<CashRegister />}>
                    <Route index element={<CashRegisterOverview />} />
                    <Route path="adjust" element={<CashRegisterAdjust />} />
                  </Route>
                </Routes>
              </CashRegisterContextComponent>
            </InvoiceContextComponent>
          </ClientContextComponent>
        </CartContextComponent>
      </ProductContextComponent>
    </Router>
  );
}

export default App;
