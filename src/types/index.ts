export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'cashier';
  avatar?: string;
  specialization?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  clinic: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
    description: string;
  };
  system: {
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
    taxRate: number;
    sessionTimeout: number;
    backupFrequency: string;
    maintenanceMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
    stockAlerts: boolean;
    systemAlerts: boolean;
  };
  billing: {
    invoicePrefix: string;
    invoiceNumbering: string;
    paymentTerms: number;
    lateFee: number;
    defaultTaxRate: number;
    acceptedPaymentMethods: string[];
  };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  type: 'general' | 'specialist' | 'emergency' | 'followup';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  symptoms: string;
  diagnosis?: string;
  notes?: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalCare {
  id: string;
  name: string;
  description: string;
  category: 'nursing' | 'injection' | 'examination' | 'procedure' | 'therapy' | 'other';
  unitPrice: number;
  duration?: number; // in minutes
  requiresDoctor: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalSupply {
  id: string;
  name: string;
  description: string;
  category: 'disposable' | 'equipment' | 'consumable' | 'instrument' | 'protective' | 'other';
  subCategory?: string; // catheter, bandage, syringe, etc.
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
  reference?: string; // Product reference/SKU
  expirationDate?: string;
  isActive: boolean;
  requiresDoctor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationCare {
  id: string;
  consultationId: string;
  careId: string;
  quantity: number;
  unitPrice: number; // Price at the time of service
  totalPrice: number;
  notes?: string;
  performedBy: string; // User ID
  performedAt: string;
  createdAt: string;
}

export interface ConsultationSupply {
  id: string;
  consultationId: string;
  supplyId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  usedBy: string; // User ID
  usedAt: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  consultationId: string;
  name: string;
  description: string;
  cost: number;
  duration?: string;
  instructions?: string;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  form: 'tablet' | 'syrup' | 'injection' | 'capsule' | 'cream' | 'drops' | 'inhaler' | 'patch';
  strength: string; // e.g., "500mg", "10ml"
  manufacturer?: string;
  unitPrice: number;
  stockQuantity?: number;
  isActive: boolean;
  category: 'antibiotic' | 'analgesic' | 'antiviral' | 'cardiovascular' | 'respiratory' | 'digestive' | 'neurological' | 'other';
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalExam {
  id: string;
  name: string;
  description: string;
  category: 'radiology' | 'laboratory' | 'cardiology' | 'ultrasound' | 'endoscopy' | 'other';
  unitPrice: number;
  duration?: number; // in minutes
  preparationInstructions?: string;
  isActive: boolean;
  requiresAppointment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  type: 'medication' | 'exam' | 'care' | 'supply';
  itemId: string; // ID of medication, exam, care, or supply
  quantity: number;
  dosage?: string; // For medications
  frequency?: string; // For medications (e.g., "3 times daily")
  duration?: string; // For medications (e.g., "7 days")
  instructions?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  items: PrescriptionItem[];
  instructions: string;
  status: 'active' | 'completed' | 'cancelled' | 'billed';
  createdAt: string;
  validUntil: string;
  billedAt?: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  consultationId: string;
  prescriptionId?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
  paidAt?: string;
  paymentMethod?: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
  paymentReference?: string;
  cashierId?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'bank_transfer' | 'card';
  reference?: string;
  notes?: string;
  cashierId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayConsultations: number;
  pendingInvoices: number;
  monthlyRevenue: number;
  completedConsultations: number;
  cancelledConsultations: number;
}