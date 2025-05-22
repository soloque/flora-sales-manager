// User roles
export type UserRole = "owner" | "seller" | "guest";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  avatar_url?: string;
}

// Sale/Order status
export type OrderStatus = "pending" | "processing" | "paid" | "delivered" | "cancelled" | "problem";

// Sale/Order interface
export interface Sale {
  id: string;
  date: Date;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sellerId: string;
  sellerName: string;
  commission: number;
  commissionRate: number;
  status: OrderStatus;
  observations: string;
  customerInfo: CustomerInfo;
  costPrice?: number; // Only visible to owner
  profit?: number; // Only visible to owner
  createdAt: Date;
  updatedAt: Date;
}

// Customer information
export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  state?: string;
  zipCode: string;
  order: string; // Free text for plant orders
  observations?: string;
}

// Address from CEP API
export interface Address {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

// Update message from owner to sellers
export interface Update {
  id: string;
  title: string;
  content: string;
  images?: string[];
  createdAt: Date;
  authorId: string;
  authorName: string;
  isHighlighted: boolean;
}

// Financial summary
export interface FinancialSummary {
  totalSales: number;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  totalCommissions: number;
  netProfit: number;
  pendingPayments: number;
  timeRange: string;
}

// Subscription tier
export interface SubscriptionTier {
  id: string;
  name: string;
  pricePerMonth: number;
  maxSellers: number;
  features: string[];
}

// Commission settings
export interface CommissionSettings {
  id: string;
  ownerId: string;
  defaultRate: number; // Default commission percentage
  sellerSpecificRates: {
    [sellerId: string]: number;
  };
  updatedAt: Date;
}

// Sales history period
export type SalesHistoryPeriod = "7days" | "30days" | "90days" | "custom";

// Sales history filters
export interface SalesHistoryFilters {
  period: SalesHistoryPeriod;
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus | "all";
  sellerId?: string | "all";
}

// Inventory item
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  reorderPoint: number;
  supplier: string;
  createdAt: Date;
  updatedAt: Date;
}
