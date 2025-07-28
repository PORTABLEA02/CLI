import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Euro, Calendar, User, Eye, Edit, Download } from 'lucide-react';
import { supabase, Invoice } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface InvoiceListProps {
  onCreateInvoice: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

export default function InvoiceList({ onCreateInvoice, onEditInvoice, onViewInvoice }: InvoiceListProps) {
  const { profile } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'paid' | 'cancelled'>('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      console.log('Récupération de la liste des factures...');
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(first_name, last_name, phone, email),
          consultation:consultations(diagnosis, consultation_date),
          cashier:profiles!invoices_cashier_id_fkey(full_name)
        `)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        throw error;
      }
      
      console.log('Factures récupérées avec succès:', data?.length || 0, 'factures');
      setInvoices(data || []);
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${invoice.patient?.first_name} ${invoice.patient?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patient?.phone?.includes(searchTerm) ||
      invoice.patient?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      filterStatus === 'all' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  const getTotalRevenue = () => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Factures</h2>
        {(profile?.role === 'admin' || profile?.role === 'cashier') && (
          <button
            onClick={onCreateInvoice}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Facture
          </button>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par numéro, patient, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 sm:py-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>

          {/* Filtre par statut */}
          <div className="sm:w-48 lg:w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'paid' | 'cancelled')}
              className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="paid">Payées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredInvoices.length > 0 ? (
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'émission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caissier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.patient?.first_name} {invoice.patient?.last_name}
                          </div>
                          {invoice.patient?.phone && (
                            <div className="text-sm text-gray-500">
                              {invoice.patient.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-green-600">
                        <Euro className="w-4 h-4 mr-1" />
                        {invoice.total_amount.toFixed(2)}€
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.cashier?.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(profile?.role === 'admin' || profile?.role === 'cashier') && invoice.status === 'draft' && (
                          <button
                            onClick={() => onEditInvoice(invoice)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {/* TODO: Implement PDF download */}}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Version mobile/tablette - cartes */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-3 sm:p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="text-base sm:text-lg font-medium text-gray-900 truncate">{invoice.invoice_number}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate mb-1">
                      {invoice.patient?.first_name} {invoice.patient?.last_name}
                    </h3>
                    {invoice.patient?.phone && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{invoice.patient.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                    <button
                      onClick={() => onViewInvoice(invoice)}
                      className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {(profile?.role === 'admin' || profile?.role === 'cashier') && invoice.status === 'draft' && (
                      <button
                        onClick={() => onEditInvoice(invoice)}
                        className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {/* TODO: Implement PDF download */}}
                      className="p-1.5 sm:p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full"
                      title="Télécharger PDF"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center text-base sm:text-lg font-medium text-green-600">
                      <Euro className="w-4 h-4 mr-1" />
                      <span>{invoice.total_amount.toFixed(2)}€</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)} self-start`}>
                      {getStatusText(invoice.status)}
                    </span>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {invoice.cashier?.full_name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Aucune facture trouvée pour ces critères' 
                : 'Aucune facture enregistrée'
              }
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">Total Factures</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">Payées</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
            <Euro className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">Brouillons</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                {invoices.filter(i => i.status === 'draft').length}
              </p>
            </div>
            <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 leading-tight">Revenus</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 break-all">
                {getTotalRevenue().toFixed(2)}€
              </p>
            </div>
            <Euro className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}