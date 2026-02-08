import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import FloatingBackButton from "./components/FloatingBackButton";
import { Toaster } from "./components/ui/sonner";
import CartContextComponent from "./contexts/cart/CartContextComponent";
import ClientContextComponent from "./contexts/client/ClientContextComponent";
import InvoiceContextComponent from "./contexts/invoice/InvoiceContextComponent";
import ProductContextComponent from "./contexts/product/ProductContextComponent";
import ClientCreate from "./Pages/client/ClientCreate";
import ClientUpdate from "./Pages/client/ClientUpdate";
import Home from "./Pages/Home";
import Invoices from "./Pages/Invoices";
import ProductAddToCart from "./Pages/product/ProductAddToCart";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductUpdate from "./Pages/product/ProductUpdate";
import Providers from "./Pages/Providers";
import Cart from "./Pages/cart/Cart";
import ClientsList from "./Pages/client/ClientsList";
import Clients from "./Pages/client/Clients";

export function App() {
  return (
    <Router>
      <FloatingBackButton />
      <Toaster />
      <ProductContextComponent>
        <CartContextComponent>
          <ClientContextComponent>
            <InvoiceContextComponent>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<Products />}>
                  <Route index element={<ProductList />} />
                  <Route path="create" element={<ProductCreate />} />
                  <Route path="add/:productId" element={<ProductAddToCart />} />
                  <Route path=":id" element={<ProductDetail />} />
                  <Route path=":id/update" element={<ProductUpdate />} />
                </Route>
                <Route path="/client" element={<Clients />}>
                  <Route index element={<ClientsList />} />
                  <Route path="create" element={<ClientCreate />} />
                  <Route path=":id/update" element={<ClientUpdate />} />
                </Route>
                <Route path="/cart" element={<Cart />} />
                <Route path="/client/create" element={<ClientCreate />} />
                <Route path="/invoice" element={<Invoices />} />
                <Route path="/provider" element={<Providers />} />
              </Routes>
            </InvoiceContextComponent>
          </ClientContextComponent>
        </CartContextComponent>
      </ProductContextComponent>
    </Router>
  );
}

export default App;
