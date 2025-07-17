import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PrescriptionForm } from './PrescriptionForm';
import { PrescriptionDetails } from './PrescriptionDetails';
import { Plus, Search, Eye, Edit, FileText, Calendar, User, Clock } from 'lucide-react';
import { Prescription } from '../../types';

export function PrescriptionList() {
  const { 
    prescriptions, 
    patients, 
    consultations, 
    currentProfile,
    addPrescription, 
    updatePrescription 
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedConsultationId, setSelectedConsultationId] = useState('');

  // Filter prescriptions based on user role
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const patient = patients.find(p => p.id === prescription.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    // Filter by user role
    if (currentProfile?.role === 'doctor') {
      return prescription.doctorId === currentProfile.id && matchesSearch && matchesStatus;
    }
    
    return matchesSearch && matchesStatus;
  });

  // Get completed consultations for new prescriptions
  const availableConsultations = consultations.filter(consultation => {
    const hasActivePrescription = prescriptions.some(p => 
      p.consultationId === consultation.id && p.status === 'active'
    );
    
    if (currentProfile?.role === 'doctor') {
      return consultation.status === 'completed' && 
             consultation.doctorId === currentProfile.id && 
             !hasActivePrescription;
    }
    
    return consultation.status === 'completed' && !hasActivePrescription;
  });

  const handleAddPrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPrescription(prescriptionData);
    setShowForm(false);
    setSelectedConsultationId('');
  };

  const handleUpdatePrescription = (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPrescription) {
      updatePrescription(editingPrescription.id, prescriptionData);
      setEditingPrescription(null);
    }
  };

  const canEditPrescription = (prescription: Prescription) => {
    // Can edit if user is the prescribing doctor and prescription is not billed
    return currentProfile?.role === 'doctor' && 
           prescription.doctorId === currentProfile.id && 
           prescription.status !== 'billed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'billed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'billed':
        return 'Facturée';
      default:
        return status;
    }
  };

  const totalPrescriptions = filteredPrescriptions.length;
  const activePrescriptions = filteredPrescriptions.filter(p => p.status === 'active').length;
  const pendingBilling = filteredPrescriptions.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProfile?.role === 'doctor' ? 'Mes Prescriptions' : 'Gestion des Prescriptions'}
        </h1>
        {(currentProfile?.role === 'doctor' || currentProfile?.role === 'admin') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Prescription</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{totalPrescriptions}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions Actives</p>
              <p className="text-2xl font-bold text-green-600">{activePrescriptions}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente de Facturation</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingBilling}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher par patient ou numéro de prescription..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="completed">Terminées</option>
          <option value="billed">Facturées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Prescriptions ({filteredPrescriptions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPrescriptions.map((prescription) => {
            const patient = patients.find(p => p.id === prescription.patientId);
            const consultation = consultations.find(c => c.id === prescription.consultationId);
            const canEdit = canEditPrescription(prescription);
            
            return (
              <div key={prescription.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Prescription #{prescription.id.slice(-6).toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient introuvable'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(prescription.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{prescription.items.length} élément(s)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Valide jusqu'au {new Date(prescription.validUntil).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Instructions:</span>
                        <p className="text-sm text-gray-600 mt-1">{prescription.instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                      {getStatusText(prescription.status)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewingPrescription(prescription)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {canEdit && (
                        <button
                          onClick={() => setEditingPrescription(prescription)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Modifier la prescription"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Information for different roles */}
      {currentProfile?.role === 'doctor' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Information pour les médecins
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Vous pouvez créer des prescriptions pour vos consultations terminées et les modifier tant qu'elles ne sont pas facturées.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentProfile?.role === 'cashier' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Information pour les caissiers
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Les prescriptions actives peuvent être incluses dans les factures. Une fois facturées, elles passent au statut "Facturée".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Form Modal */}
      {(showForm || editingPrescription) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PrescriptionForm
              prescription={editingPrescription}
              consultationId={selectedConsultationId}
              onSubmit={editingPrescription ? handleUpdatePrescription : handleAddPrescription}
              onCancel={() => {
                setShowForm(false);
                setEditingPrescription(null);
                setSelectedConsultationId('');
              }}
            />
          </div>
        </div>
      )}

      {/* Prescription Details Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PrescriptionDetails
              prescriptionId={viewingPrescription.id}
              onClose={() => setViewingPrescription(null)}
            />
          </div>
        </div>
      )}

      {availableConsultations.length === 0 && currentProfile?.role === 'doctor' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Aucune consultation disponible
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Il n'y a actuellement aucune consultation terminée sans prescription active. 
                  Les prescriptions ne peuvent être créées que pour les consultations terminées.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}