export interface RequestPayload {
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  items: RequestItem[];
}
type Quoteitem = {
  unit_price: number | undefined;

  quantity: number | undefined;

  request_item_id: string;

  total_price: number;
  total_weight: number;

  file?: File;
};
export interface QuoteInfo {
  items: Quoteitem[];
  minimum_order_quantity: number;
  partial_delivery: number;

  payment_type: string;

  request_id: string;

  supplier_detail_id: string;
  transport: {
    type: string;
    vehicle: string;
    weight: number;
    distance: number;
    cost: number;
  };
  update_pricelist: number;
}

export interface QuotePayload {
  items: {
    item_id: string;
    price: number;
    available_quantity: number;
    notes?: string;
  }[];
}

export interface AwardPayload {
  item_ids: string[];
  supplier_id: string;
}

// Response types
export interface Request {
  id: string;
  title: string;

  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  location: {
    latitude: number;
    longitude: number;
  };
  items: RequestItem[];
  created_at: string;
  updated_at: string;
}
export interface RequestItem {
  name: string;
  quantity: number;
  unit: string;
  description?: string;
}

export interface Quote {
  id: string;
  supplier_id: string;
  request_id: string;
  items: {
    item_id: string;
    price: number;
    available_quantity: number;
    notes?: string;
  }[];
  created_at: string;
}

export interface KeymanItem {
  description: string;
  id: string;
  item_category_id: string;
  media: string[];
  name: string;
  photo?: string[];
  swahili_name: string;
  tags: string[];
  transportation_type: string;
  type: string;
  weight_in_kgs: string;
  quantity?: number;
  visual_confirmation_required?: boolean | 1 | 0;
}
export interface KeymanItemRequest {
  description: string;
  id: string;
  name: string;
  photo?: string[];
  quantity?: number;
  item_id?: string;
  visual_confirmation_required?: boolean | 1 | 0;
}
export interface CreateRequestPayload {
  created_from: string;
  delivery_date: string; // Consider using Date type if you plan to parse it
  items: KeymanItemRequest[];
  latitude: number;
  longitude: number;
  status: string;
}
