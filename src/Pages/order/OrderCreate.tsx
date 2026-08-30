import { useOrderContext } from "@/contexts/order/UseOrderContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OrderForm from "./OrderForm";

const OrderCreate = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrderContext();

  return (
    <OrderForm
      title="Nuevo Pedido"
      submitLabel="Crear Pedido"
      onSubmit={async (dto) => {
        await createOrder(dto);
        toast.success("Pedido creado exitosamente");
        navigate("/order");
      }}
    />
  );
};

export default OrderCreate;
