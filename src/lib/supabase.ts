import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuration Supabase:', {
  url: supabaseUrl ,
  key: supabaseAnonKey ,
  environment: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'OK' : 'MANQUANTE',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'OK' : 'MANQUANTE',
    help: 'Vérifiez votre fichier .env'
  });
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Client Supabase initialisé avec succès');
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types de données
export type UserRole = 'admin' | 'doctor' | 'cashier';
export type Gender = 'M' | 'F';
export type ProductType = 'medical' | 'medication';
export type InvoiceStatus = 'draft' | 'paid' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  birth_date: string;
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  unit_price: number;
  current_stock: number;
  min_stock_level: number;
  unit: string;
  barcode?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  diagnosis: string;
  treatment?: string;
  notes?: string;
  consultation_fee: number;
  is_invoiced: boolean;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  doctor?: Profile;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  consultation_id?: string;
  cashier_id: string;
  total_amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  consultation?: Consultation;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out';
  quantity: number;
  reason?: string;
  reference_id?: string;
  user_id: string;
  created_at: string;
  product?: Product;
  user?: Profile;
}