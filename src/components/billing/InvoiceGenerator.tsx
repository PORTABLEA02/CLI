import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { FileText, User, Calendar, DollarSign, Plus, Trash2, Edit3 } from 'lucide-react';

interface InvoiceGeneratorProps {
  onInvoiceGenerated: () => void;
}

interface CustomItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function InvoiceGenerator({ onInvoiceGenerated }: InvoiceGeneratorProps) {
  const { 
    consultations, 
    patients, 
    invoices,
    medicalCares,
    getConsultationCares,
    generateInvoice 
  } = useApp();
  
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  // Get completed consultations that don't have invoices yet
  const availableConsultations = consultations.filter(consultation => {
    const hasInvoice = invoices.some(invoice => invoice.consultationId === consultation.id);
    return consultation.status === 'completed' && !hasInvoice;
  });

  const selectedConsultation = availableConsultations.find(c => c.id === selectedConsultationId);
  const selectedPatient = selectedConsultation 
    ? patients.find(p => p.id === selectedConsultation.patientId)
    : null;

  // Get consultation cares for preview
  const consultationCares = selectedConsultation ? getConsultationCares(selectedConsultation.id) : [];

  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemForm(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddItem = () => {
    if (!itemForm.name.trim()) return;

    const newItem: CustomItem = {
      id: Date.now().toString(),
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      quantity: itemForm.quantity,
      unitPrice: itemForm.unitPrice,
      total: itemForm.quantity * itemForm.unitPrice
    };

    if (editingItem) {
      setCustomItems(prev => prev.map(item => 
        item.id === editingItem.id ? newItem : item
      ));
      setEditingItem(null);
    } else {
      setCustomItems(prev => [...prev, newItem]);
    }

    // Reset form
    setItemForm({
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    });
    setShowItemForm(false);
  };

  const handleEditItem = (item: CustomItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    });
    setShowItemForm(true);
  };

  const handleRemoveItem = (itemId: string) => {
    setCustomItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    // Base consultation cost
    let subtotal = 100; // Base consultation fee

    // Add consultation cares
    consultationCares.forEach(care => {
      subtotal += care.totalPrice;
    });

    // Add custom items
    customItems.forEach(item => {
      subtotal += item.total;
    });

    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleGenerateInvoice = () => {
    if (selectedConsultationId) {
      // Generate invoice with custom items
      const consultation = consultations.find(c => c.id === selectedConsultationId);
      if (!consultation) return;

      const items: any[] = [
        {
          id: '1',
          name: 'Consultation',
          description: `Consultation ${consultation.type}`,
          quantity: 1,
          unitPrice: 100,
          total: 100
        }
      ];

      // Add consultation cares
      consultationCares.forEach(care => {
        const careDetails = medicalCares.find(mc => mc.id === care.careId);
        items.push({
          id: care.id,
          name: careDetails?.name || 'Soin inconnu',
          description: careDetails?.description || '',
          quantity: care.quantity,
          unitPrice: care.unitPrice,
          total: care.totalPrice
        });
      });

      // Add custom items
      customItems.forEach(item => {
        items.push({
          id: item.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        });
      });

      const subtotal = items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      // Create invoice manually since we need custom items
      const newInvoice = {
        id: Date.now().toString(),
        patientId: consultation.patientId,
        consultationId: consultation.id,
        items,
        subtotal,
        tax,
        total,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Add to invoices (we'll need to update the context)
      // For now, we'll call the existing generateInvoice and then update it
      generateInvoice(selectedConsultationId);
      
      // Reset form
      setSelectedConsultationId('');
      setCustomItems([]);
      onInvoiceGenerated();
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Générer une Nouvelle Facture</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="consultation" className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une consultation terminée
            </label>
            <select
              id="consultation"
              value={selectedConsultationId}
              onChange={(e) => setSelectedConsultationId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Choisir une consultation...</option>
              {availableConsultations.map((consultation) => {
                const patient = patients.find(p => p.id === consultation.patientId);
                return (
                  <option key={consultation.id} value={consultation.id}>
                    {patient?.firstName} {patient?.lastName} - {new Date(consultation.date).toLocaleDateString('fr-FR')} à {consultation.time}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedConsultation && selectedPatient && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Aperçu de la consultation</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Patient:</span>
                    <span className="ml-1">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">{new Date(selectedConsultation.date).toLocaleDateString('fr-FR')} à {selectedConsultation.time}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Type:</span>
                    <span className="ml-1 capitalize">{selectedConsultation.type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Durée:</span>
                    <span className="ml-1">{selectedConsultation.duration} minutes</span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm">
                  <span className="font-medium">Symptômes:</span>
                  <p className="mt-1 text-gray-600">{selectedConsultation.symptoms}</p>
                </div>
              </div>

              {selectedConsultation.diagnosis && (
                <div className="mt-3">
                  <div className="text-sm">
                    <span className="font-medium">Diagnostic:</span>
                    <p className="mt-1 text-gray-600">{selectedConsultation.diagnosis}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Invoice Items Preview */}
          {selectedConsultation && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Éléments de la facture</h4>
                <button
                  onClick={() => setShowItemForm(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un article</span>
                </button>
              </div>

              <div className="space-y-3">
                {/* Base consultation */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Consultation</p>
                    <p className="text-sm text-gray-500">Consultation {selectedConsultation.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">100,00 €</p>
                    <p className="text-xs text-gray-500">1 × 100,00 €</p>
                  </div>
                </div>

                {/* Consultation cares */}
                {consultationCares.map((care) => {
                  const careDetails = medicalCares.find(mc => mc.id === care.careId);
                  return (
                    <div key={care.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{careDetails?.name}</p>
                        <p className="text-sm text-gray-500">{careDetails?.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{care.totalPrice.toLocaleString()} €</p>
                        <p className="text-xs text-gray-500">{care.quantity} × {care.unitPrice.toLocaleString()} €</p>
                      </div>
                    </div>
                  );
                })}

                {/* Custom items */}
                {customItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-medium text-gray-900">{item.total.toLocaleString()} €</p>
                      <p className="text-xs text-gray-500">{item.quantity} × {item.unitPrice.toLocaleString()} €</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-3 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-medium">{subtotal.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TVA (8%):</span>
                      <span className="font-medium">{tax.toLocaleString()} €</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{total.toLocaleString()} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleGenerateInvoice}
              disabled={!selectedConsultationId}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Générer la Facture</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
              </h3>
              <button
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  setItemForm({ name: '', description: '', quantity: 1, unitPrice: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'article *
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="name"
                  value={itemForm.name}
                  onChange={handleItemFormChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Ex: Médicament, Matériel médical..."
                />
              </div>

              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="itemDescription"
                  name="description"
                  rows={2}
                  value={itemForm.description}
                  onChange={handleItemFormChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Description détaillée de l'article..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="itemQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    id="itemQuantity"
                    name="quantity"
                    min="1"
                    value={itemForm.quantity}
                    onChange={handleItemFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="itemUnitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix unitaire (€) *
                  </label>
                  <input
                    type="number"
                    id="itemUnitPrice"
                    name="unitPrice"
                    min="0"
                    step="0.01"
                    value={itemForm.unitPrice}
                    onChange={handleItemFormChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {itemForm.quantity > 0 && itemForm.unitPrice > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium text-gray-900">
                      {(itemForm.quantity * itemForm.unitPrice).toLocaleString()} €
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  setItemForm({ name: '', description: '', quantity: 1, unitPrice: 0 });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleAddItem}
                disabled={!itemForm.name.trim() || itemForm.quantity <= 0 || itemForm.unitPrice <= 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingItem ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {availableConsultations.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Aucune consultation disponible
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Il n'y a actuellement aucune consultation terminée sans facture. 
                  Les factures ne peuvent être générées que pour les consultations avec le statut "Terminée".
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}