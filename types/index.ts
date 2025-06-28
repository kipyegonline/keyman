export interface KeymanUser {
  created_at: string;
  current_team_id: number | null;
  email: string;
  email_verified_at: string | null;
  id: number;
  is_supplier: "Customer" | "Supplier";
  link: string;
  name: string;
  phone: string;
  profile_photo_path: string | null;
  profile_photo_url: string;
  reset_code: string;
  supplier_details: Record<string, string | number | boolean> | null;
  two_factor_confirmed_at: string | null;
  updated_at: string;
}

/**
 * @interface SupplierInfo
 * @description Represents the information for a supplier.
 */
export interface SupplierInfo {
  /**
   * @property {string} phone - The phone number of the supplier.
   */
  phone: string;
  /**
   * @property {string} email - The email address of the supplier.
   */
  email: string;
  /**
   * @property {string} type - The type of supplier (e.g., "retailer", "wholesaler").
   */
  type: string;
  /**
   * @property {string} address - The physical address of the supplier.
   */
  address: string;
  /**
   * @property {number} latitude - The geographical latitude of the supplier's location.
   */
  latitude: number;
  /**
   * @property {number} longitude - The geographical longitude of the supplier's location.
   */
  longitude: number;
  /**
   * @property {string[]} categories - An array of categories the supplier belongs to (e.g., ["electronics", "food"]).
   */
  categories: string[];
  /**
   * @property {string} [tiktok_link] - Optional: The link to the supplier's TikTok profile.
   */
  tiktok_link?: string;
  /**
   * @property {string} [facebook_link] - Optional: The link to the supplier's Facebook profile.
   */
  facebook_link?: string;
  /**
   * @property {string} [youtube_link] - Optional: The link to the supplier's YouTube channel.
   */
  youtube_link?: string;
  /**
   * @property {string} [Instagram_link] - Optional: The link to the supplier's Instagram profile.
   */
  Instagram_link?: string; // Note: "Instagram" is typically capitalized.
  /**
   * @property {string} [twitter_link] - Optional: The link to the supplier's Twitter profile.
   */
  twitter_link?: string;
  /**
   * @property {boolean} [offers_transport] - Optional: Indicates if the supplier offers transportation services.
   */
  offers_transport?: boolean;
  /**
   * @property {boolean} [internet_access] - Optional: Indicates if the supplier has internet access for business operations.
   */
  internet_access?: boolean;
  /**
   * @property {boolean} [has_pos] - Optional: Indicates if the supplier has a Point of Sale system.
   */
  has_pos?: boolean;
  /**
   * @property {boolean} [has_inventory] - Optional: Indicates if the supplier manages an inventory.
   */
  has_inventory?: boolean;
  /**
   * @property {boolean} [is_escrow_only] - Optional: Indicates if the supplier operates only via escrow payments.
   */
  is_escrow_only?: boolean;
  /**
   * @property {string} [photo] - Optional: A URL or reference to a photo of the supplier or their business.
   */
  photo?: File | null;
  /**
   * @property {string} [comments] - Optional: Additional comments about the supplier.
   */
  comments?: string;
  "categories[0]"?: string;
  "categories[1]"?: string;
}
export interface categories {
  goods: { name: "goods"; categories: { id: string; name: string }[] };
  professional_services: {
    name: "professional_services";
    categories: { id: string; name: string }[];
  };
  services: { name: "services"; categories: { id: string; name: string }[] };
}
export interface Staff {
  id: string;
  supplier_detail_id: string;
  user_id: number;
  user: {
    email: string;
    id: number;
    link: string;
    name: string;
    profile_photo_url: string;
  };
}
export interface Pricelist {
  description: string;
  name: string;
  price: string;
  swahili_name: string;
  transportation_type: string;
  type: string;
  weight_in_kgs: string;
}
export interface SupplierDetails {
  address: string;
  categories: Category[];
  coin_balance: CoinBalance;
  coin_usage: CoinUsageItem[];
  comments: string;
  created_at: string;
  email: string;
  facebook_link: string | null;
  has_inventory: number;
  has_pos: number;
  id: string;
  instagram_link: string | null;
  internet_access: number;
  is_escrow_only: number;
  keyman_number: string;
  level: string;
  location: Location;
  media: string[];
  name: string;
  offers_transport: number;
  orders_by_status: { PENDING: number; COMPLETED: number };
  orders_count: number;
  phone: string;
  photo: string[] | null;
  quotes_count: number;
  requests_count: number;
  staff: Staff[];
  staff_count: number;
  tiktok_link: string | null;
  twitter_link: string | null;
  type: string;
  updated_at: string;
  user_id: number;
  youtube_link: string | null;
}

interface Category {
  created_at: string;
  id: string;

  item_category: {
    id: string;
    name: string;
    item_category_id: string;
    supplier_detail_id: string;
    updated_at: string;
  };
}

interface CoinBalance {
  breakdown: { free: string; paid: number };
  total: number;
}

interface CoinUsageItem {
  coinable_id: string;
  coinable_type: string;
  created_at: string;
  credit: string;
  debit: string;
  expiry: string;
  id: string;
  notes: string;
  ownable_id: string;
  ownable_type: string;
  type: string;
  updated_at: string;
  value: string;
}

interface Location {
  type: string;
  coordinates: [number, number];
}

export interface KeymanRequest {
  delivery_date: string;
  status:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | " COMPLETED"
    | "CANCELLED"
    | "awarded";
  latitude: string;
  longitude: string;
  created_from: string;
  ks_number: string;
  items: Array<{
    name: string;
    itemId: string;
    quanity: string;
    description: string;
    visual_confirmation_required: boolean;
  }>;
}
export interface RequestDelivery {
  code: string;
  created_at: string;
  created_from: string;
  delivery_date: string;
  id: string;
  items_count: number;
  ks_number: null;
  location: {
    type: string;
    coordinates: [number, number];
  };
  quotes_count: number;
  status:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | " COMPLETED"
    | "CANCELLED"
    | "awarded";
  updated_at: string;
}
export interface RequestDeliveryItem {
  code: string;
  created_at: string;
  created_from: string;
  delivery_date: string;
  id: string;
  items: Array<{
    name: string;
    id: string;
    quantity: string;
    description: string;
    visual_confirmation_required: 0 | 1;
    price?: number;
    quan?: number;
    photo?: File | null;
    item: { weight_in_kgs: string };
  }>;
  ks_number: null;
  location: {
    type: string;
    coordinates: [number, number];
  };
  orders: Array<Record<string, string | number>>; // Assuming 'orders' can be an array of any type if specific structure isn't provided
  status:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "awarded";
  transports: Array<{
    id: string;
    transportable_id: string;
    transportable_type: string;
    supplier_detail_id: string;
    transport_type: string;
    total_weight: string;
    transportation_vehicle: string;
  }>;
  updated_at: string;
}

export type Project = {
  address: string;
  created_at: string;
  description: string;
  id: string;
  location: {
    type: string;
    coordinates: number[];
  };
  name: string;
  updated_at: string;
  user_id: number;
};
