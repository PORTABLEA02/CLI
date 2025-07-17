import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { X, Download, Calendar, User, Mail, Phone } from 'lucide-react';

interface InvoiceDetailsProps {
  invoiceId: string;
  onClose: () => void;
}

export function InvoiceDetails({ invoiceId, onClose }: InvoiceDetailsProps) {
  const { invoices, patients, consultations, systemSettings } = useApp();
  
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

  const formatCurrency = (amount: number) => {
    const currency = systemSettings?.system?.currency || 'FCFA';
    switch (currency) {
      case 'EUR':
        return `${amount.toLocaleString()} €`;
      case 'USD':
        return `$${amount.toLocaleString()}`;
      case 'GBP':
        return `£${amount.toLocaleString()}`;
      case 'FCFA':
      default:
        return `${amount.toLocaleString()} FCFA`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Facture #{invoice.id.slice(-6).toUpperCase()}</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Clinic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{systemSettings?.clinic?.name || 'ClinicPro'}</h3>
          <p className="text-sm text-gray-600">
            {systemSettings?.clinic?.address || '123 Rue de la Santé, 75000 Paris, France'}<br />
            Tel: {systemSettings?.clinic?.phone || '+33 1 23 45 67 89'}<br />
            Email: {systemSettings?.clinic?.email || 'contact@clinicpro.fr'}
            {systemSettings?.clinic?.ifu && (
              <>
                <br />
                <strong>IFU:</strong> {systemSettings.clinic.ifu}
              </>
            )}
          </p>
        </div>

        {/* Patient Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Informations Patient</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span>{patient.firstName} {patient.lastName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <span>{patient.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span>{patient.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Détails de la Facture</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Numéro:</span>
              <span className="font-medium">#{invoice.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date d'émission:</span>
              <span className="font-medium">{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date d'échéance:</span>
              <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {getStatusText(invoice.status)}
              </span>
            </div>
          </div>
        </div>

        {consultation && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Consultation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(consultation.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heure:</span>
                <span className="font-medium">{consultation.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{consultation.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durée:</span>
                <span className="font-medium">{consultation.duration} min</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Détail des Prestations</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Prestation
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                  Quantité
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                  Prix unitaire
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                    {item.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">TVA ({systemSettings?.system?.taxRate || 8}%):</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {invoice.status === 'paid' && invoice.paidAt && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-800">
            <Calendar className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Facture payée le {new Date(invoice.paidAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}