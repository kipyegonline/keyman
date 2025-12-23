import { CSSProperties } from "react";

export type SupplierType =
  | "goods"
  | "services"
  | "professional_services"
  | "master";

export interface ISupplierContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  keyman_number: string;
  comments: string | null;
  photo?: string[];
  supplier_rating: null | string;
  is_user_verified: number;
  type?: SupplierType; // Optional for backward compatibility
}

export interface SupplierCardProps {
  supplier: ISupplierContact;
  url: string;
  styles: CSSProperties;
  index: number;
  onStartKeyContract: (supplier: ISupplierContact) => () => void;
  onCall: (phone: string) => void;
  onRequestQuote: (supplier: ISupplierContact) => void;
}

// Theme colors for each supplier type
export const supplierTypeThemes = {
  goods: {
    primary: "#3D6B2C", // Green
    primaryLight: "#3D6B2C15",
    border: "#3D6B2C",
    borderLight: "#3D6B2C40",
    background: "#F0FDF4",
    badgeBg: "#DCFCE7",
    badgeColor: "#166534",
    hoverBorder: "#3D6B2C",
  },
  services: {
    primary: "#F08C23", // Orange
    primaryLight: "#F08C2315",
    border: "#F08C23",
    borderLight: "#F08C2340",
    background: "#FFF7ED",
    badgeBg: "#FFEDD5",
    badgeColor: "#C2410C",
    hoverBorder: "#F08C23",
  },
  professional_services: {
    primary: "#2563EB", // Blue
    primaryLight: "#2563EB15",
    border: "#2563EB",
    borderLight: "#2563EB40",
    background: "#EFF6FF",
    badgeBg: "#DBEAFE",
    badgeColor: "#1D4ED8",
    hoverBorder: "#2563EB",
  },
  master: {
    primary: "#B8860B", // Gold/Dark Goldenrod
    primaryLight: "#B8860B15",
    border: "#B8860B",
    borderLight: "#B8860B40",
    background: "#FFFBEB",
    badgeBg: "#FEF3C7",
    badgeColor: "#92400E",
    hoverBorder: "#B8860B",
  },
} as const;

// Helper function to get theme based on supplier type
export function getSupplierTheme(type?: string) {
  const validType = type as SupplierType;
  return supplierTypeThemes[validType] || supplierTypeThemes.goods;
}
