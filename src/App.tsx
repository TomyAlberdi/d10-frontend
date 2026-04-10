import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import CartContextComponent from "./contexts/cart/CartContextComponent";
import CashRegisterContextComponent from "./contexts/cashRegister/CashRegisterContextComponent";
import ClientContextComponent from "./contexts/client/ClientContextComponent";
import DataContextComponent from "./contexts/data/DataContextComponent";
import InvoiceContextComponent from "./contexts/invoice/InvoiceContextComponent";
import ProductContextComponent from "./contexts/product/ProductContextComponent";
import WarehouseContextComponent from "./contexts/warehouse/WarehouseContextComponent";
import Cart from "./Pages/cart/Cart";
import CashRegister from "./Pages/cashRegister/CashRegister";
import CashRegisterAdjust from "./Pages/cashRegister/CashRegisterAdjust";
import CashRegisterInvoiceTransaction from "./Pages/cashRegister/CashRegisterInvoiceTransaction";
import CashRegisterOverview from "./Pages/cashRegister/CashRegisterOverview";
import CashRegisterTransactionsPaginated from "./Pages/cashRegister/CashRegisterTransactionsPaginated";
import ClientCreate from "./Pages/client/ClientCreate";
import Clients from "./Pages/client/Clients";
import ClientsList from "./Pages/client/ClientsList";
import ClientUpdate from "./Pages/client/ClientUpdate";
import Data from "./Pages/data/Data";
import MainData from "./Pages/data/MainData";
import Home from "./Pages/Home";
import InvoiceDetail from "./Pages/invoice/InvoiceDetail";
import Invoices from "./Pages/invoice/Invoices";
import InvoicesByProduct from "./Pages/invoice/InvoicesByProduct";
import UpdateInvoice from "./Pages/invoice/UpdateInvoice";
import DiscontinuedProductList from "./Pages/product/DiscontinuedProductList";
import ProductAddToCart from "./Pages/product/ProductAddToCart";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductStockList from "./Pages/product/ProductStockList";
import ProductUpdate from "./Pages/product/ProductUpdate";
import UpdateProductStock from "./Pages/product/UpdateProductStock";
import Warehouse from "./Pages/warehouse/Warehouse";
import WarehouseCellAssign from "./Pages/warehouse/WarehouseCellAssign";
import WarehouseGrid from "./Pages/warehouse/WarehouseGrid";

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
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches,
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
      <Toaster />
      <TooltipProvider>
        <ProductContextComponent>
          <CartContextComponent>
            <ClientContextComponent>
              <InvoiceContextComponent>
                <CashRegisterContextComponent>
                  <WarehouseContextComponent>
                    <DataContextComponent>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/product" element={<Products />}>
                          <Route index element={<ProductList />} />
                          <Route path="create" element={<ProductCreate />} />
                          <Route
                            path="add/:productId"
                            element={<ProductAddToCart />}
                          />
                          <Route path=":id" element={<ProductDetail />} />
                          <Route
                            path=":id/update"
                            element={<ProductUpdate />}
                          />
                          <Route
                            path=":id/stock"
                            element={<UpdateProductStock />}
                          />
                          <Route path="stock" element={<ProductStockList />} />
                          <Route
                            path="discontinued"
                            element={<DiscontinuedProductList />}
                          />
                        </Route>
                        <Route path="/client" element={<Clients />}>
                          <Route index element={<ClientsList />} />
                          <Route path="create" element={<ClientCreate />} />
                          <Route path=":id/update" element={<ClientUpdate />} />
                        </Route>
                        <Route path="/cart" element={<Cart />} />
                        <Route
                          path="/client/create"
                          element={<ClientCreate />}
                        />
                        <Route path="/invoice" element={<Invoices />} />
                        <Route
                          path="/invoice/:id"
                          element={<InvoiceDetail />}
                        />
                        <Route
                          path="/invoice/:id/update"
                          element={<UpdateInvoice />}
                        />
                        <Route
                          path="/invoices-by-product/:productId"
                          element={<InvoicesByProduct />}
                        />
                        <Route path="/cash-register" element={<CashRegister />}>
                          <Route index element={<CashRegisterOverview />} />
                          <Route
                            path="adjust"
                            element={<CashRegisterAdjust />}
                          />
                          <Route
                            path="transactions"
                            element={<CashRegisterTransactionsPaginated />}
                          />
                          <Route
                            path="invoice-transaction"
                            element={<CashRegisterInvoiceTransaction />}
                          />
                        </Route>
                        <Route path="/data" element={<Data />}>
                          <Route index element={<MainData />} />
                        </Route>
                        <Route path="/warehouse" element={<Warehouse />}>
                          <Route index element={<WarehouseGrid />} />
                          <Route
                            path="cell/:row/:column"
                            element={<WarehouseCellAssign />}
                          />
                        </Route>
                      </Routes>
                    </DataContextComponent>
                  </WarehouseContextComponent>
                </CashRegisterContextComponent>
              </InvoiceContextComponent>
            </ClientContextComponent>
          </CartContextComponent>
        </ProductContextComponent>
      </TooltipProvider>
    </Router>
  );
}

export default App;
