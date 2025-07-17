import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Patient, Consultation, Treatment, Prescription, Invoice, DashboardStats, MedicalCare, ConsultationCare, Payment, Medication, MedicalExam, MedicalSupply, ConsultationSupply, SystemSettings } from '../types';
import { generateStockAlert } from '../utils/businessRules';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  consultations: Consultation[];
  treatments: Treatment[];
  prescriptions: Prescription[];
  invoices: Invoice[];
  medicalCares: MedicalCare[];
  consultationCares: ConsultationCare[];
  payments: Payment[];
  medications: Medication[];
  medicalExams: MedicalExam[];
  medicalSupplies: MedicalSupply[];
  consultationSupplies: ConsultationSupply[];
  stats: DashboardStats;
  systemSettings: SystemSettings;
  login: (email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateConsultation: (id: string, consultation: Partial<Consultation>) => void;
  addTreatment: (treatment: Omit<Treatment, 'id' | 'createdAt'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => void;
  addMedicalCare: (care: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicalCare: (id: string, care: Partial<MedicalCare>) => void;
  addConsultationCare: (care: Omit<ConsultationCare, 'id' | 'createdAt'>) => void;
  removeConsultationCare: (id: string) => void;
  getConsultationCares: (consultationId: string) => ConsultationCare[];
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  addMedicalExam: (exam: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicalExam: (id: string, exam: Partial<MedicalExam>) => void;
  addMedicalSupply: (supply: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicalSupply: (id: string, supply: Partial<MedicalSupply>) => void;
  addConsultationSupply: (supply: Omit<ConsultationSupply, 'id' | 'createdAt'>) => void;
  removeConsultationSupply: (id: string) => void;
  getConsultationSupplies: (consultationId: string) => ConsultationSupply[];
  generateInvoice: (consultationId: string) => void;
  generateCustomInvoice: (consultationId: string, customItems: any[]) => void;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@clinic.com',
    role: 'admin',
    specialization: 'Cardiology',
    phone: '+1 (555) 123-4567',
    isActive: true,
    lastLoginAt: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@clinic.com',
    role: 'doctor',
    specialization: 'Pediatrics',
    phone: '+1 (555) 123-4568',
    isActive: true,
    lastLoginAt: '2024-01-19T14:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-19T14:30:00Z'
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.wilson@clinic.com',
    role: 'cashier',
    phone: '+1 (555) 123-4569',
    isActive: true,
    lastLoginAt: '2024-01-20T08:15:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T08:15:00Z'
  }
];

const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    phone: '+1 (555) 987-6543',
    email: 'john.doe@email.com',
    address: '123 Main St, Anytown, ST 12345',
    emergencyContact: 'Jane Doe - +1 (555) 987-6544',
    bloodType: 'A+',
    allergies: 'Penicillin',
    medicalHistory: 'Hypertension, Diabetes Type 2',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Alice',
    lastName: 'Smith',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    phone: '+1 (555) 987-6545',
    email: 'alice.smith@email.com',
    address: '456 Oak Ave, Somewhere, ST 12346',
    emergencyContact: 'Bob Smith - +1 (555) 987-6546',
    bloodType: 'B-',
    allergies: 'None',
    medicalHistory: 'Asthma',
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  }
];

const mockConsultations: Consultation[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    date: '2024-01-20',
    time: '09:00',
    type: 'general',
    status: 'scheduled',
    symptoms: 'Chest pain, shortness of breath',
    duration: 30,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '1',
    date: '2024-01-19',
    time: '14:00',
    type: 'followup',
    status: 'completed',
    symptoms: 'Follow-up for asthma treatment',
    diagnosis: 'Asthma under control',
    notes: 'Continue current medication regimen',
    duration: 20,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-19T14:30:00Z'
  }
];

