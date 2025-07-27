import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Stethoscope, Euro, CheckCircle, XCircle, Plus, Edit, Eye } from 'lucide-react';
import { supabase, Consultation } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ConsultationListProps {
  onCreateConsultation?: () => void;
  onEditConsultation?: (consultation: Consultation) => void;
  onViewConsultation?: (consultation: Consultation) => void;
}

export default function ConsultationList({ 
  onCreateConsultation, 
  onEditConsultation, 
  onViewConsultation 
}: ConsultationListProps) {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInvoiced, setFilterInvoiced] = useState<'all' | 'invoiced' | 'not_invoiced'>('all');
  
  // Vérifier si l'utilisateur est en mode lecture seule (caissier)
  const isReadOnly = profile?.role === 'cashier';
  const canCreateEdit = profile?.role === 'doctor' || profile?.role === 'admin';

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      console.log('Récupération de la liste des consultations...');
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email),
          doctor:profiles(full_name)
        `)
        .order('consultation_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des consultations:', error);
        throw error;
      }
      
      console.log('Consultations récupérées avec succès:', data?.length || 0, 'consultations');
      setConsultations(data || []);
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des consultations:', error);
      console.error('Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      `${consultation.patient?.first_name} ${consultation.patient?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesInvoiceFilter = 
      filterInvoiced === 'all' ||
      (filterInvoiced === 'invoiced' && consultation.is_invoiced) ||
      (filterInvoiced === 'not_invoiced' && !consultation.is_invoiced);

    return matchesSearch && matchesInvoiceFilter;
  });

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
        <h2 className="text-2xl font-bold text-gray-900">
          Consultations
          {isReadOnly && (
            <span className="text-sm font-normal text-gray-600 ml-2">(Lecture seule)</span>
          )}
        </h2>
        <div className="flex items-center space-x-4">
          {canCreateEdit && onCreateConsultation && (
            <button
              onClick={onCreateConsultation}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Consultation
            </button>
          )}
          <div className="text-sm text-gray-600">
            Total: {filteredConsultations.length} consultation{filteredConsultations.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par patient, docteur ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtre par statut de facturation */}
          <div>
            <select
              value={filterInvoiced}
              onChange={(e) => setFilterInvoiced(e.target.value as 'all' | 'invoiced' | 'not_invoiced')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les consultations</option>
              <option value="invoiced">Consultations facturées</option>
              <option value="not_invoiced">Consultations non facturées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des consultations */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredConsultations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Docteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnostic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarif
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  {canCreateEdit && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  {isReadOnly && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsultations.map((consultation) => (
                  <tr key={consultation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(consultation.consultation_date).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consultation.patient?.first_name} {consultation.patient?.last_name}
                          </div>
                          {consultation.patient?.phone && (
                            <div className="text-sm text-gray-500">
                              {consultation.patient.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Stethoscope className="w-4 h-4 mr-2 text-blue-500" />
                        Dr. {consultation.doctor?.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="font-medium">{consultation.diagnosis}</div>
                        {consultation.treatment && (
                          <div className="text-gray-600 mt-1 text-xs">
                            Traitement: {consultation.treatment}
                          </div>
                        )}
                        {consultation.notes && (
                          <div className="text-gray-500 mt-1 text-xs">
                            Notes: {consultation.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <Euro className="w-4 h-4 mr-1" />
                        {consultation.consultation_fee}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {consultation.is_invoiced ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Facturée</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-600">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Non facturée</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {canCreateEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {onViewConsultation && (
                            <button
                              onClick={() => onViewConsultation(consultation)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {onEditConsultation && !consultation.is_invoiced && (
                            <button
                              onClick={() => onEditConsultation(consultation)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    {isReadOnly && onViewConsultation && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onViewConsultation(consultation)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">
              {searchTerm || filterInvoiced !== 'all' 
                ? 'Aucune consultation trouvée pour ces critères' 
                : 'Aucune consultation enregistrée'
              }
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Consultations</p>
              <p className="text-2xl font-bold text-gray-900">{consultations.length}</p>
            </div>
            <Stethoscope className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Facturées</p>
              <p className="text-2xl font-bold text-green-600">
                {consultations.filter(c => c.is_invoiced).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non Facturées</p>
              <p className="text-2xl font-bold text-yellow-600">
                {consultations.filter(c => !c.is_invoiced).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
}