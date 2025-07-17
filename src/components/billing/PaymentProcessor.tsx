import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { CreditCard, DollarSign, Smartphone, Building, User } from 'lucide-react';

interface PaymentProcessorProps {
  onPaymentProcessed: () => void;
}

export function PaymentProcessor({ onPaymentProcessed }: PaymentProcessorProps) {
  const { 
    invoices, 
    patients, 
    currentUser,
    updateInvoiceStatus,
    addPayment,
    systemSettings
  } = useApp();
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'bank_transfer' | 'card'>('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get pending invoices only
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
  
  const selectedInvoice = pendingInvoices.find(inv => inv.id === selectedInvoiceId);
  const selectedPatient = selectedInvoice 
    ? patients.find(p => p.id === selectedInvoice.patientId)
    : null;

  const handleProcessPayment = async () => {
    if (!selectedInvoice || !currentUser) return;

    setIsProcessing(true);
    
    try {
      // Update invoice status and payment info
      updateInvoiceStatus(selectedInvoice.id, 'paid');
      
      // Add payment record
      addPayment({
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.total,
        method: paymentMethod,
        reference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
        cashierId: currentUser.id
      });

      // Reset form
      setSelectedInvoiceId('');
      setPaymentReference('');
      setNotes('');
      
      onPaymentProcessed();
    } catch (error) {
      console.error('Erreur lors du traitement du paiement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-5 h-5" />;
      case 'mobile_money':
        return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
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
        return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Traiter un Paiement</h3>
        
        <div className="space-y-6">
          {/* Invoice Selection */}
          <div>
            <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une facture en attente
            </label>
            <select
              id="invoice"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Choisir une facture...</option>
              {pendingInvoices.map((invoice) => {
                const patient = patients.find(p => p.id === invoice.patientId);
                return (
                  <option key={invoice.id} value={invoice.id}>
                    #{invoice.id.slice(-6).toUpperCase()} - {patient?.firstName} {patient?.lastName} - {formatCurrencyWithSettings(invoice.total, systemSettings)}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Invoice Details */}
          {selectedInvoice && selectedPatient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Détails de la facture</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Patient:</span>
                    <span className="ml-1">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Téléphone:</span>
                    <span className="ml-1">{selectedPatient.phone}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Date de création:</span>
                    <span className="ml-1">{new Date(selectedInvoice.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Numéro:</span>
                    <span className="ml-1">#{selectedInvoice.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Sous-total:</span>
                    <span className="ml-1">{formatCurrencyWithSettings(selectedInvoice.subtotal, systemSettings)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">TVA:</span>
                    <span className="ml-1">{formatCurrencyWithSettings(selectedInvoice.tax, systemSettings)}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    <span>Total à payer:</span>
                    <span className="ml-1">{formatCurrencyWithSettings(selectedInvoice.total, systemSettings)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          {selectedInvoice && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mode de paiement
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'cash', label: 'Espèces', icon: DollarSign },
                  { value: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                  { value: 'bank_transfer', label: 'Virement', icon: Building },
                  { value: 'card', label: 'Carte', icon: CreditCard }
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as any)}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                        paymentMethod === method.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Reference */}
          {selectedInvoice && paymentMethod !== 'cash' && (
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Référence de paiement
                {paymentMethod === 'mobile_money' && ' (Numéro de transaction)'}
                {paymentMethod === 'bank_transfer' && ' (Référence virement)'}
                {paymentMethod === 'card' && ' (4 derniers chiffres)'}
              </label>
              <input
                type="text"
                id="reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={
                  paymentMethod === 'mobile_money' ? 'Ex: TXN123456789' :
                  paymentMethod === 'bank_transfer' ? 'Ex: VIR2024001234' :
                  paymentMethod === 'card' ? 'Ex: ****1234' : ''
                }
              />
            </div>
          )}

          {/* Notes */}
          {selectedInvoice && (
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Notes sur le paiement..."
              />
            </div>
          )}

          {/* Process Payment Button */}
          {selectedInvoice && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {getPaymentMethodIcon(paymentMethod)}
                <span>
                  {isProcessing ? 'Traitement...' : `Confirmer Paiement (${formatCurrencyWithSettings(selectedInvoice.total, systemSettings)})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {pendingInvoices.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Aucune facture en attente
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Toutes les factures ont été payées. Félicitations !
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}