const mockMedicalCares: MedicalCare[] = [
  {
    id: '1',
    name: 'Pansement simple',
    description: 'Application d\'un pansement stérile sur plaie superficielle',
    category: 'nursing',
    unitPrice: 15.00,
    duration: 10,
    requiresDoctor: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Injection intramusculaire',
    description: 'Administration d\'un médicament par voie intramusculaire',
    category: 'injection',
    unitPrice: 25.00,
    duration: 5,
    requiresDoctor: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Perfusion intraveineuse',
    description: 'Mise en place et surveillance d\'une perfusion IV',
    category: 'nursing',
    unitPrice: 45.00,
    duration: 30,
    requiresDoctor: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Électrocardiogramme',
    description: 'Enregistrement de l\'activité électrique du cœur',
    category: 'examination',
    unitPrice: 35.00,
    duration: 15,
    requiresDoctor: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Suture simple',
    description: 'Suture de plaie simple (moins de 5 cm)',
    category: 'procedure',
    unitPrice: 65.00,
    duration: 20,
    requiresDoctor: true,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Doliprane',
    genericName: 'Paracétamol',
    form: 'tablet',
    strength: '500mg',
    manufacturer: 'Sanofi',
    unitPrice: 3.50,
    stockQuantity: 100,
    isActive: true,
    category: 'analgesic',
    requiresPrescription: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Amoxicilline',
    genericName: 'Amoxicilline',
    form: 'capsule',
    strength: '500mg',
    manufacturer: 'Pfizer',
    unitPrice: 8.20,
    stockQuantity: 50,
    isActive: true,
    category: 'antibiotic',
    requiresPrescription: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Ventoline',
    genericName: 'Salbutamol',
    form: 'inhaler',
    strength: '100mcg/dose',
    manufacturer: 'GSK',
    unitPrice: 12.50,
    stockQuantity: 25,
    isActive: true,
    category: 'respiratory',
    requiresPrescription: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Efferalgan',
    genericName: 'Paracétamol',
    form: 'syrup',
    strength: '30mg/ml',
    manufacturer: 'UPSA',
    unitPrice: 4.80,
    stockQuantity: 75,
    isActive: true,
    category: 'analgesic',
    requiresPrescription: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMedicalExams: MedicalExam[] = [
  {
    id: '1',
    name: 'Radiographie thoracique',
    description: 'Examen radiologique du thorax pour détecter les anomalies pulmonaires',
    category: 'radiology',
    unitPrice: 45.00,
    duration: 15,
    preparationInstructions: 'Retirer tous les bijoux et objets métalliques',
    isActive: true,
    requiresAppointment: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Échographie abdominale',
    description: 'Examen échographique de l\'abdomen',
    category: 'ultrasound',
    unitPrice: 65.00,
    duration: 30,
    preparationInstructions: 'Jeûne de 6 heures avant l\'examen',
    isActive: true,
    requiresAppointment: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Analyse de sang complète',
    description: 'Numération formule sanguine complète avec plaquettes',
    category: 'laboratory',
    unitPrice: 25.00,
    duration: 10,
    preparationInstructions: 'Jeûne de 12 heures recommandé',
    isActive: true,
    requiresAppointment: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Électrocardiogramme',
    description: 'Enregistrement de l\'activité électrique du cœur',
    category: 'cardiology',
    unitPrice: 35.00,
    duration: 15,
    isActive: true,
    requiresAppointment: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockMedicalSupplies: MedicalSupply[] = [
  {
    id: '1',
    name: 'Cathéter urinaire Foley',
    description: 'Cathéter urinaire à demeure en silicone, stérile',
    category: 'disposable',
    subCategory: 'catheter',
    unitPrice: 12.50,
    stockQuantity: 50,
    minStockLevel: 10,
    supplier: 'MedSupply Co.',
    reference: 'CAT-FOL-16',
    isActive: true,
    requiresDoctor: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Seringue 10ml',
    description: 'Seringue jetable stérile 10ml avec aiguille',
    category: 'disposable',
    subCategory: 'syringe',
    unitPrice: 0.85,
    stockQuantity: 500,
    minStockLevel: 100,
    supplier: 'MedSupply Co.',
    reference: 'SYR-10ML',
    isActive: true,
    requiresDoctor: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bande élastique 10cm',
    description: 'Bande de contention élastique 10cm x 4m',
    category: 'consumable',
    subCategory: 'bandage',
    unitPrice: 3.20,
    stockQuantity: 200,
    minStockLevel: 50,
    supplier: 'BandagePro',
    reference: 'BAND-EL-10',
    isActive: true,
    requiresDoctor: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Gants latex stériles',
    description: 'Gants d\'examen en latex stériles, taille M',
    category: 'protective',
    subCategory: 'gloves',
    unitPrice: 0.25,
    stockQuantity: 1000,
    minStockLevel: 200,
    supplier: 'SafetyFirst',
    reference: 'GLV-LAT-M',
    isActive: true,
    requiresDoctor: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Compresses stériles 10x10',
    description: 'Compresses de gaze stériles 10x10cm, boîte de 25',
    category: 'consumable',
    subCategory: 'gauze',
    unitPrice: 8.50,
    stockQuantity: 150,
    minStockLevel: 30,
    supplier: 'MedSupply Co.',
    reference: 'COMP-10X10',
    isActive: true,
    requiresDoctor: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Sonde nasogastrique',
    description: 'Sonde nasogastrique en PVC, CH16',
    category: 'disposable',
    subCategory: 'tube',
    unitPrice: 15.80,
    stockQuantity: 25,
    minStockLevel: 5,
    supplier: 'MedTech Solutions',
    reference: 'SNG-CH16',
    isActive: true,
    requiresDoctor: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Masque chirurgical',
    description: 'Masque chirurgical 3 plis, boîte de 50',
    category: 'protective',
    subCategory: 'mask',
    unitPrice: 12.00,
    stockQuantity: 300,
    minStockLevel: 50,
    supplier: 'SafetyFirst',
    reference: 'MASK-3PLI',
    isActive: true,
    requiresDoctor: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '8',
    name: 'Perfuseur',
    description: 'Perfuseur avec régulateur de débit',
    category: 'disposable',
    subCategory: 'infusion',
    unitPrice: 4.50,
    stockQuantity: 100,
    minStockLevel: 20,
    supplier: 'InfusionTech',
    reference: 'PERF-REG',
    isActive: true,
    requiresDoctor: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [medicalCares, setMedicalCares] = useState<MedicalCare[]>(mockMedicalCares);
  const [consultationCares, setConsultationCares] = useState<ConsultationCare[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>(mockMedicalExams);
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>(mockMedicalSupplies);
  const [consultationSupplies, setConsultationSupplies] = useState<ConsultationSupply[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    clinic: {
      name: 'ClinicPro',
      address: '123 Rue de la Santé, 75000 Paris, France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@clinicpro.fr',
      website: 'www.clinicpro.fr',
      description: 'Clinique médicale moderne'
    },
    system: {
      timezone: 'Europe/Paris',
      language: 'fr',
      dateFormat: 'DD/MM/YYYY',
      currency: 'EUR',
      taxRate: 8,
      sessionTimeout: 30,
      backupFrequency: 'daily',
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      paymentReminders: true,
      stockAlerts: true,
      systemAlerts: true
    },
    billing: {
      invoicePrefix: 'INV',
      invoiceNumbering: 'auto',
      paymentTerms: 30,
      lateFee: 5,
      defaultTaxRate: 8,
      acceptedPaymentMethods: ['cash', 'card', 'mobile_money', 'bank_transfer']
    }
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayConsultations: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    completedConsultations: 0,
    cancelledConsultations: 0
  });

  useEffect(() => {
    // Calculate stats
    const today = new Date().toISOString().split('T')[0];
    const completedCount = consultations.filter(c => c.status === 'completed').length;
    const cancelledCount = consultations.filter(c => c.status === 'cancelled').length;
    const todayCount = consultations.filter(c => c.date === today).length;
    const pendingInvoicesCount = invoices.filter(i => i.status === 'pending').length;
    const monthlyRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    setStats({
      totalPatients: patients.length,
      todayConsultations: todayCount,
      pendingInvoices: pendingInvoicesCount,
      monthlyRevenue,
      completedConsultations: completedCount,
      cancelledConsultations: cancelledCount
    });
  }, [patients, consultations, invoices]);

  const updateSystemSettings = async (settings: SystemSettings): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSystemSettings(settings);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    const user = users.find(u => u.email === email && u.isActive);
    if (user && password === 'password') {
      // Update last login
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, lastLoginAt: new Date().toISOString() } : u
      ));
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, ...userData, updatedAt: new Date().toISOString() } : u
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(p => 
      p.id === id ? { ...p, ...patientData, updatedAt: new Date().toISOString() } : p
    ));
  };

  const addConsultation = (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConsultation: Consultation = {
      ...consultationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConsultations(prev => [...prev, newConsultation]);
  };

  const updateConsultation = (id: string, consultationData: Partial<Consultation>) => {
    setConsultations(prev => prev.map(c => 
      c.id === id ? { ...c, ...consultationData, updatedAt: new Date().toISOString() } : c
    ));
  };

  const addTreatment = (treatmentData: Omit<Treatment, 'id' | 'createdAt'>) => {
    const newTreatment: Treatment = {
      ...treatmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTreatments(prev => [...prev, newTreatment]);
  };

  const addPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setPrescriptions(prev => [...prev, newPrescription]);
  };

  const updatePrescription = (id: string, prescriptionData: Partial<Prescription>) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === id ? { ...p, ...prescriptionData, updatedAt: new Date().toISOString() } : p
    ));
  };

  const addMedicalCare = (careData: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCare: MedicalCare = {
      ...careData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMedicalCares(prev => [...prev, newCare]);
  };

  const updateMedicalCare = (id: string, careData: Partial<MedicalCare>) => {
    setMedicalCares(prev => prev.map(c => 
      c.id === id ? { ...c, ...careData, updatedAt: new Date().toISOString() } : c
    ));
  };

  const addConsultationCare = (careData: Omit<ConsultationCare, 'id' | 'createdAt'>) => {
    const newCare: ConsultationCare = {
      ...careData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setConsultationCares(prev => [...prev, newCare]);
  };

  const removeConsultationCare = (id: string) => {
    setConsultationCares(prev => prev.filter(c => c.id !== id));
  };

  const getConsultationCares = (consultationId: string) => {
    return consultationCares.filter(care => care.consultationId === consultationId);
  };

  const addMedication = (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMedication: Medication = {
      ...medicationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMedications(prev => [...prev, newMedication]);
  };

  const updateMedication = (id: string, medicationData: Partial<Medication>) => {
    setMedications(prev => prev.map(m => 
      m.id === id ? { ...m, ...medicationData, updatedAt: new Date().toISOString() } : m
    ));
  };

  const addMedicalExam = (examData: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExam: MedicalExam = {
      ...examData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMedicalExams(prev => [...prev, newExam]);
  };

  const updateMedicalExam = (id: string, examData: Partial<MedicalExam>) => {
    setMedicalExams(prev => prev.map(e => 
      e.id === id ? { ...e, ...examData, updatedAt: new Date().toISOString() } : e
    ));
  };

  const addMedicalSupply = (supplyData: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupply: MedicalSupply = {
      ...supplyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMedicalSupplies(prev => [...prev, newSupply]);
  };

  const updateMedicalSupply = (id: string, supplyData: Partial<MedicalSupply>) => {
    setMedicalSupplies(prev => prev.map(s => 
      s.id === id ? { ...s, ...supplyData, updatedAt: new Date().toISOString() } : s
    ));
  };

  const addConsultationSupply = (supplyData: Omit<ConsultationSupply, 'id' | 'createdAt'>) => {
    const newSupply: ConsultationSupply = {
      ...supplyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setConsultationSupplies(prev => [...prev, newSupply]);

    // Décrémenter le stock de la fourniture utilisée
    setMedicalSupplies(prev => prev.map(supply => {
      if (supply.id === supplyData.supplyId) {
        const newStockQuantity = supply.stockQuantity - supplyData.quantity;
        
        // Alerte si le stock devient faible après utilisation
        if (newStockQuantity <= supply.minStockLevel && supply.stockQuantity > supply.minStockLevel) {
          // Déclencher une alerte (dans une vraie app, ceci pourrait être une notification)
          console.warn(generateStockAlert({ ...supply, stockQuantity: newStockQuantity }));
        }
        
        // Empêcher le stock négatif
        return {
          ...supply,
          stockQuantity: Math.max(0, newStockQuantity),
          updatedAt: new Date().toISOString()
        };
      }
      return supply;
    }));
  };

  const removeConsultationSupply = (id: string) => {
    // Récupérer les détails de la fourniture avant suppression pour restaurer le stock
    const supplyToRemove = consultationSupplies.find(s => s.id === id);
    
    if (supplyToRemove) {
      // Restaurer le stock lors de la suppression
      setMedicalSupplies(prev => prev.map(supply => {
        if (supply.id === supplyToRemove.supplyId) {
          return {
            ...supply,
            stockQuantity: supply.stockQuantity + supplyToRemove.quantity,
            updatedAt: new Date().toISOString()
          };
        }
        return supply;
      }));
    }
    
    setConsultationSupplies(prev => prev.filter(s => s.id !== id));
  };

  const getConsultationSupplies = (consultationId: string) => {
    return consultationSupplies.filter(supply => supply.consultationId === consultationId);
  };

  const generateInvoice = (consultationId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    const consultationTreatments = treatments.filter(t => t.consultationId === consultationId);
    const relatedCares = consultationCares.filter(c => c.consultationId === consultationId);
    const relatedSupplies = consultationSupplies.filter(s => s.consultationId === consultationId);
    
    if (!consultation) return;

    const items: any[] = [
      {
        id: '1',
        name: 'Consultation',
        description: `${consultation.type} consultation`,
        quantity: 1,
        unitPrice: 100,
        total: 100
      },
      ...consultationTreatments.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        quantity: 1,
        unitPrice: t.cost,
        total: t.cost
      })),
      ...relatedCares.map(care => {
        const careDetails = medicalCares.find(mc => mc.id === care.careId);
        return {
          id: care.id,
          name: careDetails?.name || 'Soin inconnu',
          description: careDetails?.description || '',
          quantity: care.quantity,
          unitPrice: care.unitPrice,
          total: care.totalPrice
        };
      }),
      ...relatedSupplies.map(supply => {
        const supplyDetails = medicalSupplies.find(ms => ms.id === supply.supplyId);
        return {
          id: supply.id,
          name: supplyDetails?.name || 'Produit inconnu',
          description: supplyDetails?.description || '',
          quantity: supply.quantity,
          unitPrice: supply.unitPrice,
          total: supply.totalPrice
        };
      })
    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      patientId: consultation.patientId,
      consultationId: consultation.id,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    setInvoices(prev => [...prev, newInvoice]);
  };

  const generateCustomInvoice = (consultationId: string, customItems: any[]) => {
    const consultation = consultations.find(c => c.id === consultationId);
    const consultationTreatments = treatments.filter(t => t.consultationId === consultationId);
    const relatedCares = consultationCares.filter(c => c.consultationId === consultationId);
    const relatedSupplies = consultationSupplies.filter(s => s.consultationId === consultationId);
    
    if (!consultation) return;

    const items: any[] = [
      {
        id: '1',
        name: 'Consultation',
        description: `Consultation ${consultation.type}`,
        quantity: 1,
        unitPrice: 100,
        total: 100
      },
      ...consultationTreatments.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        quantity: 1,
        unitPrice: t.cost,
        total: t.cost
      })),
      ...relatedCares.map(care => {
        const careDetails = medicalCares.find(mc => mc.id === care.careId);
        return {
          id: care.id,
          name: careDetails?.name || 'Soin inconnu',
          description: careDetails?.description || '',
          quantity: care.quantity,
          unitPrice: care.unitPrice,
          total: care.totalPrice
        };
      }),
      ...relatedSupplies.map(supply => {
        const supplyDetails = medicalSupplies.find(ms => ms.id === supply.supplyId);
        return {
          id: supply.id,
          name: supplyDetails?.name || 'Produit inconnu',
          description: supplyDetails?.description || '',
          quantity: supply.quantity,
          unitPrice: supply.unitPrice,
          total: supply.totalPrice
        };
      }),
      ...customItems
    ];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      patientId: consultation.patientId,
      consultationId: consultation.id,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(i => 
      i.id === id ? { 
        ...i, 
        status, 
        paidAt: status === 'paid' ? new Date().toISOString() : i.paidAt 
      } : i
    ));
  };

  const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPayments(prev => [...prev, newPayment]);

    // Update invoice with payment information
    setInvoices(prev => prev.map(invoice => 
      invoice.id === paymentData.invoiceId ? {
        ...invoice,
        paymentMethod: paymentData.method,
        paymentReference: paymentData.reference,
        cashierId: paymentData.cashierId
      } : invoice
    ));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      patients,
      consultations,
      treatments,
      prescriptions,
      invoices,
      medicalCares,
      consultationCares,
      payments,
      medications,
      medicalExams,
      medicalSupplies,
      consultationSupplies,
      stats,
      systemSettings,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addPatient,
      updatePatient,
      addConsultation,
      updateConsultation,
      addTreatment,
      addPrescription,
      updatePrescription,
      addMedicalCare,
      updateMedicalCare,
      addConsultationCare,
      removeConsultationCare,
      getConsultationCares,
      addMedication,
      updateMedication,
      addMedicalExam,
      updateMedicalExam,
      addMedicalSupply,
      updateMedicalSupply,
      addConsultationSupply,
      removeConsultationSupply,
      getConsultationSupplies,
      generateInvoice,
      generateCustomInvoice,
      updateInvoiceStatus,
      addPayment,
      updateSystemSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};