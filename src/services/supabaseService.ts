import { supabase, handleSupabaseError } from '../lib/supabase';
import { 
  Profile,
  ProfileFormData,
  Patient, 
  Consultation, 
  MedicalCare, 
  Medication, 
  MedicalExam, 
  MedicalSupply, 
  Prescription, 
  Invoice, 
  ConsultationCare, 
  ConsultationSupply, 
  Payment,
  SystemSettings 
} from '../types';

// Helper function to transform database row to app type
const transformProfile = (row: any): Profile => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatar: row.avatar,
  specialization: row.specialization,
  phone: row.phone,
  isActive: row.is_active,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformPatient = (row: any): Patient => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  dateOfBirth: row.date_of_birth,
  gender: row.gender,
  phone: row.phone,
  email: row.email,
  address: row.address,
  emergencyContact: row.emergency_contact,
  bloodType: row.blood_type,
  allergies: row.allergies,
  medicalHistory: row.medical_history,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformConsultation = (row: any): Consultation => ({
  id: row.id,
  patientId: row.patient_id,
  doctorId: row.doctor_id,
  date: row.date,
  time: row.time,
  type: row.type,
  status: row.status,
  symptoms: row.symptoms,
  diagnosis: row.diagnosis,
  notes: row.notes,
  duration: row.duration,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformMedicalCare = (row: any): MedicalCare => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  unitPrice: row.unit_price,
  duration: row.duration,
  requiresDoctor: row.requires_doctor,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformMedication = (row: any): Medication => ({
  id: row.id,
  name: row.name,
  genericName: row.generic_name,
  form: row.form,
  strength: row.strength,
  manufacturer: row.manufacturer,
  unitPrice: row.unit_price,
  stockQuantity: row.stock_quantity,
  isActive: row.is_active,
  category: row.category,
  requiresPrescription: row.requires_prescription,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformMedicalExam = (row: any): MedicalExam => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  unitPrice: row.unit_price,
  duration: row.duration,
  preparationInstructions: row.preparation_instructions,
  isActive: row.is_active,
  requiresAppointment: row.requires_appointment,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformMedicalSupply = (row: any): MedicalSupply => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category,
  subCategory: row.sub_category,
  unitPrice: row.unit_price,
  stockQuantity: row.stock_quantity,
  minStockLevel: row.min_stock_level,
  supplier: row.supplier,
  reference: row.reference,
  expirationDate: row.expiration_date,
  isActive: row.is_active,
  requiresDoctor: row.requires_doctor,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformPrescription = (row: any): Prescription => ({
  id: row.id,
  consultationId: row.consultation_id,
  patientId: row.patient_id,
  doctorId: row.doctor_id,
  items: row.items,
  instructions: row.instructions,
  status: row.status,
  createdAt: row.created_at,
  validUntil: row.valid_until,
  billedAt: row.billed_at,
  updatedAt: row.updated_at,
});

const transformInvoice = (row: any): Invoice => ({
  id: row.id,
  patientId: row.patient_id,
  consultationId: row.consultation_id,
  prescriptionId: row.prescription_id || undefined,
  items: row.items,
  subtotal: row.subtotal,
  tax: row.tax,
  total: row.total,
  status: row.status,
  createdAt: row.created_at,
  dueDate: row.due_date,
  paidAt: row.paid_at,
  paymentMethod: row.payment_method,
  paymentReference: row.payment_reference,
  cashierId: row.cashier_id,
});

const transformConsultationCare = (row: any): ConsultationCare => ({
  id: row.id,
  consultationId: row.consultation_id,
  careId: row.care_id,
  quantity: row.quantity,
  unitPrice: row.unit_price,
  totalPrice: row.total_price,
  notes: row.notes,
  performedBy: row.performed_by,
  performedAt: row.performed_at,
  createdAt: row.created_at,
});

const transformConsultationSupply = (row: any): ConsultationSupply => ({
  id: row.id,
  consultationId: row.consultation_id,
  supplyId: row.supply_id,
  quantity: row.quantity,
  unitPrice: row.unit_price,
  totalPrice: row.total_price,
  notes: row.notes,
  usedBy: row.used_by,
  usedAt: row.used_at,
  createdAt: row.created_at,
});

const transformPayment = (row: any): Payment => ({
  id: row.id,
  invoiceId: row.invoice_id,
  amount: row.amount,
  method: row.method,
  reference: row.reference,
  notes: row.notes,
  cashierId: row.cashier_id,
  createdAt: row.created_at,
});

// Authentication
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
};

// Profiles
export const getProfiles = async (): Promise<Profile[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformProfile);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const getProfileByEmail = async (email: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data ? transformProfile(data) : null;
  } catch (error) {
    console.error('Error getting profile by email:', error);
    return null;
  }
};

export const createProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        avatar: profileData.avatar,
        specialization: profileData.specialization,
        phone: profileData.phone,
        is_active: profileData.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return transformProfile(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const createProfile = async (profileData: ProfileFormData): Promise<Profile> => {
  try {
    // First, create the user in Supabase Auth
    if (!profileData.password) {
      throw new Error('Password is required for new profile creation');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: profileData.email,
      password: profileData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // Then create the profile record using the auth user ID
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id, // Use the auth user ID
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
        avatar: profileData.avatar,
        specialization: profileData.specialization,
        phone: profileData.phone,
        is_active: profileData.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return transformProfile(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateProfile = async (id: string, profileData: Partial<ProfileFormData>): Promise<Profile> => {
  try {
    // If password is provided, update it in Supabase Auth
    if (profileData.password) {
      const { error: authError } = await supabase.auth.updateUser({
        password: profileData.password
      });
      
      if (authError) throw authError;
    }

    // Update the profile record (excluding password)
    const { password, ...profileUpdateData } = profileData;
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: profileUpdateData.name,
        email: profileUpdateData.email,
        role: profileUpdateData.role,
        avatar: profileUpdateData.avatar,
        specialization: profileUpdateData.specialization,
        phone: profileUpdateData.phone,
        is_active: profileUpdateData.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformProfile(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const deleteProfile = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
};

// Patients
export const getPatients = async (): Promise<Patient[]> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformPatient);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        emergency_contact: patientData.emergencyContact,
        blood_type: patientData.bloodType,
        allergies: patientData.allergies,
        medical_history: patientData.medicalHistory,
      })
      .select()
      .single();

    if (error) throw error;
    return transformPatient(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updatePatient = async (id: string, patientData: Partial<Patient>): Promise<Patient> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({
        first_name: patientData.firstName,
        last_name: patientData.lastName,
        date_of_birth: patientData.dateOfBirth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        emergency_contact: patientData.emergencyContact,
        blood_type: patientData.bloodType,
        allergies: patientData.allergies,
        medical_history: patientData.medicalHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformPatient(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Consultations
export const getConsultations = async (): Promise<Consultation[]> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data.map(transformConsultation);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createConsultation = async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Consultation> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        patient_id: consultationData.patientId,
        doctor_id: consultationData.doctorId,
        date: consultationData.date,
        time: consultationData.time,
        type: consultationData.type,
        status: consultationData.status,
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        duration: consultationData.duration,
      })
      .select()
      .single();

    if (error) throw error;
    return transformConsultation(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateConsultation = async (id: string, consultationData: Partial<Consultation>): Promise<Consultation> => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        patient_id: consultationData.patientId,
        doctor_id: consultationData.doctorId,
        date: consultationData.date,
        time: consultationData.time,
        type: consultationData.type,
        status: consultationData.status,
        symptoms: consultationData.symptoms,
        diagnosis: consultationData.diagnosis,
        notes: consultationData.notes,
        duration: consultationData.duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformConsultation(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Medical Cares
export const getMedicalCares = async (): Promise<MedicalCare[]> => {
  try {
    const { data, error } = await supabase
      .from('medical_cares')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(transformMedicalCare);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createMedicalCare = async (careData: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalCare> => {
  try {
    const { data, error } = await supabase
      .from('medical_cares')
      .insert({
        name: careData.name,
        description: careData.description,
        category: careData.category,
        unit_price: careData.unitPrice,
        duration: careData.duration,
        requires_doctor: careData.requiresDoctor,
        is_active: careData.isActive,
      })
      .select()
      .single();

    if (error) throw error;
    return transformMedicalCare(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateMedicalCare = async (id: string, careData: Partial<MedicalCare>): Promise<MedicalCare> => {
  try {
    const { data, error } = await supabase
      .from('medical_cares')
      .update({
        name: careData.name,
        description: careData.description,
        category: careData.category,
        unit_price: careData.unitPrice,
        duration: careData.duration,
        requires_doctor: careData.requiresDoctor,
        is_active: careData.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMedicalCare(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Medications
export const getMedications = async (): Promise<Medication[]> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(transformMedication);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .insert({
        name: medicationData.name,
        generic_name: medicationData.genericName,
        form: medicationData.form,
        strength: medicationData.strength,
        manufacturer: medicationData.manufacturer,
        unit_price: medicationData.unitPrice,
        stock_quantity: medicationData.stockQuantity,
        is_active: medicationData.isActive,
        category: medicationData.category,
        requires_prescription: medicationData.requiresPrescription,
      })
      .select()
      .single();

    if (error) throw error;
    return transformMedication(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateMedication = async (id: string, medicationData: Partial<Medication>): Promise<Medication> => {
  try {
    const { data, error } = await supabase
      .from('medications')
      .update({
        name: medicationData.name,
        generic_name: medicationData.genericName,
        form: medicationData.form,
        strength: medicationData.strength,
        manufacturer: medicationData.manufacturer,
        unit_price: medicationData.unitPrice,
        stock_quantity: medicationData.stockQuantity,
        is_active: medicationData.isActive,
        category: medicationData.category,
        requires_prescription: medicationData.requiresPrescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMedication(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Medical Exams
export const getMedicalExams = async (): Promise<MedicalExam[]> => {
  try {
    const { data, error } = await supabase
      .from('medical_exams')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(transformMedicalExam);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createMedicalExam = async (examData: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalExam> => {
  try {
    const { data, error } = await supabase
      .from('medical_exams')
      .insert({
        name: examData.name,
        description: examData.description,
        category: examData.category,
        unit_price: examData.unitPrice,
        duration: examData.duration,
        preparation_instructions: examData.preparationInstructions,
        is_active: examData.isActive,
        requires_appointment: examData.requiresAppointment,
      })
      .select()
      .single();

    if (error) throw error;
    return transformMedicalExam(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateMedicalExam = async (id: string, examData: Partial<MedicalExam>): Promise<MedicalExam> => {
  try {
    const { data, error } = await supabase
      .from('medical_exams')
      .update({
        name: examData.name,
        description: examData.description,
        category: examData.category,
        unit_price: examData.unitPrice,
        duration: examData.duration,
        preparation_instructions: examData.preparationInstructions,
        is_active: examData.isActive,
        requires_appointment: examData.requiresAppointment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMedicalExam(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Medical Supplies
export const getMedicalSupplies = async (): Promise<MedicalSupply[]> => {
  try {
    const { data, error } = await supabase
      .from('medical_supplies')
      .select('*')
      .order('name');

    if (error) throw error;
    return data.map(transformMedicalSupply);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createMedicalSupply = async (supplyData: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalSupply> => {
  try {
    const { data, error } = await supabase
      .from('medical_supplies')
      .insert({
        name: supplyData.name,
        description: supplyData.description,
        category: supplyData.category,
        sub_category: supplyData.subCategory,
        unit_price: supplyData.unitPrice,
        stock_quantity: supplyData.stockQuantity,
        min_stock_level: supplyData.minStockLevel,
        supplier: supplyData.supplier,
        reference: supplyData.reference,
        expiration_date: supplyData.expirationDate,
        is_active: supplyData.isActive,
        requires_doctor: supplyData.requiresDoctor,
      })
      .select()
      .single();

    if (error) throw error;
    return transformMedicalSupply(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateMedicalSupply = async (id: string, supplyData: Partial<MedicalSupply>): Promise<MedicalSupply> => {
  try {
    const { data, error } = await supabase
      .from('medical_supplies')
      .update({
        name: supplyData.name,
        description: supplyData.description,
        category: supplyData.category,
        sub_category: supplyData.subCategory,
        unit_price: supplyData.unitPrice,
        stock_quantity: supplyData.stockQuantity,
        min_stock_level: supplyData.minStockLevel,
        supplier: supplyData.supplier,
        reference: supplyData.reference,
        expiration_date: supplyData.expirationDate,
        is_active: supplyData.isActive,
        requires_doctor: supplyData.requiresDoctor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformMedicalSupply(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Prescriptions
export const getPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformPrescription);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prescription> => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        consultation_id: prescriptionData.consultationId,
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        items: prescriptionData.items,
        instructions: prescriptionData.instructions,
        status: prescriptionData.status,
        valid_until: prescriptionData.validUntil,
        billed_at: prescriptionData.billedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return transformPrescription(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updatePrescription = async (id: string, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .update({
        consultation_id: prescriptionData.consultationId,
        patient_id: prescriptionData.patientId,
        doctor_id: prescriptionData.doctorId,
        items: prescriptionData.items,
        instructions: prescriptionData.instructions,
        status: prescriptionData.status,
        valid_until: prescriptionData.validUntil,
        billed_at: prescriptionData.billedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformPrescription(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformInvoice);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        patient_id: invoiceData.patientId,
        consultation_id: invoiceData.consultationId,
        prescription_id: invoiceData.prescriptionId || null,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: invoiceData.status,
        created_at: invoiceData.createdAt,
        due_date: invoiceData.dueDate,
        paid_at: invoiceData.paidAt,
        payment_method: invoiceData.paymentMethod,
        payment_reference: invoiceData.paymentReference,
        cashier_id: invoiceData.cashierId,
      })
      .select()
      .single();

    if (error) throw error;
    return transformInvoice(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({
        patient_id: invoiceData.patientId,
        consultation_id: invoiceData.consultationId,
        prescription_id: invoiceData.prescriptionId || null,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: invoiceData.status,
        due_date: invoiceData.dueDate,
        paid_at: invoiceData.paidAt,
        payment_method: invoiceData.paymentMethod,
        payment_reference: invoiceData.paymentReference,
        cashier_id: invoiceData.cashierId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transformInvoice(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// Consultation Cares
export const getConsultationCares = async (consultationId?: string): Promise<ConsultationCare[]> => {
  try {
    let query = supabase.from('consultation_cares').select('*');
    
    if (consultationId) {
      query = query.eq('consultation_id', consultationId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformConsultationCare);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createConsultationCare = async (careData: Omit<ConsultationCare, 'id' | 'createdAt'>): Promise<ConsultationCare> => {
  try {
    const { data, error } = await supabase
      .from('consultation_cares')
      .insert({
        consultation_id: careData.consultationId,
        care_id: careData.careId,
        quantity: careData.quantity,
        unit_price: careData.unitPrice,
        total_price: careData.totalPrice,
        notes: careData.notes,
        performed_by: careData.performedBy,
        performed_at: careData.performedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return transformConsultationCare(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const deleteConsultationCare = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('consultation_cares')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
};

// Consultation Supplies
export const getConsultationSupplies = async (consultationId?: string): Promise<ConsultationSupply[]> => {
  try {
    let query = supabase.from('consultation_supplies').select('*');
    
    if (consultationId) {
      query = query.eq('consultation_id', consultationId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformConsultationSupply);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createConsultationSupply = async (supplyData: Omit<ConsultationSupply, 'id' | 'createdAt'>): Promise<ConsultationSupply> => {
  try {
    const { data, error } = await supabase
      .from('consultation_supplies')
      .insert({
        consultation_id: supplyData.consultationId,
        supply_id: supplyData.supplyId,
        quantity: supplyData.quantity,
        unit_price: supplyData.unitPrice,
        total_price: supplyData.totalPrice,
        notes: supplyData.notes,
        used_by: supplyData.usedBy,
        used_at: supplyData.usedAt,
      })
      .select()
      .single();

    if (error) throw error;
    return transformConsultationSupply(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

export const deleteConsultationSupply = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('consultation_supplies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
};

// Payments
export const getPayments = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(transformPayment);
  } catch (error) {
    handleSupabaseError(error);
    return [];
  }
};

export const createPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        invoice_id: paymentData.invoiceId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        notes: paymentData.notes,
        cashier_id: paymentData.cashierId,
      })
      .select()
      .single();

    if (error) throw error;
    return transformPayment(data);
  } catch (error) {
    handleSupabaseError(error);
    throw error;
  }
};

// System Settings
export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) throw error;
    return data?.settings || null;
  } catch (error) {
    console.error('Error getting system settings:', error);
    return null;
  }
};

export const updateSystemSettings = async (settings: SystemSettings): Promise<void> => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'default',
        settings,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error);
  }
};