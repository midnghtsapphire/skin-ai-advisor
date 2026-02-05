export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  brand: string | null;
  image_url: string | null;
  my_cost: number;
  selling_price: number;
  markup_percentage: number;
  status: ProductStatus;
  is_affiliate: boolean;
  affiliate_link: string | null;
  affiliate_commission_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  reserved_quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  warehouse_location: string | null;
  last_restocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address: Address | null;
  billing_address: Address | null;
  tracking_number: string | null;
  carrier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  status: ReturnStatus;
  reason: string;
  refund_amount: number | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  reason: string | null;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  website: string | null;
  category: string | null;
  commission_rate: string | null;
  cookie_duration: string | null;
  signup_url: string | null;
  description: string | null;
  tier: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Helper function to safely cast database responses
export const castOrder = (data: unknown): Order => data as Order;
export const castOrders = (data: unknown[]): Order[] => data as Order[];

export interface Return {
  id: string;
  order_id: string;
  user_id: string;
  status: ReturnStatus;
  reason: string;
  refund_amount: number | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReturnItem {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  reason: string | null;
}

export interface AffiliateProgram {
  id: string;
  name: string;
  website: string | null;
  category: string | null;
  commission_rate: string | null;
  cookie_duration: string | null;
  signup_url: string | null;
  description: string | null;
  tier: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
