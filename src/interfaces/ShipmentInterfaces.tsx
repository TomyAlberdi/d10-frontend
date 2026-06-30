export interface Shipment {
  id: string;
  clientName: string;
  address: string;
  city: string;
  phone: string;
  invoice: string;
  finalAmount: number | null;
  details: string;
  claim: boolean;
  shipmentDate: string | null;
}

export interface CreateShipmentDTO {
  clientName: string;
  address: string;
  city: string;
  phone: string;
  invoice: string;
  finalAmount: number | null;
  details: string;
  claim: boolean;
  shipmentDate: string | null;
}
