import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { X, Download, Printer } from 'lucide-react';

interface InvoicePrintViewProps {
  invoiceId: string;
  onClose: () => void;
}

export function InvoicePrintView({ invoiceId, onClose }: InvoicePrintViewProps) {
  const { invoices, patients, consultations, medicalCares, systemSettings } = useApp();
  
  const invoice = invoices.find(i => i.id === invoiceId);
  const patient = invoice ? patients.find(p => p.id === invoice.patientId) : null;
  const consultation = invoice ? consultations.find(c => c.id === invoice.consultationId) : null;

  if (!invoice || !patient) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Facture introuvable</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-gray-600">La facture demandée n'existe pas.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real application, you would generate a PDF here
    // For now, we'll just trigger the print dialog
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'paid':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'EN ATTENTE';
      case 'paid':
        return 'PAYÉE';
      case 'overdue':
        return 'EN RETARD';
      default:
        return status.toUpperCase();
    }
  };

  const getPaymentMethodText = (method?: string) => {
    switch (method) {
      case 'cash':
        return 'Espèces';
      case 'mobile_money':
        return 'Mobile Money';
      case 'bank_transfer':
        return 'Virement Bancaire';
      case 'card':
        return 'Carte Bancaire';
      default:
        return 'Non spécifié';
    }
  };

  return (
    <div className="bg-white">
      {/* Header with actions - hidden in print */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 print:hidden">
        <h2 className="text-xl font-bold text-gray-900">
          Facture #{invoice.id.slice(-6).toUpperCase()}
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{systemSettings?.clinic?.name || 'ClinicPro'}</h1>
                <p className="text-gray-600">{systemSettings?.clinic?.description || 'Clinique Médicale'}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>{systemSettings?.clinic?.address || '123 Rue de la Santé, 75000 Paris, France'}</p>
              <p>Tél: {systemSettings?.clinic?.phone || '+33 1 23 45 67 89'}</p>
              <p>Email: {systemSettings?.clinic?.email || 'contact@clinicpro.fr'}</p>
              {systemSettings?.clinic?.website && (
                <p>Web: {systemSettings.clinic.website}</p>
              )}
              {systemSettings?.clinic?.ifu && (
                <p><strong>IFU:</strong> {systemSettings.clinic.ifu}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">FACTURE</h2>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Numéro:</span> #{invoice.id.slice(-6).toUpperCase()}</p>
              <p><span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><span className="font-medium">Échéance:</span> {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
              <p className={`font-bold ${getStatusColor(invoice.status)}`}>
                {getStatusText(invoice.status)}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturé à:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
            <p className="text-gray-600">{patient.email}</p>
            <p className="text-gray-600">{patient.phone}</p>
            <p className="text-gray-600">{patient.address}</p>
          </div>
        </div>

        {/* Consultation Information */}
        {consultation && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Consultation:</h3>
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

        {/* Invoice Items */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Détail des prestations:</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Prestation
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                    Qté
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Prix unitaire
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-center text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrencyWithSettings(item.unitPrice, systemSettings)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrencyWithSettings(item.total, systemSettings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total:</span>
                <span className="font-medium">{formatCurrencyWithSettings(invoice.subtotal, systemSettings)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">TVA ({systemSettings?.system?.taxRate || 8}%):</span>
                <span className="font-medium">{formatCurrencyWithSettings(invoice.tax, systemSettings)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrencyWithSettings(invoice.total, systemSettings)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {invoice.status === 'paid' && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Paiement reçu</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Date de paiement:</span> {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString('fr-FR') : 'N/A'}</p>
                <p><span className="font-medium">Mode de paiement:</span> {getPaymentMethodText(invoice.paymentMethod)}</p>
              </div>
              {invoice.paymentReference && (
                <div>
                  <p><span className="font-medium">Référence:</span> {invoice.paymentReference}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Merci de votre confiance</p>
          <p className="mt-2">
            Cette facture a été générée électroniquement et est valide sans signature.
          </p>
        </div>
      </div>
    </div>
  );
}