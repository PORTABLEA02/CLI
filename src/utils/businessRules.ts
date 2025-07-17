// Utilitaires pour les règles métier de la clinique

import { Patient, Medication, Prescription, MedicalSupply } from '../types';

/**
 * Vérifie si une prescription est encore valide
 */
export const isPrescriptionValid = (prescription: Prescription): boolean => {
  const validUntilDate = new Date(prescription.validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validUntilDate.setHours(0, 0, 0, 0);
  
  return validUntilDate > today;
};

/**
 * Vérifie si un patient est allergique à un médicament
 */
export const checkMedicationAllergy = (patient: Patient, medication: any): boolean => {
  if (!patient.allergies) return false;
  
  const allergies = patient.allergies.toLowerCase();
  const medicationName = medication.name.toLowerCase();
  const genericName = medication.genericName?.toLowerCase() || '';
  
  return allergies.includes(medicationName) || (genericName && allergies.includes(genericName));
};

/**
 * Vérifie si une fourniture a un stock suffisant
 */
export const hasEnoughStock = (supply: MedicalSupply, requestedQuantity: number): boolean => {
  return supply.stockQuantity >= requestedQuantity;
};

/**
 * Vérifie si le stock d'une fourniture est faible
 */
export const isStockLow = (supply: MedicalSupply): boolean => {
  return supply.stockQuantity <= supply.minStockLevel;
};

/**
 * Calcule l'âge d'un patient à partir de sa date de naissance
 */
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Valide une date de prescription
 */
export const validatePrescriptionDate = (validUntil: string): { isValid: boolean; message?: string } => {
  const validUntilDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validUntilDate.setHours(0, 0, 0, 0);
  
  if (validUntilDate <= today) {
    return {
      isValid: false,
      message: 'La date de validité de la prescription doit être dans le futur.'
    };
  }
  
  // Vérifier que la date n'est pas trop loin dans le futur (ex: max 1 an)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (validUntilDate > oneYearFromNow) {
    return {
      isValid: false,
      message: 'La date de validité ne peut pas dépasser un an.'
    };
  }
  
  return { isValid: true };
};

/**
 * Formate un message d'alerte pour les allergies
 */
export const formatAllergyWarning = (patient: Patient, medications: any[]): string => {
  const allergyWarnings = medications
    .filter(med => checkMedicationAllergy(patient, med))
    .map(med => `• ${med.name}${med.genericName ? ` (${med.genericName})` : ''}`);
  
  if (allergyWarnings.length === 0) return '';
  
  return `⚠️ ALERTE ALLERGIES DÉTECTÉES ⚠️\n\nLe patient ${patient.firstName} ${patient.lastName} est allergique aux médicaments suivants :\n\n${allergyWarnings.join('\n')}\n\nÊtes-vous sûr de vouloir créer cette prescription ?`;
};

/**
 * Vérifie les interactions médicamenteuses basiques
 * (Implémentation simplifiée - dans un vrai système, ceci serait plus complexe)
 */
export const checkBasicDrugInteractions = (medications: Medication[]): string[] => {
  const interactions: string[] = [];
  
  // Exemple d'interaction simple : antibiotiques + anticoagulants
  const hasAntibiotic = medications.some(med => med.category === 'antibiotic');
  const hasCardiovascular = medications.some(med => med.category === 'cardiovascular');
  
  if (hasAntibiotic && hasCardiovascular) {
    interactions.push('Attention : Interaction possible entre antibiotiques et médicaments cardiovasculaires');
  }
  
  return interactions;
};

/**
 * Génère un message d'alerte pour le stock faible
 */
export const generateStockAlert = (supply: MedicalSupply): string => {
  return `⚠️ ALERTE STOCK FAIBLE: ${supply.name} - Stock restant: ${supply.stockQuantity}, Seuil minimum: ${supply.minStockLevel}`;
};