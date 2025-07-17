import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { X, Download, Printer, Calendar, User, Clock } from 'lucide-react';

interface PrescriptionDetailsProps {
  prescriptionId: string;
  onClose: () => void;
}

export function PrescriptionDetails({ prescriptionId, onClose }: PrescriptionDetailsProps) {
  const { 
    prescriptions, 
    patients, 
    consultations, 
    medications, 
    medicalExams, 
    medicalCares,
    systemSettings
  } = useApp();
  
  const prescription = prescriptions.find(p => p.id === prescriptionId);
  const patient = prescription ? patients.find(p => p.id === prescription.patientId) : null;
  const consultation = prescription ? consultations.find(c => c.id === prescription.consultationId) : null;

  if (!prescription || !patient) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Prescription introuvable</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600">La prescription demandée n'existe pas.</p>
      </div>
    );
  }

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

  const getFormText = (form: string) => {
    switch (form) {
      case 'tablet': return 'Comprimé';
      case 'syrup': return 'Sirop';
      case 'injection': return 'Injection';
      case 'capsule': return 'Gélule';
      case 'cream': return 'Crème';
      case 'drops': return 'Gouttes';
      case 'inhaler': return 'Inhalateur';
      case 'patch': return 'Patch';
      default: return form;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'completed':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      case 'billed':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'completed':
        return 'TERMINÉE';
      case 'cancelled':
        return 'ANNULÉE';
      case 'billed':
        return 'FACTURÉE';
      default:
        return status.toUpperCase();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const totalAmount = prescription.items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="bg-white">
      {/* Header with actions - hidden in print */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
        <h2 className="text-xl font-bold text-gray-900">
          Prescription #{prescription.id.slice(-6).toUpperCase()}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Prescription Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ClinicPro</h1>
                <p className="text-gray-600">Clinique Médicale</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>123 Rue de la Santé</p>
              <p>75000 Paris, France</p>
              <p>Tél: +33 1 23 45 67 89</p>
              <p>Email: contact@clinicpro.fr</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ORDONNANCE</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Numéro:</span> #{prescription.id.slice(-6).toUpperCase()}</p>
              <p><span className="font-medium">Date:</span> {new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><span className="font-medium">Valide jusqu'au:</span> {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}</p>
              <p className={`font-bold ${getStatusColor(prescription.status)}`}>
                {getStatusText(prescription.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations Patient</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                <p className="text-gray-600">Né(e) le {new Date(patient.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                <p className="text-gray-600">Âge: {calculateAge(patient.dateOfBirth)} ans</p>
              </div>
              <div>
                <p className="text-gray-600">{patient.phone}</p>
                <p className="text-gray-600">{patient.email}</p>
                {patient.allergies && (
                  <p className="text-red-600 font-medium">Allergies: {patient.allergies}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Information */}
        {consultation && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Consultation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Date:</span> {new Date(consultation.date).toLocaleDateString('fr-FR')}</p>
                  <p><span className="font-medium">Heure:</span> {consultation.time}</p>
                </div>
                <div>
                  <p><span className="font-medium">Type:</span> {consultation.type}</p>
                  <p><span className="font-medium">Durée:</span> {consultation.duration} min</p>
                </div>
              </div>
              {consultation.diagnosis && (
                <div className="mt-2">
                  <p><span className="font-medium">Diagnostic:</span> {consultation.diagnosis}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prescription Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescription</h3>
          
          {/* Medications */}
          {prescription.items.filter(item => item.type === 'medication').length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Médicaments</h4>
              <div className="space-y-3">
                {prescription.items
                  .filter(item => item.type === 'medication')
                  .map((item, index) => {
                    const medication = getItemDetails(item.type, item.itemId) as any;
                    return (
                      <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {index + 1}. {medication?.name}
                            </p>
                            {medication?.genericName && (
                              <p className="text-sm text-gray-600">({medication.genericName})</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {medication?.form && getFormText(medication.form)} - {medication?.strength}
                            </p>
                            
                            <div className="mt-2 space-y-1">
                              {item.dosage && (
                                <p className="text-sm"><span className="font-medium">Posologie:</span> {item.dosage}</p>
                              )}
                              {item.frequency && (
                                <p className="text-sm"><span className="font-medium">Fréquence:</span> {item.frequency}</p>
                              )}
                              {item.duration && (
                                <p className="text-sm"><span className="font-medium">Durée:</span> {item.duration}</p>
                              )}
                              {item.instructions && (
                                <p className="text-sm"><span className="font-medium">Instructions:</span> {item.instructions}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatCurrencyWithSettings(item.totalPrice, systemSettings)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Exams */}
          {prescription.items.filter(item => item.type === 'exam').length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Examens prescrits</h4>
              <div className="space-y-3">
                {prescription.items
                  .filter(item => item.type === 'exam')
                  .map((item, index) => {
                    const exam = getItemDetails(item.type, item.itemId) as any;
                    return (
                      <div key={item.id} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {index + 1}. {exam?.name}
                            </p>
                            <p className="text-sm text-gray-600">{exam?.description}</p>
                            {item.instructions && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">Instructions:</span> {item.instructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatCurrencyWithSettings(item.totalPrice, systemSettings)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Care */}
          {prescription.items.filter(item => item.type === 'care').length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Soins prescrits</h4>
              <div className="space-y-3">
                {prescription.items
                  .filter(item => item.type === 'care')
                  .map((item, index) => {
                    const care = getItemDetails(item.type, item.itemId) as any;
                    return (
                      <div key={item.id} className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {index + 1}. {care?.name}
                            </p>
                            <p className="text-sm text-gray-600">{care?.description}</p>
                            {item.instructions && (
                              <p className="text-sm mt-1">
                                <span className="font-medium">Instructions:</span> {item.instructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-gray-600">Qté: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatCurrencyWithSettings(item.totalPrice, systemSettings)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* General Instructions */}
        {prescription.instructions && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Instructions générales</h4>
            <p className="text-gray-700">{prescription.instructions}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs">
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total estimé:</span>
                <span>{formatCurrencyWithSettings(totalAmount, systemSettings)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Cette ordonnance est valide jusqu'au {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}</p>
          <p className="mt-2">
            Dr. {/* Doctor name would be fetched from users */} - ClinicPro
          </p>
          <p className="mt-2">
            Cette ordonnance a été générée électroniquement et est valide sans signature.
          </p>
        </div>
      </div>
    </div>
  );
}