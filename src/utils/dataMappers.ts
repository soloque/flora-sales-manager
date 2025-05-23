
import { Sale } from "@/types";

// Map database sale objects to frontend Sale type
export const mapDatabaseSaleToSale = (dbSale: any): Sale => {
  return {
    id: dbSale.id,
    date: new Date(dbSale.date),
    description: dbSale.description || "",
    quantity: dbSale.quantity || 0,
    unitPrice: dbSale.unit_price || 0,
    totalPrice: dbSale.total_price || 0,
    sellerId: dbSale.seller_id || "",
    sellerName: dbSale.seller_name || "",
    commission: dbSale.commission || 0,
    commissionRate: dbSale.commission_rate || 0,
    status: dbSale.status || "pending",
    observations: dbSale.observations || "",
    customerInfo: {
      name: dbSale.customer_info?.name || dbSale.customer_name || "Cliente",
      phone: dbSale.customer_info?.phone || dbSale.customer_phone || "",
      address: dbSale.customer_info?.address || dbSale.customer_address || "",
      city: dbSale.customer_info?.city || dbSale.customer_city || "",
      state: dbSale.customer_info?.state || dbSale.customer_state || "",
      zipCode: dbSale.customer_info?.zip_code || dbSale.customer_zipcode || "",
      order: dbSale.customer_info?.order_details || dbSale.customer_order || "",
      observations: dbSale.customer_info?.observations || dbSale.customer_observations || ""
    },
    costPrice: dbSale.cost_price || 0,
    profit: dbSale.profit || 0,
    createdAt: new Date(dbSale.created_at),
    updatedAt: new Date(dbSale.updated_at)
  };
};
