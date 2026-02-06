import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Clients from "./Pages/Clients";
import Home from "./Pages/Home";
import Invoices from "./Pages/Invoices";
import ProductCreate from "./Pages/ProductCreate";
import ProductDetail from "./Pages/ProductDetail";
import ProductList from "./Pages/ProductList";
import ProductMenu from "./Pages/ProductMenu";
import ProductUpdate from "./Pages/ProductUpdate";
import Products from "./Pages/Products";
import Providers from "./Pages/Providers";
import FloatingBackButton from "./components/FloatingBackButton";
import { Toaster } from "./components/ui/sonner";
import ProductContextComponent from "./contexts/product/ProductContextComponent";

export function App() {
  return (
    <Router>
      <FloatingBackButton />
      <Toaster />
      <ProductContextComponent>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Products />}>
            <Route index element={<ProductMenu />} />
            <Route path="list" element={<ProductList />} />
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
