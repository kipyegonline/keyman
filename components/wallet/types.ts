// Shared types for wallet components
export interface WalletData {
  balance: number;
  currency: string;
  walletId: string;
  phoneNumber: string;
  isVerified: boolean;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}