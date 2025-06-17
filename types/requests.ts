export interface RequestPayload {
    title: string;
    description: string;
    location: {
        latitude: number;
        longitude: number;
    };
    items: RequestItem[];
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
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
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
