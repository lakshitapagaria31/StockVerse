// API service with placeholder endpoints
export const AUTH_TOKEN_STORAGE_KEY = "stockverse-auth-token";
export const AUTH_USER_STORAGE_KEY = "stockverse-auth-user";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

interface ResetPasswordResponse {
  message: string;
  expires_in_seconds: number;
  email_sent?: boolean;
  otp?: string;
  note?: string;
}

interface BackendProduct {
  id: number;
  name: string;
  sku: string;
  category: string | null;
  unit: string;
  created_at: string;
}

interface BackendWarehouse {
  id: number;
  name: string;
  location: string | null;
}

interface BackendMovement {
  id: number;
  product_id: number;
  operation_type: string;
  quantity: number;
  source_location: string | null;
  destination_location: string | null;
  timestamp: string;
  user_id: number;
}

function getStoredToken(): string | null {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers, body, ...rest } = options;
  const token = getStoredToken();
  const requestHeaders = new Headers(headers ?? {});

  if (!(body instanceof FormData) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (requiresAuth && token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...rest,
    body,
    headers: requestHeaders,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const errorBody = (await response.json()) as { detail?: string };
      if (errorBody.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Ignore JSON parsing errors and fall back to status message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function mapProduct(product: BackendProduct): Product {
  return {
    id: String(product.id),
    name: product.name,
    sku: product.sku,
    category: product.category ?? "General",
    unitOfMeasure: product.unit,
    totalStock: 0,
    location: "Not exposed yet",
    stockByLocation: [],
  };
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function getProductNameMap(): Promise<Map<number, string>> {
  const products = await request<BackendProduct[]>("/products");
  return new Map(products.map((product) => [product.id, product.name]));
}

function groupChartData(movements: StockMovement[]): DashboardData["movementChart"] {
  const byDate = new Map<string, { inbound: number; outbound: number }>();

  movements.forEach((movement) => {
    const day = new Date(movement.timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const current = byDate.get(day) ?? { inbound: 0, outbound: 0 };
    if (movement.operationType === "Receipt") {
      current.inbound += movement.quantity;
    }
    if (movement.operationType === "Delivery") {
      current.outbound += Math.abs(movement.quantity);
    }
    byDate.set(day, current);
  });

  return Array.from(byDate.entries()).map(([date, totals]) => ({ date, ...totals }));
}

async function listMovementsByType(type: "receipt" | "delivery" | "transfer" | "adjustment") {
  const productNames = await getProductNameMap();
  const rows = await request<BackendMovement[]>(`/${type}s`);

  return rows.map((row) => ({
    id: String(row.id),
    timestamp: row.timestamp,
    product: productNames.get(row.product_id) ?? `Product #${row.product_id}`,
    operationType: titleCase(row.operation_type),
    quantity: row.operation_type === "delivery" ? -Math.abs(row.quantity) : row.quantity,
    sourceLocation: row.source_location ?? "-",
    destinationLocation: row.destination_location ?? "-",
    performedBy: `User #${row.user_id}`,
  } satisfies StockMovement));
}

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

export interface Warehouse {
  id: number;
  name: string;
  location: string | null;
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

export const api = {
  auth: {
    signup: (payload: { name: string; email: string; password: string; role?: string }) =>
      request<AuthResponse>("/auth/signup", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify({ role: "staff", ...payload }),
      }),
    login: (payload: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify(payload),
      }),
    requestPasswordResetOtp: (payload: { email: string }) =>
      request<ResetPasswordResponse>("/auth/reset-password", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify(payload),
      }),
    verifyPasswordResetOtp: (payload: { email: string; otp: string }) =>
      request<{ message: string }>("/auth/verify-otp", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify(payload),
      }),
    confirmPasswordReset: (payload: { email: string; otp: string; new_password: string }) =>
      request<{ message: string }>("/auth/confirm-reset-password", {
        method: "POST",
        requiresAuth: false,
        body: JSON.stringify(payload),
      }),
  },

  dashboard: async (): Promise<DashboardData> => {
    const [products, warehouses, movements] = await Promise.all([
      request<BackendProduct[]>("/products"),
      request<BackendWarehouse[]>("/warehouses"),
      api.movements.list(),
    ]);

    const categoryCounts = new Map<string, number>();
    products.forEach((product) => {
      const key = product.category ?? "General";
      categoryCounts.set(key, (categoryCounts.get(key) ?? 0) + 1);
    });

    return {
      totalProducts: products.length,
      lowStockItems: 0,
      outOfStockItems: 0,
      pendingReceipts: 0,
      pendingDeliveries: 0,
      scheduledTransfers: movements.filter((item) => item.operationType === "Transfer").length,
      movementChart: groupChartData(movements),
      categoryDistribution: Array.from(categoryCounts.entries()).map(([name, value]) => ({ name, value })),
    };
  },

  products: {
    list: async () => (await request<BackendProduct[]>("/products")).map(mapProduct),
    get: async (id: string) => mapProduct(await request<BackendProduct>(`/products/${id}`)),
    create: async (data: Partial<Product>) =>
      mapProduct(
        await request<BackendProduct>("/products", {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            sku: data.sku,
            category: data.category,
            unit: data.unitOfMeasure ?? "Unit",
          }),
        }),
      ),
    update: async (id: string, data: Partial<Product>) =>
      mapProduct(
        await request<BackendProduct>(`/products/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: data.name,
            sku: data.sku,
            category: data.category,
            unit: data.unitOfMeasure,
          }),
        }),
      ),
    delete: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },

  warehouses: {
    list: () => request<Warehouse[]>("/warehouses"),
    create: (data: { name: string; location?: string | null }) =>
      request<Warehouse>("/warehouses", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { name?: string; location?: string | null }) =>
      request<Warehouse>(`/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/warehouses/${id}`, { method: "DELETE" }),
  },

  receipts: {
    list: async (): Promise<Receipt[]> => {
      const productNames = await getProductNameMap();
      const rows = await request<BackendMovement[]>("/receipts");
      return rows.map((row) => ({
        id: String(row.id),
        reference: `REC-${String(row.id).padStart(3, "0")}`,
        supplier: row.source_location ?? "Supplier",
        date: row.timestamp.slice(0, 10),
        status: "done",
        items: [{ product: productNames.get(row.product_id) ?? `Product #${row.product_id}`, quantity: row.quantity }],
        warehouse: row.destination_location ?? "-",
      }));
    },
    create: (data: { productId: number; warehouseId: number; quantity: number }) =>
      request<BackendMovement>("/receipts", {
        method: "POST",
        body: JSON.stringify({ product_id: data.productId, warehouse_id: data.warehouseId, quantity: data.quantity }),
      }),
  },

  deliveries: {
    list: async (): Promise<Delivery[]> => {
      const productNames = await getProductNameMap();
      const rows = await request<BackendMovement[]>("/deliveries");
      return rows.map((row) => ({
        id: String(row.id),
        reference: `DEL-${String(row.id).padStart(3, "0")}`,
        customer: row.destination_location ?? "Customer",
        date: row.timestamp.slice(0, 10),
        status: "done",
        items: [{ product: productNames.get(row.product_id) ?? `Product #${row.product_id}`, quantity: row.quantity }],
        warehouse: row.source_location ?? "-",
      }));
    },
    create: (data: { productId: number; warehouseId: number; quantity: number }) =>
      request<BackendMovement>("/deliveries", {
        method: "POST",
        body: JSON.stringify({ product_id: data.productId, warehouse_id: data.warehouseId, quantity: data.quantity }),
      }),
  },

  transfers: {
    list: async (): Promise<Transfer[]> => {
      const productNames = await getProductNameMap();
      const rows = await request<BackendMovement[]>("/transfers");
      return rows.map((row) => ({
        id: String(row.id),
        reference: `TRF-${String(row.id).padStart(3, "0")}`,
        date: row.timestamp.slice(0, 10),
        status: "done",
        sourceLocation: row.source_location ?? "-",
        destinationLocation: row.destination_location ?? "-",
        items: [{ product: productNames.get(row.product_id) ?? `Product #${row.product_id}`, quantity: row.quantity }],
      }));
    },
    create: (data: { productId: number; sourceWarehouseId: number; destinationWarehouseId: number; quantity: number }) =>
      request<BackendMovement>("/transfers", {
        method: "POST",
        body: JSON.stringify({
          product_id: data.productId,
          source_warehouse_id: data.sourceWarehouseId,
          destination_warehouse_id: data.destinationWarehouseId,
          quantity: data.quantity,
        }),
      }),
  },

  adjustments: {
    list: async (): Promise<Adjustment[]> => {
      const productNames = await getProductNameMap();
      const rows = await request<BackendMovement[]>("/adjustments");
      return rows.map((row) => ({
        id: String(row.id),
        reference: `ADJ-${String(row.id).padStart(3, "0")}`,
        date: row.timestamp.slice(0, 10),
        product: productNames.get(row.product_id) ?? `Product #${row.product_id}`,
        location: row.destination_location ?? row.source_location ?? "-",
        systemQuantity: 0,
        countedQuantity: row.quantity,
        difference: row.quantity,
        status: "done",
      }));
    },
    create: (data: { productId: number; warehouseId: number; countedQuantity: number }) =>
      request<BackendMovement>("/adjustments", {
        method: "POST",
        body: JSON.stringify({ product_id: data.productId, warehouse_id: data.warehouseId, counted_quantity: data.countedQuantity }),
      }),
  },

  movements: {
    list: async (): Promise<StockMovement[]> => {
      const [receipts, deliveries, transfers, adjustments] = await Promise.all([
        listMovementsByType("receipt"),
        listMovementsByType("delivery"),
        listMovementsByType("transfer"),
        listMovementsByType("adjustment"),
      ]);

      return [...receipts, ...deliveries, ...transfers, ...adjustments].sort(
        (left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
      );
    },
  },
};
