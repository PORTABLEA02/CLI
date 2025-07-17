import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, ProfileFormData, Patient, Consultation, Treatment, Prescription, Invoice, DashboardStats, MedicalCare, ConsultationCare, Payment, Medication, MedicalExam, MedicalSupply, ConsultationSupply, SystemSettings } from '../types';
import { generateStockAlert } from '../utils/businessRules';
import { supabase } from '../lib/supabase';
import * as supabaseService from '../services/supabaseService';

interface AppContextType {
  currentProfile: Profile | null;
  profiles: Profile[];
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
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addProfile: (profileData: ProfileFormData) => Promise<void>;
  updateProfile: (id: string, profileData: Partial<ProfileFormData>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  addConsultation: (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateConsultation: (id: string, consultation: Partial<Consultation>) => Promise<void>;
  addTreatment: (treatment: Omit<Treatment, 'id' | 'createdAt'>) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => Promise<void>;
  addMedicalCare: (care: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicalCare: (id: string, care: Partial<MedicalCare>) => Promise<void>;
  addConsultationCare: (care: Omit<ConsultationCare, 'id' | 'createdAt'>) => Promise<void>;
  removeConsultationCare: (id: string) => Promise<void>;
  getConsultationCares: (consultationId: string) => ConsultationCare[];
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<void>;
  addMedicalExam: (exam: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicalExam: (id: string, exam: Partial<MedicalExam>) => Promise<void>;
  addMedicalSupply: (supply: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicalSupply: (id: string, supply: Partial<MedicalSupply>) => Promise<void>;
  addConsultationSupply: (supply: Omit<ConsultationSupply, 'id' | 'createdAt'>) => Promise<void>;
  removeConsultationSupply: (id: string) => Promise<void>;
  getConsultationSupplies: (consultationId: string) => ConsultationSupply[];
  generateInvoice: (consultationId: string) => Promise<void>;
  generateCustomInvoice: (consultationId: string, customItems: any[]) => Promise<Invoice | null>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updateSystemSettings: (settings: SystemSettings) => Promise<void>;
  updateInvoiceContent: (invoiceId: string, newItems: any[]) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Default system settings
const defaultSystemSettings: SystemSettings = {
  clinic: {
    name: 'ClinicPro',
    address: '123 Rue de la Santé, 75000 Paris, France',
    phone: '+33 1 23 45 67 89',
    email: 'contact@clinicpro.fr',
    website: 'www.clinicpro.fr',
    description: 'Clinique médicale moderne',
    ifu: 'IFU123456789'
  },
  system: {
    timezone: 'Europe/Paris',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'FCFA',
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
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [medicalCares, setMedicalCares] = useState<MedicalCare[]>([]);
  const [consultationCares, setConsultationCares] = useState<ConsultationCare[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicalExams, setMedicalExams] = useState<MedicalExam[]>([]);
  const [medicalSupplies, setMedicalSupplies] = useState<MedicalSupply[]>([]);
  const [consultationSupplies, setConsultationSupplies] = useState<ConsultationSupply[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayConsultations: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    completedConsultations: 0,
    cancelledConsultations: 0
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email) {
        const profile = await supabaseService.getProfileByEmail(session.user.email);
        setCurrentProfile(profile);
      } else if (event === 'SIGNED_OUT') {
        setCurrentProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Calculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [patients, consultations, invoices]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const currentProfile = await supabaseService.getProfileByEmail(user.email);
        setCurrentProfile(currentProfile);
      }

      // Load all data in parallel
      const [
        profilesData,
        patientsData,
        consultationsData,
        medicalCaresData,
        medicationsData,
        medicalExamsData,
        medicalSuppliesData,
        prescriptionsData,
        invoicesData,
        consultationCaresData,
        consultationSuppliesData,
        paymentsData,
        settingsData
      ] = await Promise.all([
        supabaseService.getProfiles(),
        supabaseService.getPatients(),
        supabaseService.getConsultations(),
        supabaseService.getMedicalCares(),
        supabaseService.getMedications(),
        supabaseService.getMedicalExams(),
        supabaseService.getMedicalSupplies(),
        supabaseService.getPrescriptions(),
        supabaseService.getInvoices(),
        supabaseService.getConsultationCares(),
        supabaseService.getConsultationSupplies(),
        supabaseService.getPayments(),
        supabaseService.getSystemSettings()
      ]);

      setProfiles(profilesData);
      setPatients(patientsData);
      setConsultations(consultationsData);
      setMedicalCares(medicalCaresData);
      setMedications(medicationsData);
      setMedicalExams(medicalExamsData);
      setMedicalSupplies(medicalSuppliesData);
      setPrescriptions(prescriptionsData);
      setInvoices(invoicesData);
      setConsultationCares(consultationCaresData);
      setConsultationSupplies(consultationSuppliesData);
      setPayments(paymentsData);
      
      if (settingsData) {
        setSystemSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authData = await supabaseService.signInWithEmail(email, password);
      if (authData?.user?.email) {
        const profile = await supabaseService.getProfileByEmail(authData.user.email);
        if (profile && profile.isActive) {
          // Update last login
          await supabaseService.updateProfile(profile.id, { lastLoginAt: new Date().toISOString() });
          setCurrentProfile(profile);
          
          // Refresh profiles list
          const updatedProfiles = await supabaseService.getProfiles();
          setProfiles(updatedProfiles);
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabaseService.signOut();
      setCurrentProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addProfile = async (profileData: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProfile = await supabaseService.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  };

  const addProfile = async (profileData: ProfileFormData) => {
    try {
      const newProfile = await supabaseService.createProfile(profileData);
      setProfiles(prev => [newProfile, ...prev]);
    } catch (error) {
      console.error('Error adding profile:', error);
      throw error;
    }
  };

  const updateProfile = async (id: string, profileData: Partial<ProfileFormData>) => {
    try {
      const updatedProfile = await supabaseService.updateProfile(id, profileData);
      setProfiles(prev => prev.map(p => p.id === id ? updatedProfile : p));
      
      // Update current profile if it's the same profile
      if (currentProfile?.id === id) {
        setCurrentProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await supabaseService.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPatient = await supabaseService.createPatient(patientData);
      setPatients(prev => [newPatient, ...prev]);
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const updatedPatient = await supabaseService.updatePatient(id, patientData);
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const addConsultation = async (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newConsultation = await supabaseService.createConsultation(consultationData);
      setConsultations(prev => [newConsultation, ...prev]);
    } catch (error) {
      console.error('Error adding consultation:', error);
      throw error;
    }
  };

  const updateConsultation = async (id: string, consultationData: Partial<Consultation>) => {
    try {
      const updatedConsultation = await supabaseService.updateConsultation(id, consultationData);
      setConsultations(prev => prev.map(c => c.id === id ? updatedConsultation : c));
    } catch (error) {
      console.error('Error updating consultation:', error);
      throw error;
    }
  };

  const addTreatment = (treatmentData: Omit<Treatment, 'id' | 'createdAt'>) => {
    const newTreatment: Treatment = {
      ...treatmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTreatments(prev => [...prev, newTreatment]);
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPrescription = await supabaseService.createPrescription(prescriptionData);
      setPrescriptions(prev => [newPrescription, ...prev]);
    } catch (error) {
      console.error('Error adding prescription:', error);
      throw error;
    }
  };

  const updatePrescription = async (id: string, prescriptionData: Partial<Prescription>) => {
    try {
      const updatedPrescription = await supabaseService.updatePrescription(id, prescriptionData);
      setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  };

  const addMedicalCare = async (careData: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCare = await supabaseService.createMedicalCare(careData);
      setMedicalCares(prev => [newCare, ...prev]);
    } catch (error) {
      console.error('Error adding medical care:', error);
      throw error;
    }
  };

  const updateMedicalCare = async (id: string, careData: Partial<MedicalCare>) => {
    try {
      const updatedCare = await supabaseService.updateMedicalCare(id, careData);
      setMedicalCares(prev => prev.map(c => c.id === id ? updatedCare : c));
    } catch (error) {
      console.error('Error updating medical care:', error);
      throw error;
    }
  };

  const addConsultationCare = async (careData: Omit<ConsultationCare, 'id' | 'createdAt'>) => {
    try {
      const newCare = await supabaseService.createConsultationCare(careData);
      setConsultationCares(prev => [newCare, ...prev]);
    } catch (error) {
      console.error('Error adding consultation care:', error);
      throw error;
    }
  };

  const removeConsultationCare = async (id: string) => {
    try {
      await supabaseService.deleteConsultationCare(id);
      setConsultationCares(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error removing consultation care:', error);
      throw error;
    }
  };

  const getConsultationCares = (consultationId: string) => {
    return consultationCares.filter(care => care.consultationId === consultationId);
  };

  const addMedication = async (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newMedication = await supabaseService.createMedication(medicationData);
      setMedications(prev => [newMedication, ...prev]);
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  };

  const updateMedication = async (id: string, medicationData: Partial<Medication>) => {
    try {
      const updatedMedication = await supabaseService.updateMedication(id, medicationData);
      setMedications(prev => prev.map(m => m.id === id ? updatedMedication : m));
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  };

  const addMedicalExam = async (examData: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newExam = await supabaseService.createMedicalExam(examData);
      setMedicalExams(prev => [newExam, ...prev]);
    } catch (error) {
      console.error('Error adding medical exam:', error);
      throw error;
    }
  };

  const updateMedicalExam = async (id: string, examData: Partial<MedicalExam>) => {
    try {
      const updatedExam = await supabaseService.updateMedicalExam(id, examData);
      setMedicalExams(prev => prev.map(e => e.id === id ? updatedExam : e));
    } catch (error) {
      console.error('Error updating medical exam:', error);
      throw error;
    }
  };

  const addMedicalSupply = async (supplyData: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSupply = await supabaseService.createMedicalSupply(supplyData);
      setMedicalSupplies(prev => [newSupply, ...prev]);
    } catch (error) {
      console.error('Error adding medical supply:', error);
      throw error;
    }
  };

  const updateMedicalSupply = async (id: string, supplyData: Partial<MedicalSupply>) => {
    try {
      const updatedSupply = await supabaseService.updateMedicalSupply(id, supplyData);
      setMedicalSupplies(prev => prev.map(s => s.id === id ? updatedSupply : s));
    } catch (error) {
      console.error('Error updating medical supply:', error);
      throw error;
    }
  };

  const addConsultationSupply = async (supplyData: Omit<ConsultationSupply, 'id' | 'createdAt'>) => {
    try {
      const newSupply = await supabaseService.createConsultationSupply(supplyData);
      setConsultationSupplies(prev => [newSupply, ...prev]);

      // Update stock quantity
      const supply = medicalSupplies.find(s => s.id === supplyData.supplyId);
      if (supply) {
        const newStockQuantity = supply.stockQuantity - supplyData.quantity;
        
        if (newStockQuantity <= supply.minStockLevel && supply.stockQuantity > supply.minStockLevel) {
          console.warn(generateStockAlert({ ...supply, stockQuantity: newStockQuantity }));
        }
        
        await updateMedicalSupply(supply.id, { 
          stockQuantity: Math.max(0, newStockQuantity) 
        });
      }
    } catch (error) {
      console.error('Error adding consultation supply:', error);
      throw error;
    }
  };

  const removeConsultationSupply = async (id: string) => {
    try {
      const supplyToRemove = consultationSupplies.find(s => s.id === id);
      
      if (supplyToRemove) {
        // Restore stock
        const supply = medicalSupplies.find(s => s.id === supplyToRemove.supplyId);
        if (supply) {
          await updateMedicalSupply(supply.id, { 
            stockQuantity: supply.stockQuantity + supplyToRemove.quantity 
          });
        }
      }
      
      await supabaseService.deleteConsultationSupply(id);
      setConsultationSupplies(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error removing consultation supply:', error);
      throw error;
    }
  };

  const getConsultationSupplies = (consultationId: string) => {
    return consultationSupplies.filter(supply => supply.consultationId === consultationId);
  };

  const generateInvoice = async (consultationId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    const consultationTreatments = treatments.filter(t => t.consultationId === consultationId);
    const relatedCares = consultationCares.filter(c => c.consultationId === consultationId);
    const relatedSupplies = consultationSupplies.filter(s => s.consultationId === consultationId);
    
    // Find associated prescription
    const associatedPrescription = prescriptions.find(p => 
      p.consultationId === consultationId && 
      (p.status === 'active' || p.status === 'completed')
    );
    
    if (!consultation) return;

    // Helper function to get item details from catalogs
    const getItemDetails = (type: string, itemId: string) => {
      switch (type) {
        case 'medication':
          return medications.find(m => m.id === itemId);
        case 'exam':
          return medicalExams.find(e => e.id === itemId);
        case 'care':
          return medicalCares.find(c => c.id === itemId);
        default:
          return null;
      }
    };

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
      })
    ];

    // Add prescription items if prescription exists
    if (associatedPrescription) {
      const prescriptionItems = associatedPrescription.items.map(prescItem => {
        const itemDetails = getItemDetails(prescItem.type, prescItem.itemId);
        return {
          id: `prescription-${prescItem.id}`,
          name: itemDetails?.name || 'Article inconnu',
          description: itemDetails?.description || prescItem.instructions || '',
          quantity: prescItem.quantity,
          unitPrice: prescItem.unitPrice,
          total: prescItem.totalPrice
        };
      });
      items.push(...prescriptionItems);
    }
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (systemSettings.system.taxRate / 100);
    const total = subtotal + tax;

    const newInvoice: Omit<Invoice, 'id'> = {
      patientId: consultation.patientId,
      consultationId: consultation.id,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      const createdInvoice = await supabaseService.createInvoice(newInvoice);
      setInvoices(prev => [createdInvoice, ...prev]);
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  };

  const generateCustomInvoice = async (consultationId: string, customItems: any[]): Promise<Invoice | null> => {
    const consultation = consultations.find(c => c.id === consultationId);
    const consultationTreatments = treatments.filter(t => t.consultationId === consultationId);
    const relatedCares = consultationCares.filter(c => c.consultationId === consultationId);
    const relatedSupplies = consultationSupplies.filter(s => s.consultationId === consultationId);
    
    // Find associated prescription
    const associatedPrescription = prescriptions.find(p => 
      p.consultationId === consultationId && 
      (p.status === 'active' || p.status === 'completed')
    );
    
    if (!consultation) return null;

    // Helper function to get item details from catalogs
    const getItemDetails = (type: string, itemId: string) => {
      switch (type) {
        case 'medication':
          return medications.find(m => m.id === itemId);
        case 'exam':
          return medicalExams.find(e => e.id === itemId);
        case 'care':
          return medicalCares.find(c => c.id === itemId);
        default:
          return null;
      }
    };
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

    // Add prescription items if prescription exists
    if (associatedPrescription) {
      const prescriptionItems = associatedPrescription.items.map(prescItem => {
        const itemDetails = getItemDetails(prescItem.type, prescItem.itemId);
        return {
          id: `prescription-${prescItem.id}`,
          name: itemDetails?.name || 'Article inconnu',
          description: itemDetails?.description || prescItem.instructions || '',
          quantity: prescItem.quantity,
          unitPrice: prescItem.unitPrice,
          total: prescItem.totalPrice
        };
      });
      items.push(...prescriptionItems);
    }
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = systemSettings?.system?.taxRate || 8;
    const tax = subtotal * (taxRate / 100);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const newInvoice: Omit<Invoice, 'id'> = {
      patientId: consultation.patientId,
      consultationId: consultation.id,
      prescriptionId: associatedPrescription?.id,
      prescriptionId: associatedPrescription?.id,
      items,
      subtotal,
      tax,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    try {
      const createdInvoice = await supabaseService.createInvoice(newInvoice);
      setInvoices(prev => [createdInvoice, ...prev]);
      
      // Mark prescription as billed if it exists
      if (associatedPrescription) {
        await updatePrescription(associatedPrescription.id, { 
          status: 'billed',
          billedAt: new Date().toISOString()
        });
      }
      
      
      // Mark prescription as billed if it exists
      if (associatedPrescription) {
        await updatePrescription(associatedPrescription.id, { 
          status: 'billed',
          billedAt: new Date().toISOString()
        });
      }
      return createdInvoice;
    } catch (error) {
      console.error('Error generating custom invoice:', error);
      throw error;
    }
  };

  const updateInvoiceStatus = async (id: string, status: Invoice['status']) => {
    try {
      const invoice = invoices.find(i => i.id === id);
      if (!invoice) return;

      const updatedInvoice = await supabaseService.updateInvoice(id, { 
        status, 
        paidAt: status === 'paid' ? new Date().toISOString() : invoice.paidAt 
      });
      
      setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    try {
      const newPayment = await supabaseService.createPayment(paymentData);
      setPayments(prev => [newPayment, ...prev]);

      // Update invoice with payment information
      const invoice = invoices.find(i => i.id === paymentData.invoiceId);
      if (invoice) {
        await updateInvoiceStatus(paymentData.invoiceId, 'paid');
        await supabaseService.updateInvoice(paymentData.invoiceId, {
          paymentMethod: paymentData.method,
          paymentReference: paymentData.reference,
          cashierId: paymentData.cashierId
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const updateSystemSettings = async (settings: SystemSettings): Promise<void> => {
    try {
      await supabaseService.updateSystemSettings(settings);
      setSystemSettings(settings);
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  };

  const updateInvoiceContent = async (invoiceId: string, newItems: any[]) => {
    try {
      const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * (systemSettings.system.taxRate / 100);
      const total = subtotal + tax;
      
      const updatedInvoice = await supabaseService.updateInvoice(invoiceId, {
        items: newItems,
        subtotal,
        tax,
        total
      });
      
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId ? updatedInvoice : invoice
      ));
    } catch (error) {
      console.error('Error updating invoice content:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      currentProfile,
      profiles,
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
      isLoading,
      login,
      logout,
      addProfile,
      updateProfile,
      deleteProfile,
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
      updateSystemSettings,
      updateInvoiceContent
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