import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
import CartContextComponent from "./contexts/cart/CartContextComponent";
import CashRegisterContextComponent from "./contexts/cashRegister/CashRegisterContextComponent";
import ClientContextComponent from "./contexts/client/ClientContextComponent";
import DataContextComponent from "./contexts/data/DataContextComponent";
import InvoiceContextComponent from "./contexts/invoice/InvoiceContextComponent";
import NoteContextComponent from "./contexts/note/NoteContextComponent";
import ProductContextComponent from "./contexts/product/ProductContextComponent";
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
import NoteCreate from "./Pages/note/NoteCreate";
import Notes from "./Pages/note/Notes";
import NotesList from "./Pages/note/NotesList";
import NoteUpdate from "./Pages/note/NoteUpdate";
import DiscontinuedProductList from "./Pages/product/DiscontinuedProductList";
import ProductAddToCart from "./Pages/product/ProductAddToCart";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductStockList from "./Pages/product/ProductStockList";
import ProductUpdate from "./Pages/product/ProductUpdate";
import UpdatePrice from "./Pages/product/UpdatePrice";
import UpdateProductStock from "./Pages/product/UpdateProductStock";
export function App() {
  return (
    <Router>
      <TooltipProvider>
        <ProductContextComponent>
          <CartContextComponent>
            <ClientContextComponent>
              <InvoiceContextComponent>
                <CashRegisterContextComponent>
                  <DataContextComponent>
                    <NoteContextComponent>
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
                          <Route
                            path="update-price"
                            element={<UpdatePrice />}
                          />
                        </Route>
                        <Route path="/client" element={<Clients />}>
                          <Route index element={<ClientsList />} />
                          <Route path="create" element={<ClientCreate />} />
                          <Route path=":id/update" element={<ClientUpdate />} />
                        </Route>
                        <Route path="/cart" element={<Cart />} />
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
                        <Route path="/note" element={<Notes />}>
                          <Route index element={<NotesList />} />
                          <Route path="create" element={<NoteCreate />} />
                          <Route path=":id" element={<NoteUpdate />} />
                        </Route>
                      </Routes>
                      </NoteContextComponent>
                    </DataContextComponent>
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
