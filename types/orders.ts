export interface Order {
  code: string;
  comments: string | null;
  created_at: string;
  delivery_date: string;
  detail: {
    id: string;
    name: string;
    phone: string;
    photo: string[];
    media: string[];
  };
  id: string;
  items: Array<Record<string,string>>;
  rating: number;
  request: {
    id: string;
    code: string;
    location: {
        type:"string",
        coordinates:[number,number]
     
    };
    delivery_date: string;
    status: string;
   
  };
  request_id: string;
  status: "SUBMITTED"| "PENDING" | "IN_PROGRESS"  | ' COMPLETED' | 'CANCELLED'| "awarded";
  supplier_detail_id: string;
  total: number;
  updated_at: string;
}
