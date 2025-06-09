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
  supplier_details: Record<string,string|number|boolean> | null; 
  two_factor_confirmed_at: string | null;
  updated_at: string;
}