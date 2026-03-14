// API service with placeholder endpoints
const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    // Return mock data during development
    return getMockData(url, options?.method || "GET") as T;
  }
}

// Mock data for development
function getMockData(url: string, _method: string): unknown {
  if (url.startsWith("/products")) return mockProducts;
  if (url.startsWith("/stock")) return mockStock;
  if (url.startsWith("/receipts")) return mockReceipts;
  if (url.startsWith("/deliveries")) return mockDeliveries;
  if (url.startsWith("/transfers")) return mockTransfers;
  if (url.startsWith("/adjustments")) return mockAdjustments;
  if (url.startsWith("/movements")) return mockMovements;
  if (url.startsWith("/dashboard")) return mockDashboard;
  return [];
}

export const api = {
  dashboard: () => request<DashboardData>("/dashboard"),
  products: {
    list: () => request<Product[]>("/products"),
    get: (id: string) => request<Product>(`/products/${id}`),
    create: (data: Partial<Product>) => request<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Product>) => request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },
  receipts: {
    list: () => request<Receipt[]>("/receipts"),
    create: (data: Partial<Receipt>) => request<Receipt>("/receipts", { method: "POST", body: JSON.stringify(data) }),
  },
  deliveries: {
    list: () => request<Delivery[]>("/deliveries"),
    create: (data: Partial<Delivery>) => request<Delivery>("/deliveries", { method: "POST", body: JSON.stringify(data) }),
  },
  transfers: {
    list: () => request<Transfer[]>("/transfers"),
    create: (data: Partial<Transfer>) => request<Transfer>("/transfers", { method: "POST", body: JSON.stringify(data) }),
  },
  adjustments: {
    list: () => request<Adjustment[]>("/adjustments"),
    create: (data: Partial<Adjustment>) => request<Adjustment>("/adjustments", { method: "POST", body: JSON.stringify(data) }),
  },
  movements: {
    list: () => request<StockMovement[]>("/movements"),
  },
};

