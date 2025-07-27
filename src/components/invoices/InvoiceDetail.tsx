import React, { useState, useEffect } from 'react';
import { X, FileText, User, Calendar, Euro, Download, Edit, Trash2 } from 'lucide-react';
import { supabase, Invoice, InvoiceItem } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { downloadInvoicePDF } from '../../utils/pdfGenerator';
import { useSystemSettings } from '../../hooks/useSystemSettings';

interface InvoiceDetailProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
}

export default function InvoiceDetail({ invoice, onClose, onEdit }: InvoiceDetailProps) {
  const { profile } = useAuth();
  const { settings: systemSettings } = useSystemSettings();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoiceItems();
  }, [invoice.id]);

  const fetchInvoiceItems = async () => {
    try {
      console.log('Récupération des éléments de la facture:', invoice.id);
      const { data, error } = await supabase
        .from('invoice_items')
        .select(`
          *,
          product:products(name, unit)
        `)
        .eq('invoice_id', invoice.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des éléments:', error);
        throw error;
      }

      console.log('Éléments de facture récupérés:', data?.length || 0);
      setItems(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des éléments de facture:', error);
    } finally {
      setLoading(false);
    }
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

  const handleStatusChange = async (newStatus: 'paid' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoice.id);

      if (error) throw error;

      // Recharger les données
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const generatePDF = () => {
    downloadInvoicePDF(invoice, items, systemSettings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Facture {invoice.invoice_number}
          </h3>
          <div className="flex items-center space-x-2">
            {(profile?.role === 'admin' || profile?.role === 'cashier') && invoice.status === 'draft' && onEdit && (
              <button
                onClick={() => onEdit(invoice)}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Modifier
              </button>
            )}
            <button
              onClick={generatePDF}
              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-1" />
              PDF
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* En-tête de la facture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informations Patient
              </h4>
              <div className="space-y-2">
                <p className="font-medium">
                  {invoice.patient?.first_name} {invoice.patient?.last_name}
                </p>
                {invoice.patient?.phone && (
                  <p className="text-sm text-gray-600">{invoice.patient.phone}</p>
                )}
                {invoice.patient?.email && (
                  <p className="text-sm text-gray-600">{invoice.patient.email}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Détails de la Facture
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Numéro:</span>
                  <span className="font-medium">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date d'émission:</span>
                  <span className="font-medium">
                    {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date d'échéance:</span>
                    <span className="font-medium">
                      {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusText(invoice.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Caissier:</span>
                  <span className="font-medium">{invoice.cashier?.full_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation liée */}
          {invoice.consultation && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-md font-semibold text-gray-900 mb-2">
                Consultation associée
              </h4>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Diagnostic:</span> {invoice.consultation.diagnosis}
              </p>
              <p className="text-sm text-gray-600">
                Date: {new Date(invoice.consultation.consultation_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}

          {/* Éléments de la facture */}
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Éléments facturés</h4>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.description}
                          </div>
                          {item.product && (
                            <div className="text-sm text-gray-500">
                              Produit: {item.product.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity} {item.product?.unit || 'unité(s)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <Euro className="w-4 h-4 mr-1 text-green-600" />
                            {item.unit_price.toFixed(2)}€
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-bold text-green-600">
                            <Euro className="w-4 h-4 mr-1" />
                            {item.total_price.toFixed(2)}€
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Total de la facture:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-lg font-bold text-green-600">
                          <Euro className="w-5 h-5 mr-1" />
                          {invoice.total_amount.toFixed(2)}€
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-md font-semibold text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Actions */}
          {(profile?.role === 'admin' || profile?.role === 'cashier') && invoice.status === 'draft' && (
            <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleStatusChange('paid')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
              >
                Marquer comme payée
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Annuler la facture
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}