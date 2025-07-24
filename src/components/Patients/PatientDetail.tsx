import React, { useState, useEffect } from 'react';
import { X, Calendar, Stethoscope, FileText, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react';
import { supabase, Patient, Consultation, Invoice } from '../../lib/supabase';

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientDetail({ patient, onClose }: PatientDetailProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientHistory();
  }, [patient.id]);

  const fetchPatientHistory = async () => {
    try {
      // Récupérer les consultations
      const { data: consultationsData } = await supabase
        .from('consultations')
        .select(`
          *,
          doctor:profiles(full_name)
        `)
        .eq('patient_id', patient.id)
        .order('consultation_date', { ascending: false });

      // Récupérer les factures
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patient.id)
        .order('issue_date', { ascending: false });

      setConsultations(consultationsData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payée';
      case 'draft':
        return 'Brouillon';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Dossier Patient - {patient.first_name} {patient.last_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Informations Personnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Âge</p>
                <p className="font-medium">{calculateAge(patient.birth_date)} ans</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sexe</p>
                <p className="font-medium">{patient.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de naissance</p>
                <p className="font-medium">{new Date(patient.birth_date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date d'inscription</p>
                <p className="font-medium">{new Date(patient.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {patient.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{patient.address}</span>
                </div>
              )}
            </div>

            {patient.emergency_contact && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Contact d'urgence</p>
                <p className="font-medium">{patient.emergency_contact}</p>
              </div>
            )}
          </div>

          {/* Antécédents médicaux et allergies */}
          {(patient.medical_history || patient.allergies) && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                Informations Médicales
              </h4>
              {patient.medical_history && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 font-medium">Antécédents médicaux</p>
                  <p className="text-sm">{patient.medical_history}</p>
                </div>
              )}
              {patient.allergies && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Allergies</p>
                  <p className="text-sm text-red-700 font-medium">{patient.allergies}</p>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consultations */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
                  Consultations ({consultations.length})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {consultations.length > 0 ? (
                    consultations.map((consultation) => (
                      <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            Dr. {consultation.doctor?.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Diagnostic:</span> {consultation.diagnosis}
                        </p>
                        {consultation.treatment && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Traitement:</span> {consultation.treatment}
                          </p>
                        )}
                        {consultation.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {consultation.notes}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-green-600">
                            {consultation.consultation_fee}€
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            consultation.is_invoiced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {consultation.is_invoiced ? 'Facturée' : 'Non facturée'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune consultation enregistrée</p>
                  )}
                </div>
              </div>

              {/* Factures */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Factures ({invoices.length})
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {invoice.total_amount}€
                          </p>
                        </div>
                        {invoice.notes && (
                          <p className="text-xs text-gray-600 mt-1">{invoice.notes}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Aucune facture enregistrée</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}