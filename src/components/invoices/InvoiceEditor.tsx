import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { X, Plus, Trash2, Edit3, Search } from 'lucide-react';

interface InvoiceEditorProps {
  invoiceId: string;
  onClose: () => void;
  onSave: () => void;
}

interface EditableItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function InvoiceEditor({ invoiceId, onClose, onSave }: InvoiceEditorProps) {
  const { 
    invoices, 
    patients, 
    consultations, 
    medications,
    medicalExams,
    medicalCares,
    medicalSupplies,
    systemSettings,
    updateInvoiceContent 
  } = useApp();
  
  const invoice = invoices.find(inv => inv.id === invoiceId);
  const patient = invoice ? patients.find(p => p.id === invoice.patientId) : null;
  const consultation = invoice ? consultations.find(c => c.id === invoice.consultationId) : null;

  const [items, setItems] = useState<EditableItem[]>([]);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    type: 'custom' as 'custom' | 'medication' | 'exam' | 'care' | 'supply',
    catalogItemId: '',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (invoice) {
      setItems(invoice.items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })));
    }
  }, [invoice]);

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

  const getFilteredCatalogItems = () => {
    const searchLower = searchTerm.toLowerCase();
    
    switch (newItem.type) {
      case 'medication':
        return medications.filter(med => 
          med.isActive && 
          (med.name.toLowerCase().includes(searchLower) || 
           med.genericName?.toLowerCase().includes(searchLower))
        );
      case 'exam':
        return medicalExams.filter(exam => 
          exam.isActive && 
          exam.name.toLowerCase().includes(searchLower)
        );
      case 'care':
        return medicalCares.filter(care => 
          care.isActive && 
          care.name.toLowerCase().includes(searchLower)
        );
      case 'supply':
        return medicalSupplies.filter(supply => 
          supply.isActive && 
          supply.name.toLowerCase().includes(searchLower)
        );
      default:
        return [];
    }
  };

  const getCatalogItemDetails = (type: string, itemId: string) => {
    switch (type) {
      case 'medication':
        return medications.find(m => m.id === itemId);
      case 'exam':
        return medicalExams.find(e => e.id === itemId);
      case 'care':
        return medicalCares.find(c => c.id === itemId);
      case 'supply':
        return medicalSupplies.find(s => s.id === itemId);
      default:
        return null;
    }
  };

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    if (newItem.type !== 'custom' && !newItem.catalogItemId) return;
    if (newItem.type === 'custom' && !newItem.name.trim()) return;

    let itemName = newItem.name;
    let itemDescription = newItem.description;
    let itemPrice = newItem.unitPrice;

    if (newItem.type !== 'custom') {
      const catalogItem = getCatalogItemDetails(newItem.type, newItem.catalogItemId);
      if (catalogItem) {
        itemName = catalogItem.name;
        itemDescription = catalogItem.description || '';
        itemPrice = catalogItem.unitPrice;
      }
    }

    const item: EditableItem = {
      id: Date.now().toString(),
      name: itemName,
      description: itemDescription,
      quantity: newItem.quantity,
      unitPrice: itemPrice,
      total: newItem.quantity * itemPrice
    };

    setItems(prev => [...prev, item]);
    
    // Reset form
    setNewItem({
      type: 'custom',
      catalogItemId: '',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    });
    setSearchTerm('');
    setShowAddItemForm(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSave = () => {
    updateInvoiceContent(invoiceId, items);
    onSave();
    onClose();
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = systemSettings?.system?.taxRate || 8;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Modifier la Facture #{invoice.id.slice(-6).toUpperCase()}
          </h2>
          <p className="text-gray-600">
            Patient: {patient.firstName} {patient.lastName}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Current Items */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Éléments de la facture</h3>
          <button
            onClick={() => setShowAddItemForm(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantité</label>
                    {editingItemId === item.id ? (
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{item.quantity}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Prix unitaire</label>
                    {editingItemId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formatCurrencyWithSettings(item.unitPrice, systemSettings)}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrencyWithSettings(item.total, systemSettings)}
                    </p>
                  </div>
                  
                  {editingItemId === item.id ? (
                    <button
                      onClick={() => setEditingItemId(null)}
                      className="text-green-600 hover:text-green-800 p-1"
                    >
                      <span className="text-xs">✓</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingItemId(item.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <span className="text-gray-600">TVA ({systemSettings?.system?.taxRate || 8}%):</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sous-total:</span>
              <span className="font-medium">{formatCurrencyWithSettings(subtotal, systemSettings)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">TVA (8%):</span>
              <span className="font-medium">{formatCurrencyWithSettings(tax, systemSettings)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrencyWithSettings(total, systemSettings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Sauvegarder les modifications
        </button>
      </div>

      {/* Add Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ajouter un élément</h3>
              <button
                onClick={() => {
                  setShowAddItemForm(false);
                  setNewItem({ type: 'custom', catalogItemId: '', name: '', description: '', quantity: 1, unitPrice: 0 });
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type d'élément</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { value: 'custom', label: 'Personnalisé' },
                    { value: 'medication', label: 'Médicament' },
                    { value: 'exam', label: 'Examen' },
                    { value: 'care', label: 'Soin' },
                    { value: 'supply', label: 'Fourniture' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewItem(prev => ({ ...prev, type: type.value as any, catalogItemId: '' }))}
                      className={`p-2 border-2 rounded-lg text-xs font-medium transition-colors ${
                        newItem.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog Item Selection */}
              {newItem.type !== 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un {newItem.type === 'medication' ? 'médicament' : 
                                   newItem.type === 'exam' ? 'examen' : 
                                   newItem.type === 'care' ? 'soin' : 'produit'}
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                    {getFilteredCatalogItems().map((catalogItem: any) => (
                      <button
                        key={catalogItem.id}
                        type="button"
                        onClick={() => setNewItem(prev => ({ ...prev, catalogItemId: catalogItem.id }))}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          newItem.catalogItemId === catalogItem.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{catalogItem.name}</div>
                            <div className="text-sm text-gray-500">{catalogItem.description}</div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 ml-4">
                            {formatCurrencyWithSettings(catalogItem.unitPrice, systemSettings)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    disabled={newItem.type !== 'custom'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Nom de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    disabled={newItem.type !== 'custom'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input
                    type="text"
                    value={formatCurrencyWithSettings(newItem.quantity * newItem.unitPrice, systemSettings)}
                    disabled
                    className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  disabled={newItem.type !== 'custom'}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Description de l'article"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddItemForm(false);
                  setNewItem({ type: 'custom', catalogItemId: '', name: '', description: '', quantity: 1, unitPrice: 0 });
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={
                  (newItem.type === 'custom' && (!newItem.name.trim() || newItem.unitPrice <= 0)) ||
                  (newItem.type !== 'custom' && !newItem.catalogItemId) ||
                  newItem.quantity <= 0
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}