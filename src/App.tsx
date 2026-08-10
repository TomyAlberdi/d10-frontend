import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./components/app-layout";
import { TooltipProvider } from "./components/ui/tooltip";
import CartContextComponent from "./contexts/cart/CartContextComponent";
import CashRegisterContextComponent from "./contexts/cashRegister/CashRegisterContextComponent";
import ClientContextComponent from "./contexts/client/ClientContextComponent";
import ContactContextComponent from "./contexts/contact/ContactContextComponent";
import DataContextComponent from "./contexts/data/DataContextComponent";
import InvoiceContextComponent from "./contexts/invoice/InvoiceContextComponent";
import NoteContextComponent from "./contexts/note/NoteContextComponent";
// Pedidos: feature not ready to deploy. The pages and context live in
// src/Pages/order and src/contexts/order; uncomment here and in app-sidebar.tsx
// and app-breadcrumb.tsx to bring it back.
// import OrderContextComponent from "./contexts/order/OrderContextComponent";
import PackContextComponent from "./contexts/pack/PackContextComponent";
import ShipmentContextComponent from "./contexts/shipment/ShipmentContextComponent";
import StockLogContextComponent from "./contexts/stockLog/StockLogContextComponent";
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
import ContactCreate from "./Pages/contact/ContactCreate";
import Contacts from "./Pages/contact/Contacts";
import ContactsList from "./Pages/contact/ContactsList";
import ContactUpdate from "./Pages/contact/ContactUpdate";
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
// Pedidos: see the note next to the OrderContextComponent import above.
// import OrderCreate from "./Pages/order/OrderCreate";
// import Orders from "./Pages/order/Orders";
// import OrdersList from "./Pages/order/OrdersList";
// import OrderUpdate from "./Pages/order/OrderUpdate";
import PackAddToCart from "./Pages/pack/PackAddToCart";
import PackCreate from "./Pages/pack/PackCreate";
import PacksList from "./Pages/pack/PacksList";
import PackUpdate from "./Pages/pack/PackUpdate";
import ShipmentCreate from "./Pages/shipment/ShipmentCreate";
import Shipments from "./Pages/shipment/Shipments";
import ShipmentsList from "./Pages/shipment/ShipmentsList";
import ShipmentUpdate from "./Pages/shipment/ShipmentUpdate";
import StockLogs from "./Pages/stockLog/StockLogs";
import StockLogsList from "./Pages/stockLog/StockLogsList";
import DiscontinuedProductList from "./Pages/product/DiscontinuedProductList";
import ProductAddToCart from "./Pages/product/ProductAddToCart";
import ProductCreate from "./Pages/product/ProductCreate";
import ProductDetail from "./Pages/product/ProductDetail";
import ProductList from "./Pages/product/ProductList";
import Products from "./Pages/product/Products";
import ProductStockList from "./Pages/product/ProductStockList";
import ProductStockRecords from "./Pages/product/ProductStockRecords";
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
              <ContactContextComponent>
              <InvoiceContextComponent>
                <CashRegisterContextComponent>
                  <DataContextComponent>
                    <NoteContextComponent>
                      <PackContextComponent>
                      <ShipmentContextComponent>
                      <StockLogContextComponent>
                      {/* Pedidos: <OrderContextComponent> disabled until the feature is ready */}
                      <Routes>
                        <Route element={<AppLayout />}>
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
                          <Route
                            path=":id/stock-records"
                            element={<ProductStockRecords />}
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
                          <Route path="packs" element={<PacksList />} />
                          <Route path="packs/create" element={<PackCreate />} />
                          <Route path="packs/:id" element={<PackUpdate />} />
                          <Route path="packs/:id/add" element={<PackAddToCart />} />
                        </Route>
                        <Route path="/client" element={<Clients />}>
                          <Route index element={<ClientsList />} />
                          <Route path="create" element={<ClientCreate />} />
                          <Route path=":id/update" element={<ClientUpdate />} />
                        </Route>
                        <Route path="/contact" element={<Contacts />}>
                          <Route index element={<ContactsList />} />
                          <Route path="create" element={<ContactCreate />} />
                          <Route path=":id/update" element={<ContactUpdate />} />
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
                        <Route path="/shipment" element={<Shipments />}>
                          <Route index element={<ShipmentsList />} />
                          <Route path="create" element={<ShipmentCreate />} />
                          <Route path=":id" element={<ShipmentUpdate />} />
                        </Route>
                        <Route path="/stock-log" element={<StockLogs />}>
                          <Route index element={<StockLogsList />} />
                        </Route>
                        {/* Pedidos: routes disabled until the feature is ready
                        <Route path="/order" element={<Orders />}>
                          <Route index element={<OrdersList />} />
                          <Route path="create" element={<OrderCreate />} />
                          <Route path=":id" element={<OrderUpdate />} />
                        </Route>
                        */}

                        </Route>
                      </Routes>
                      </StockLogContextComponent>
                      </ShipmentContextComponent>
                      </PackContextComponent>
                      </NoteContextComponent>
                    </DataContextComponent>
                </CashRegisterContextComponent>
              </InvoiceContextComponent>
              </ContactContextComponent>
            </ClientContextComponent>
          </CartContextComponent>
        </ProductContextComponent>
      </TooltipProvider>
    </Router>
  );
}

export default App;
