import type { CreateShipmentDTO, Shipment } from "@/interfaces/ShipmentInterfaces";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { ShipmentContext, type ShipmentContextType } from "./ShipmentContext";

const API_URL = `${import.meta.env.VITE_BASE_API_URL}/shipment`;

interface ShipmentContextComponentProps {
  children: ReactNode;
}

const ShipmentContextComponent: React.FC<ShipmentContextComponentProps> = ({
  children,
}) => {
  const getAllShipments = async (date: string | null): Promise<Shipment[]> => {
    if (!date) return [];
    const response = await fetch(`${API_URL}?date=${encodeURIComponent(date)}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Shipment[];
  };

  const getShipmentById = async (id: string): Promise<Shipment | null> => {
    const response = await fetch(`${API_URL}/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Shipment;
  };

  const searchShipments = async (q: string): Promise<Shipment[]> => {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`);
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Shipment[];
  };

  const createShipment = async (dto: CreateShipmentDTO): Promise<Shipment> => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Shipment;
  };

  const updateShipment = async (
    id: string,
    dto: CreateShipmentDTO,
  ): Promise<Shipment> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
    return (await response.json()) as Shipment;
  };

  const deleteShipment = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error(`Error: ${response.status}`);
      throw new Error(`HTTP Error: ${response.status}`);
    }
  };

  const exportData: ShipmentContextType = {
    getAllShipments,
    getShipmentById,
    searchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
  };

  return (
    <ShipmentContext.Provider value={exportData}>
      {children}
    </ShipmentContext.Provider>
  );
};

export default ShipmentContextComponent;
