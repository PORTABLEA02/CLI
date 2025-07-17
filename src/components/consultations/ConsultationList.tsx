import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ConsultationForm } from './ConsultationForm';
import { Plus, Calendar, Clock, User, Search, Edit, CheckCircle } from 'lucide-react';
import { Consultation } from '../../types';

export function ConsultationList() {
  const { consultations, patients, currentProfile, addConsultation, updateConsultation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredConsultations = consultations.filter(consultation => {
    const patient = patients.find(p => p.id === consultation.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddConsultation = (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    addConsultation(consultationData);
    setShowForm(false);
  };

  const handleUpdateConsultation = (consultationData: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingConsultation) {
      updateConsultation(editingConsultation.id, consultationData);
      setEditingConsultation(null);
    }
  };

  const handleCompleteConsultation = (consultationId: string) => {
    updateConsultation(consultationId, { status: 'completed' });
  };

  const canCompleteConsultation = (consultation: Consultation) => {
    // Only doctors can complete consultations
    if (currentProfile?.role !== 'doctor') return false;
    
    // Only the doctor assigned to the consultation can complete it
    if (consultation.doctorId !== currentProfile.id) return false;
    
    // Consultation must not already be completed or cancelled
    if (consultation.status === 'completed' || consultation.status === 'cancelled') return false;
    
    // Consultation date must be today or in the past
    const consultationDate = new Date(consultation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    consultationDate.setHours(0, 0, 0, 0);
    
    return consultationDate <= today;
  };

  const canAddConsultation = () => {
    return currentProfile?.role === 'admin' || currentProfile?.role === 'doctor';
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifiée';
      case 'in-progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general':
        return 'Générale';
      case 'specialist':
        return 'Spécialiste';
      case 'emergency':
        return 'Urgence';
      case 'followup':
        return 'Suivi';
      default:
        return type;
    }
  };

  const isConsultationEditable = (consultation: Consultation) => {
    // Only allow editing if user is admin or the assigned doctor
    return currentProfile?.role === 'admin' || 
           (currentProfile?.role === 'doctor' && consultation.doctorId === currentProfile.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Consultations</h1>
        {canAddConsultation() && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Consultation</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher par patient ou symptômes..."
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
          <option value="scheduled">Planifiées</option>
          <option value="in-progress">En cours</option>
          <option value="completed">Terminées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {/* Consultations List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Consultations ({filteredConsultations.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredConsultations.map((consultation) => {
            const patient = patients.find(p => p.id === consultation.patientId);
            const canComplete = canCompleteConsultation(consultation);
            const canEdit = isConsultationEditable(consultation);
            
            return (
              <div key={consultation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient introuvable'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {consultation.symptoms}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(consultation.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{consultation.time}</span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {getTypeText(consultation.type)}
                      </div>
                      <div>
                        <span className="font-medium">Durée:</span> {consultation.duration} min
                      </div>
                    </div>

                    {consultation.diagnosis && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Diagnostic:</span>
                        <p className="text-sm text-gray-600 mt-1">{consultation.diagnosis}</p>
                      </div>
                    )}

                    {consultation.notes && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Notes:</span>
                        <p className="text-sm text-gray-600 mt-1">{consultation.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {getStatusText(consultation.status)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {/* Complete Consultation Button - Only for doctors on their consultations */}
                      {canComplete && (
                        <button
                          onClick={() => handleCompleteConsultation(consultation.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center space-x-1 text-sm transition-colors"
                          title="Terminer la consultation"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Terminer</span>
                        </button>
                      )}
                      
                      {/* Edit Button - Only if user can edit */}
                      {canEdit && (
                        <button
                          onClick={() => setEditingConsultation(consultation)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Modifier la consultation"
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

      {/* Information for doctors */}
      {currentProfile?.role === 'doctor' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Information pour les médecins
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Vous pouvez terminer vos consultations uniquement si :
                </p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>La consultation vous est assignée</li>
                  <li>La date de consultation est aujourd'hui ou antérieure</li>
                  <li>La consultation n'est pas déjà terminée ou annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Form Modal */}
      {(showForm || editingConsultation) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ConsultationForm
              consultation={editingConsultation}
              onSubmit={editingConsultation ? handleUpdateConsultation : handleAddConsultation}
              onCancel={() => {
                setShowForm(false);
                setEditingConsultation(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}