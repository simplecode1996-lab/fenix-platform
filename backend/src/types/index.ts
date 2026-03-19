import { Request } from 'express';

export interface User {
  user_code: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  profile: 'admin' | 'user';
  wallet?: string;
  phone?: string;
  dni?: string;
  registered_accounts_count: number;
  allowed_accounts_count: number;
  pending_collection_amount: number;
  collected_amount: number;
  paid_commissions: number;
  currency: 'USDT' | 'USDC';
  created_at: Date;
  updated_at: Date;
}

export interface UserAccount {
  account_number: number;
  user_code: number;
  user_wallet?: string;
  paid_amount: number;
  investment_amount: number;
  level_1_date?: Date;
  level_2_date?: Date;
  level_3_date?: Date;
  level_3_processed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentToUser {
  payment_id: number;
  user_code: number;
  request_date: Date;
  requested_amount: number;
  net_amount: number;
  commission_amount: number;
  payment_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FenixWallet {
  wallet_id: number;
  currency: 'USDT' | 'USDC';
  wallet_address: string;
  created_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    user_code: number;
    email: string;
    profile: 'admin' | 'user';
  };
}
