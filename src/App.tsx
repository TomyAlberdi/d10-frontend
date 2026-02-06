import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Clients from "./Pages/Clients";
import Home from "./Pages/Home";
import Invoices from "./Pages/Invoices";
import Products from "./Pages/Products";
import Providers from "./Pages/Providers";
import FloatingBackButton from "./components/FloatingBackButton";
import { Toaster } from "./components/ui/sonner";

export function App() {
  return (
    <Router>
      <FloatingBackButton />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Products />} />
        <Route path="/client" element={<Clients />} />
        <Route path="/invoice" element={<Invoices />} />
        <Route path="/provider" element={<Providers />} />
      </Routes>
    </Router>
  );
}

export default App;
