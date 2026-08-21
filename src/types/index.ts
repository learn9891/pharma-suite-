export type MedicineDTO = {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  batchNo: string;
  hsnCode: string;
  unitPrice: number;
  gstRate: number;
  stockQty: number;
  reorderLevel: number;
  expiryDate: string;
  rxRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaleItemDTO = {
  id: string;
  name: string;
  batchNo: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  lineTotal: number;
};

export type SaleDTO = {
  id: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string | null;
  doctorName: string | null;
  subtotal: number;
  gstAmount: number;
  discount: number;
  total: number;
  paymentMode: string;
  createdAt: string;
  items: SaleItemDTO[];
};
