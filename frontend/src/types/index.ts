export interface User {
  id?: string | number;
  email: string;
  name?: string;
  full_name?: string;
  username?: string;
  role?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: User;
}

export interface DashboardData {
  total_sales?: number;
  total_received?: number;
  total_paid?: number;
  product_count?: number;
  products_count?: number;
  low_stock_products?: number | Product[];
  low_stock_count?: number;
  recent_transactions?: Transaction[];
  // Fallbacks if backend formats as nested summary
  summary?: {
    total_sales?: number;
    total_received?: number;
    total_paid?: number;
    product_count?: number;
    low_stock_products?: number;
  };
}

export type MoneyDirection = 'in' | 'out' | 'IN' | 'OUT' | 'incoming' | 'outgoing' | 'credit' | 'debit';
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'unpaid' | 'completed' | string;
export type TransactionType = 'sale' | 'purchase' | 'payment_received' | 'payment_made' | 'credit' | 'debit' | string;

export interface Transaction {
  id: string | number;
  customer?: string | { id?: string | number; name?: string; phone?: string };
  customer_name?: string;
  customer_id?: string | number;
  transaction_type?: TransactionType;
  type?: TransactionType;
  amount: number;
  money_direction?: MoneyDirection;
  direction?: MoneyDirection;
  payment_status?: PaymentStatus;
  status?: PaymentStatus;
  date?: string;
  created_at?: string;
  description?: string;
  items?: Array<{
    product_id?: string | number;
    product_name?: string;
    quantity?: number;
    price?: number;
    subtotal?: number;
  }>;
}

export interface Customer {
  id: string | number;
  name: string;
  phone: string;
  address: string;
  balance?: number;
  outstanding_balance?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerBalance {
  customer_id?: string | number;
  name?: string;
  balance?: number;
  outstanding_balance?: number;
  total_credit?: number;
  total_debit?: number;
}

export interface Product {
  id: string | number;
  name: string;
  price: number;
  stock_quantity?: number;
  quantity?: number;
  stock?: number;
  min_stock?: number;
  threshold?: number;
  is_low_stock?: boolean;
  low_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DraftTransaction {
  id: string | number;
  transcription?: string;
  raw_text?: string;
  intent?: string;
  action?: string;
  customer_name?: string;
  customer_id?: string | number;
  amount?: number;
  money_direction?: MoneyDirection;
  transaction_type?: TransactionType;
  confidence?: number;
  ambiguity?: boolean | string | string[];
  ambiguities?: string[];
  missing_fields?: string[];
  context?: Record<string, unknown> | string;
  items?: Array<{
    product_name?: string;
    product_id?: string | number;
    quantity?: number;
    price?: number;
  }>;
  status?: 'pending' | 'clarification_needed' | 'confirmed' | 'rejected' | string;
  clarification_question?: string;
  created_at?: string;
}

export interface VoiceProcessResponse {
  id?: string | number;
  draft_id?: string | number;
  transcription?: string;
  draft?: DraftTransaction;
  confidence?: number;
  status?: string;
  message?: string;
}

export interface QueryRequest {
  query?: string;
  prompt?: string;
  question?: string;
}

export interface QueryResponse {
  answer?: string;
  response?: string;
  message?: string;
  query_type?: string;
  data?: unknown;
  balance?: number;
  customer?: string;
  total_sales?: number;
  transactions?: Transaction[];
}
