import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { PatientForm } from './PatientForm';
import { Plus, Search, Edit, Eye, Phone, Mail } from 'lucide-react';
import { Patient } from '../../types';

export function PatientList() {
  const { patients, addPatient, updatePatient, currentProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    addPatient(patientData);
    setShowForm(false);
  };

  const handleUpdatePatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPatient) {
      updatePatient(editingPatient.id, patientData);
      setEditingPatient(null);
    }
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

  // Contrôle d'accès : seuls les admins et médecins peuvent ajouter/modifier des patients
  const canAddPatient = currentProfile?.role === 'admin' || currentProfile?.role === 'doctor';
  const canEditPatient = (patient: Patient) => {
    return currentProfile?.role === 'admin' || currentProfile?.role === 'doctor';
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Patients</h1>
        {canAddPatient && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Patient</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Liste des Patients ({filteredPatients.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Âge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groupe Sanguin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Visite
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateAge(patient.dateOfBirth)} ans
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {patient.bloodType || 'Non spécifié'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(patient.updatedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setViewingPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {canEditPatient(patient) && (
                        <button
                          onClick={() => setEditingPatient(patient)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Form Modal */}
      {(showForm || editingPatient) && canAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <PatientForm
              patient={editingPatient}
              onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient}
              onCancel={() => {
                setShowForm(false);
                setEditingPatient(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">Détails du Patient</h2>
              <button
                onClick={() => setViewingPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom Complet</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.firstName} {viewingPatient.lastName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Âge</h3>
                  <p className="mt-1 text-sm text-gray-900">{calculateAge(viewingPatient.dateOfBirth)} ans</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Genre</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{viewingPatient.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Groupe Sanguin</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.bloodType || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.email}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Adresse</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingPatient.address}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Contact d'Urgence</h3>
                <p className="mt-1 text-sm text-gray-900">{viewingPatient.emergencyContact}</p>
              </div>

              {viewingPatient.allergies && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Allergies</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.allergies}</p>
                </div>
              )}

              {viewingPatient.medicalHistory && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Historique Médical</h3>
                  <p className="mt-1 text-sm text-gray-900">{viewingPatient.medicalHistory}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}