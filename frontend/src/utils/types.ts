import { Database } from "./supabase/database.types";

export type Language = Database["public"]["Tables"]["languages"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"]; 
