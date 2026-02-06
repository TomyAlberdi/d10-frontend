import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import ProductContextComponent from "./contexts/product/ProductContextComponent.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="d10-theme">
      <ProductContextComponent>
        <App />
      </ProductContextComponent>
    </ThemeProvider>
  </StrictMode>,
);