// Types
export interface DashboardData {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
  movementChart: { date: string; inbound: number; outbound: number }[];
  categoryDistribution: { name: string; value: number }[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  totalStock: number;
  location: string;
  stockByLocation: { location: string; quantity: number }[];
}

export interface Receipt {
  id: string;
  reference: string;
  supplier: string;
  date: string;
  status: "draft" | "waiting" | "ready" | "done" | "cancelled";
  items: { product: string; quantity: number }[];
  warehouse: string;
}

export interface Delivery {
  id: string;
  reference: string;
  customer: string;
  date: string;
  status: "pick" | "pack" | "ship" | "done" | "cancelled";
  items: { product: string; quantity: number }[];
  warehouse: string;
}

export interface Transfer {
  id: string;
  reference: string;
  date: string;
  status: "draft" | "in_progress" | "done" | "cancelled";
  sourceLocation: string;
  destinationLocation: string;
  items: { product: string; quantity: number }[];
}

export interface Adjustment {
  id: string;
  reference: string;
  date: string;
  product: string;
  location: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  status: "draft" | "done";
}

export interface StockMovement {
  id: string;
  timestamp: string;
  product: string;
  operationType: string;
  quantity: number;
  sourceLocation: string;
  destinationLocation: string;
  performedBy: string;
}

// Mock data
const mockProducts: Product[] = [
  { id: "1", name: "Wireless Mouse", sku: "WM-001", category: "Electronics", unitOfMeasure: "Unit", totalStock: 245, location: "Warehouse A", stockByLocation: [{ location: "Warehouse A", quantity: 150 }, { location: "Warehouse B", quantity: 95 }] },
  { id: "2", name: "USB-C Cable", sku: "UC-002", category: "Accessories", unitOfMeasure: "Unit", totalStock: 1200, location: "Warehouse A", stockByLocation: [{ location: "Warehouse A", quantity: 800 }, { location: "Warehouse B", quantity: 400 }] },
  { id: "3", name: "Mechanical Keyboard", sku: "MK-003", category: "Electronics", unitOfMeasure: "Unit", totalStock: 89, location: "Warehouse B", stockByLocation: [{ location: "Warehouse B", quantity: 89 }] },
  { id: "4", name: "Monitor Stand", sku: "MS-004", category: "Furniture", unitOfMeasure: "Unit", totalStock: 5, location: "Warehouse A", stockByLocation: [{ location: "Warehouse A", quantity: 5 }] },
  { id: "5", name: "Webcam HD", sku: "WC-005", category: "Electronics", unitOfMeasure: "Unit", totalStock: 0, location: "Warehouse A", stockByLocation: [] },
  { id: "6", name: "Desk Lamp", sku: "DL-006", category: "Furniture", unitOfMeasure: "Unit", totalStock: 34, location: "Warehouse A", stockByLocation: [{ location: "Warehouse A", quantity: 34 }] },
  { id: "7", name: "Ethernet Cable 5m", sku: "EC-007", category: "Accessories", unitOfMeasure: "Unit", totalStock: 567, location: "Warehouse B", stockByLocation: [{ location: "Warehouse B", quantity: 567 }] },
  { id: "8", name: "Laptop Stand", sku: "LS-008", category: "Furniture", unitOfMeasure: "Unit", totalStock: 12, location: "Warehouse A", stockByLocation: [{ location: "Warehouse A", quantity: 12 }] },
];

const mockReceipts: Receipt[] = [
  { id: "1", reference: "REC-001", supplier: "TechCorp", date: "2026-03-10", status: "done", items: [{ product: "Wireless Mouse", quantity: 100 }], warehouse: "Warehouse A" },
  { id: "2", reference: "REC-002", supplier: "CableCo", date: "2026-03-12", status: "waiting", items: [{ product: "USB-C Cable", quantity: 500 }], warehouse: "Warehouse A" },
  { id: "3", reference: "REC-003", supplier: "KeyboardInc", date: "2026-03-14", status: "draft", items: [{ product: "Mechanical Keyboard", quantity: 50 }], warehouse: "Warehouse B" },
];

const mockDeliveries: Delivery[] = [
  { id: "1", reference: "DEL-001", customer: "Acme Corp", date: "2026-03-11", status: "done", items: [{ product: "Wireless Mouse", quantity: 20 }], warehouse: "Warehouse A" },
  { id: "2", reference: "DEL-002", customer: "Beta Inc", date: "2026-03-13", status: "pack", items: [{ product: "USB-C Cable", quantity: 100 }], warehouse: "Warehouse A" },
  { id: "3", reference: "DEL-003", customer: "Gamma LLC", date: "2026-03-15", status: "pick", items: [{ product: "Mechanical Keyboard", quantity: 10 }], warehouse: "Warehouse B" },
];

const mockTransfers: Transfer[] = [
  { id: "1", reference: "TRF-001", date: "2026-03-09", status: "done", sourceLocation: "Warehouse A", destinationLocation: "Warehouse B", items: [{ product: "Wireless Mouse", quantity: 30 }] },
  { id: "2", reference: "TRF-002", date: "2026-03-14", status: "in_progress", sourceLocation: "Warehouse B", destinationLocation: "Warehouse A", items: [{ product: "Ethernet Cable 5m", quantity: 100 }] },
];

const mockAdjustments: Adjustment[] = [
  { id: "1", reference: "ADJ-001", date: "2026-03-08", product: "Monitor Stand", location: "Warehouse A", systemQuantity: 8, countedQuantity: 5, difference: -3, status: "done" },
  { id: "2", reference: "ADJ-002", date: "2026-03-13", product: "Desk Lamp", location: "Warehouse A", systemQuantity: 30, countedQuantity: 34, difference: 4, status: "draft" },
];

const mockMovements: StockMovement[] = [
  { id: "1", timestamp: "2026-03-14T09:30:00Z", product: "Wireless Mouse", operationType: "Receipt", quantity: 100, sourceLocation: "-", destinationLocation: "Warehouse A", performedBy: "John D." },
  { id: "2", timestamp: "2026-03-13T14:20:00Z", product: "USB-C Cable", operationType: "Delivery", quantity: -100, sourceLocation: "Warehouse A", destinationLocation: "-", performedBy: "Jane S." },
  { id: "3", timestamp: "2026-03-12T11:00:00Z", product: "Wireless Mouse", operationType: "Transfer", quantity: 30, sourceLocation: "Warehouse A", destinationLocation: "Warehouse B", performedBy: "John D." },
  { id: "4", timestamp: "2026-03-11T16:45:00Z", product: "Monitor Stand", operationType: "Adjustment", quantity: -3, sourceLocation: "Warehouse A", destinationLocation: "-", performedBy: "Admin" },
  { id: "5", timestamp: "2026-03-10T08:15:00Z", product: "Mechanical Keyboard", operationType: "Receipt", quantity: 50, sourceLocation: "-", destinationLocation: "Warehouse B", performedBy: "Jane S." },
  { id: "6", timestamp: "2026-03-09T13:30:00Z", product: "Ethernet Cable 5m", operationType: "Transfer", quantity: 100, sourceLocation: "Warehouse B", destinationLocation: "Warehouse A", performedBy: "John D." },
];

const mockDashboard: DashboardData = {
  totalProducts: 2152,
  lowStockItems: 3,
  outOfStockItems: 1,
  pendingReceipts: 2,
  pendingDeliveries: 2,
  scheduledTransfers: 1,
  movementChart: [
    { date: "Mar 8", inbound: 0, outbound: 3 },
    { date: "Mar 9", inbound: 100, outbound: 0 },
    { date: "Mar 10", inbound: 50, outbound: 0 },
    { date: "Mar 11", inbound: 0, outbound: 20 },
    { date: "Mar 12", inbound: 0, outbound: 30 },
    { date: "Mar 13", inbound: 0, outbound: 100 },
    { date: "Mar 14", inbound: 100, outbound: 0 },
  ],
  categoryDistribution: [
    { name: "Electronics", value: 334 },
    { name: "Accessories", value: 1767 },
    { name: "Furniture", value: 51 },
  ],
};

export const mockStock = {
  total: 2152,
  byWarehouse: [
    { warehouse: "Warehouse A", total: 1001 },
    { warehouse: "Warehouse B", total: 1151 },
  ],
};
