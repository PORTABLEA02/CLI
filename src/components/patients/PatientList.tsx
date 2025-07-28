import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Eye, Calendar, Phone, Mail } from 'lucide-react';
import { supabase, Patient } from '../../lib/supabase';

interface PatientListProps {
  onCreatePatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onViewPatient: (patient: Patient) => void;
}

export default function PatientList({ onCreatePatient, onEditPatient, onViewPatient }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      console.log('Récupération de la liste des patients...');
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des patients:', error);
        throw error;
      }
      
      console.log('Patients récupérés avec succès:', data?.length || 0, 'patients');
      setPatients(data || []);
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des patients:', error);
      console.error('Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Patients</h2>
        <button
          onClick={onCreatePatient}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Patient
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Liste des patients */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Âge/Sexe
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.last_name}
                        </div>
                        {/* Afficher le contact sur mobile */}
                        <div className="md:hidden mt-1 space-y-1">
                          {patient.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                        {patient.medical_history && (
                          <div className="text-xs text-gray-500 mt-1">Antécédents médicaux</div>
                        )}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {patient.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-1" />
                            {patient.phone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-1" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateAge(patient.birth_date)} ans
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(patient.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewPatient(patient)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'Aucun patient trouvé pour cette recherche' : 'Aucun patient enregistré'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}