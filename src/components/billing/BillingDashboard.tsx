import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { InvoiceGenerator } from './InvoiceGenerator';
import { PaymentProcessor } from './PaymentProcessor';
import { InvoicePrintView } from './InvoicePrintView';
import { InvoiceEditor } from '../invoices/InvoiceEditor';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Printer,
  Download
} from 'lucide-react';

export function BillingDashboard() {
  const { 
    invoices, 
    patients, 
    consultations, 
    currentUser,
    systemSettings,
    generateInvoice,
    updateInvoiceStatus,
    addPayment
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'invoices' | 'generate' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);

  // Filter invoices based on search and status
  const filteredInvoices = invoices.filter(invoice => {
    const patient = patients.find(p => p.id === invoice.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : '';
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Contrôle d'accès : seuls les admins et caissiers peuvent modifier les factures en attente
  const canEditInvoice = (invoice: any) => {
    return (currentUser?.role === 'admin' || currentUser?.role === 'cashier') && 
           invoice.status === 'pending';
  };

  // Calculate statistics
  const todayInvoices = invoices.filter(inv => 
    new Date(inv.createdAt).toDateString() === new Date().toDateString()
  );
  
  const todayRevenue = todayInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'paid':
        return 'Payée';
      case 'overdue':
        return 'En retard';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Virement';
      case 'card':
        return 'Carte';
      default:
        return 'Non spécifié';
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setShowPrintView(true);
  };

  const handlePayment = (invoiceId: string, paymentData: any) => {
    // Update invoice status
    updateInvoiceStatus(invoiceId, 'paid');
    
    // Add payment record
    addPayment({
      invoiceId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      notes: paymentData.notes,
      cashierId: currentUser?.id || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Module Facturation</h1>
        <div className="text-sm text-gray-500">
          Caissier: {currentUser?.name}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Factures Aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-900">{todayInvoices.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Aujourd'hui</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrencyWithSettings(todayRevenue, systemSettings)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrencyWithSettings(pendingAmount, systemSettings)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Factures</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Factures
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'generate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Générer Facture
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Traiter Paiements
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par patient ou numéro de facture..."
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
              <option value="pending">En attente</option>
              <option value="paid">Payées</option>
              <option value="overdue">En retard</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => {
                    const patient = patients.find(p => p.id === invoice.patientId);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{invoice.id.slice(-6).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient ? `${patient.firstName} ${patient.lastName}` : 'Patient introuvable'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient?.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(invoice.createdAt).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrencyWithSettings(invoice.total, systemSettings)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {invoice.paymentMethod ? getPaymentMethodText(invoice.paymentMethod) : '-'}
                          </div>
                          {invoice.paymentReference && (
                            <div className="text-sm text-gray-500">
                              Réf: {invoice.paymentReference}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {canEditInvoice(invoice) && (
                              <button
                                onClick={() => setEditingInvoice(invoice.id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Modifier la facture"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handlePrintInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Imprimer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'generate' && (
        <InvoiceGenerator onInvoiceGenerated={() => setActiveTab('invoices')} />
      )}

      {activeTab === 'payments' && (
        <PaymentProcessor onPaymentProcessed={() => setActiveTab('invoices')} />
      )}

      {/* Print View Modal */}
      {showPrintView && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <InvoicePrintView
              invoiceId={selectedInvoice}
              onClose={() => {
                setShowPrintView(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Invoice Editor Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <InvoiceEditor
              invoiceId={editingInvoice}
              onClose={() => setEditingInvoice(null)}
              onSave={() => {
                // Optionally show a success message
                console.log('Facture modifiée avec succès');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}