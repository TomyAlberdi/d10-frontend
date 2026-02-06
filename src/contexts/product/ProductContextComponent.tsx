import type {
  CreateProduct,
  PaginatedResult,
  PartialProduct,
  Product,
  ProductStockRecord,
} from "@/interfaces/ProductInterfaces";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProductContext, type ProductContextType } from "./ProductContext";

interface ProductContextComponentProps {
  children: ReactNode;
}

const ProductContextComponent: React.FC<ProductContextComponentProps> = ({
  children,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const getProductById = async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Product;
  };

  const listProducts = async (
    query: string | null,
    page: number | null,
    size: number | null,
  ) => {
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (page !== null) params.append("page", page.toString());
    if (size !== null) params.append("size", size.toString());

    const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;
    const response = await fetch(url);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as PaginatedResult<PartialProduct>;
  };

  const createProduct = async (dto: CreateProduct) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return;
  };

  const updateProduct = async (id: string, dto: CreateProduct) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return;
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    navigate(-1);
    return;
  };

  const updateProductDiscontinued = async (
    id: string,
    discontinued: boolean,
  ) => {
    const response = await fetch(
      `${API_URL}/${id}?discontinued=${discontinued}`,
      {
        method: "PATCH",
      },
    );
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return;
  };

  const updateProductStock = async (id: string, record: ProductStockRecord) => {
    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return;
  };

  const exportData: ProductContextType = {
    getProductById,
    listProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductDiscontinued,
    updateProductStock,
  };

  return (
    <ProductContext.Provider value={exportData}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContextComponent;
