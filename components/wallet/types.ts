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
  type: "credit" | "debit";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

export interface CreateWallet {
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  birthday: string;
  gender: string;
  countryCode: string;
  mobile: string;
  idType: string;
  idNumber: string;
  frontSidePhoto: string;
  backSidePhoto: string;
  selfiePhoto: string;
  kraPin: string;
  address: string;
  email: string;
}

export type IdType = [
  { value: "101"; key: "-National" } | { value: "102"; key: "-alien id" },
  { value: "103"; key: "-passport" }
];
