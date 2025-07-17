import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { FileText, User, Calendar, DollarSign, Plus, Trash2, Edit3, Search, Pill, Stethoscope, Activity } from 'lucide-react';

interface InvoiceGeneratorProps {
  onInvoiceGenerated: () => void;
}

interface CustomItem {
  id: string;
  type: 'custom' | 'medication' | 'exam' | 'care';
  catalogItemId?: string; // ID of the catalog item if type is not 'custom'
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
    prescriptions,
    medicalCares,
    medications,
    medicalExams,
    systemSettings,
    getConsultationCares,
    generateCustomInvoice 
  } = useApp();
  
  const [selectedConsultationId, setSelectedConsultationId] = useState('');
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomItem | null>(null);
  const [itemForm, setItemForm] = useState({
    type: 'custom' as 'custom' | 'medication' | 'exam' | 'care',
    catalogItemId: '',
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

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

  // Get associated prescription for preview
  const associatedPrescription = selectedConsultation 
    ? prescriptions.find(p => 
        p.consultationId === selectedConsultation.id && 
        (p.status === 'active' || p.status === 'completed')
      )
    : null;

  // Get filtered catalog items based on type and search
  const getFilteredCatalogItems = () => {
    const searchLower = searchTerm.toLowerCase();
    
    switch (itemForm.type) {
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
      default:
        return null;
    }
  };

  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleTypeChange = (newType: 'custom' | 'medication' | 'exam' | 'care') => {
    setItemForm(prev => ({
      ...prev,
      type: newType,
      catalogItemId: '',
      name: newType === 'custom' ? prev.name : '',
      description: newType === 'custom' ? prev.description : '',
      unitPrice: newType === 'custom' ? prev.unitPrice : 0
    }));
    setSearchTerm('');
  };

  const handleCatalogItemSelect = (itemId: string) => {
    const catalogItem = getCatalogItemDetails(itemForm.type, itemId);
    if (catalogItem) {
      setItemForm(prev => ({
        ...prev,
        catalogItemId: itemId,
        name: catalogItem.name,
        description: catalogItem.description || '',
        unitPrice: catalogItem.unitPrice
      }));
    }
  };

  const handleAddItem = () => {
    if (itemForm.type !== 'custom' && !itemForm.catalogItemId) return;
    if (itemForm.type === 'custom' && !itemForm.name.trim()) return;

    const newItem: CustomItem = {
      id: editingItem?.id || Date.now().toString(),
      type: itemForm.type,
      catalogItemId: itemForm.catalogItemId || undefined,
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
      type: 'custom',
      catalogItemId: '',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    });
    setSearchTerm('');
    setShowItemForm(false);
  };

  const handleEditItem = (item: CustomItem) => {
    setEditingItem(item);
    setItemForm({
      type: item.type,
      catalogItemId: item.catalogItemId || '',
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
    let subtotal = systemSettings?.billing?.baseConsultationPrice || 100; // Base consultation fee

    // Add consultation cares
    consultationCares.forEach(care => {
      subtotal += care.totalPrice;
    });

    // Add prescription items if prescription exists
    if (associatedPrescription) {
      associatedPrescription.items.forEach(item => {
        subtotal += item.totalPrice;
      });
    }
    // Add custom items
    customItems.forEach(item => {
      subtotal += item.total;
    });

    const taxRate = systemSettings?.system?.taxRate || 8;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleGenerateInvoice = () => {
    if (selectedConsultationId && generateCustomInvoice) {
      // Convert custom items to invoice items format
      const customInvoiceItems = customItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      }));

      generateCustomInvoice(selectedConsultationId, customInvoiceItems);
      
      // Reset form
      setSelectedConsultationId('');
      setCustomItems([]);
      onInvoiceGenerated();
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4 text-blue-600" />;
      case 'exam':
        return <Search className="w-4 h-4 text-green-600" />;
      case 'care':
        return <Stethoscope className="w-4 h-4 text-purple-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'medication':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'exam':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'care':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getItemTypeText = (type: string) => {
    switch (type) {
      case 'medication':
        return 'Médicament';
      case 'exam':
        return 'Examen';
      case 'care':
        return 'Soin';
      default:
        return 'Article personnalisé';
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
                    <p className="text-sm font-medium text-gray-900">{formatCurrencyWithSettings(100, systemSettings)}</p>
                    <p className="text-xs text-gray-500">1 × {formatCurrencyWithSettings(100, systemSettings)}</p>
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
                        <p className="text-sm font-medium text-gray-900">{formatCurrencyWithSettings(care.totalPrice, systemSettings)}</p>
                        <p className="text-xs text-gray-500">{care.quantity} × {care.unitPrice.toLocaleString()} €</p>
                      </div>
                    </div>
                  );
                })}

                {/* Prescription items */}
                {associatedPrescription && associatedPrescription.items.map((prescItem) => {
                  const itemDetails = getCatalogItemDetails(prescItem.type, prescItem.itemId);
                  return (
                    <div key={`prescription-${prescItem.id}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Prescription
                          </span>
                          <p className="text-sm font-medium text-gray-900">{itemDetails?.name}</p>
                        </div>
                        <p className="text-sm text-gray-500">{itemDetails?.description || prescItem.instructions}</p>
                        {prescItem.dosage && (
                          <p className="text-xs text-gray-400">Dosage: {prescItem.dosage}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrencyWithSettings(prescItem.totalPrice, systemSettings)}</p>
                        <p className="text-xs text-gray-500">{prescItem.quantity} × {formatCurrencyWithSettings(prescItem.unitPrice, systemSettings)}</p>
                      </div>
                    </div>
                  );
                })}
                {/* Custom items */}
                {customItems.map((item) => (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg border ${getItemTypeColor(item.type)}`}>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getItemTypeIcon(item.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                          <span className="text-xs font-medium">{getItemTypeText(item.type)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right mr-3">
                      <p className="text-sm font-medium text-gray-900">{formatCurrencyWithSettings(item.total, systemSettings)}</p>
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
                      <span className="font-medium">{formatCurrencyWithSettings(subtotal, systemSettings)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">TVA ({systemSettings?.system?.taxRate || 8}%):</span>
                      <span className="font-medium">{formatCurrencyWithSettings(tax, systemSettings)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatCurrencyWithSettings(total, systemSettings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prescription Information */}
          {selectedConsultation && associatedPrescription && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  Prescription Associée
                </span>
                <span className="text-sm font-medium text-gray-900">
                  #{associatedPrescription.id.slice(-6).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Cette consultation a une prescription associée qui sera automatiquement incluse dans la facture.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {associatedPrescription.items.length} élément(s) • 
                Valide jusqu'au {new Date(associatedPrescription.validUntil).toLocaleDateString('fr-FR')}
              </p>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? 'Modifier l\'article' : 'Ajouter un article'}
              </h3>
              <button
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  setItemForm({ type: 'custom', catalogItemId: '', name: '', description: '', quantity: 1, unitPrice: 0 });
                  setSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Type d'article</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'custom', label: 'Article personnalisé', icon: Activity },
                    { value: 'medication', label: 'Médicament', icon: Pill },
                    { value: 'exam', label: 'Examen', icon: Search },
                    { value: 'care', label: 'Soin', icon: Stethoscope }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value as any)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors flex flex-col items-center space-y-2 ${
                          itemForm.type === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catalog Item Selection */}
              {itemForm.type !== 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un {itemForm.type === 'medication' ? 'médicament' : itemForm.type === 'exam' ? 'examen' : 'soin'}
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder={`Rechercher un ${itemForm.type === 'medication' ? 'médicament' : itemForm.type === 'exam' ? 'examen' : 'soin'}...`}
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
                        onClick={() => handleCatalogItemSelect(catalogItem.id)}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          itemForm.catalogItemId === catalogItem.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{catalogItem.name}</div>
                            <div className="text-sm text-gray-500">
                              {catalogItem.description || 
                               (catalogItem.genericName && `(${catalogItem.genericName})`) ||
                               (catalogItem.form && `${catalogItem.form} - ${catalogItem.strength}`)}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 ml-4">
                            {formatCurrencyWithSettings(catalogItem.unitPrice, systemSettings)}
                          </div>
                        </div>
                      </button>
                    ))}
                    {getFilteredCatalogItems().length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        Aucun élément trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Item Details Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={handleItemFormChange}
                    name="name"
                    disabled={itemForm.type !== 'custom'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Nom de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix unitaire (€) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemForm.unitPrice}
                    onChange={handleItemFormChange}
                    name="unitPrice"
                    disabled={itemForm.type !== 'custom'}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantité *</label>
                  <input
                    type="number"
                    min="1"
                    value={itemForm.quantity}
                    onChange={handleItemFormChange}
                    name="quantity"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                  <input
                    type="text"
                    value={formatCurrencyWithSettings(itemForm.quantity * itemForm.unitPrice, systemSettings)}
                    disabled
                    className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={handleItemFormChange}
                  name="description"
                  rows={3}
                  disabled={itemForm.type !== 'custom'}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Description de l'article"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowItemForm(false);
                  setEditingItem(null);
                  setItemForm({ type: 'custom', catalogItemId: '', name: '', description: '', quantity: 1, unitPrice: 0 });
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
                  (itemForm.type === 'custom' && (!itemForm.name.trim() || itemForm.unitPrice <= 0)) ||
                  (itemForm.type !== 'custom' && !itemForm.catalogItemId) ||
                  itemForm.quantity <= 0
                }
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