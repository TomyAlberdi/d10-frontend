export interface Shipment {
  id: string;
  clientName: string;
  address: string;
  city: string;
  phone: string;
  invoice: string;
  partialAmount: number | null;
  finalAmount: number | null;
  details: string;
}

export interface CreateShipmentDTO {
  clientName: string;
  address: string;
  city: string;
  phone: string;
  invoice: string;
  partialAmount: number | null;
  finalAmount: number | null;
  details: string;
}
