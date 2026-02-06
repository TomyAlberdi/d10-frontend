import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import FloatingBackButton from "./components/FloatingBackButton";
import { Toaster } from "./components/ui/sonner";
import ProductContextComponent from "./contexts/product/ProductContextComponent";
import Clients from "./Pages/Clients";
import Home from "./Pages/Home";
import Invoices from "./Pages/Invoices";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductUpdate from "./Pages/product/ProductUpdate";
import Providers from "./Pages/Providers";

export function App() {
  return (
    <Router>
      <FloatingBackButton />
      <Toaster />
      <ProductContextComponent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Products />}>
            <Route index element={<ProductList />} />
            <Route path="create" element={<ProductCreate />} />
            <Route path=":id" element={<ProductDetail />} />
            <Route path=":id/update" element={<ProductUpdate />} />
          </Route>
          <Route path="/client" element={<Clients />} />
          <Route path="/invoice" element={<Invoices />} />
          <Route path="/provider" element={<Providers />} />
        </Routes>
      </ProductContextComponent>
    </Router>
  );
}

export default App;
