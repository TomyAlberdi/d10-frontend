import type { CreateShipmentDTO, Shipment } from "@/interfaces/ShipmentInterfaces";
import { createContext } from "react";

export interface ShipmentContextType {
  getAllShipments: () => Promise<Shipment[]>;
  getShipmentById: (id: string) => Promise<Shipment | null>;
  searchShipments: (q: string) => Promise<Shipment[]>;
  createShipment: (dto: CreateShipmentDTO) => Promise<Shipment>;
  updateShipment: (id: string, dto: CreateShipmentDTO) => Promise<Shipment>;
  deleteShipment: (id: string) => Promise<void>;
}

export const ShipmentContext = createContext<ShipmentContextType | null>(null);
