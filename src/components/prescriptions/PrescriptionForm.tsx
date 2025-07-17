import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Prescription, PrescriptionItem, Medication, MedicalExam, MedicalCare } from '../../types';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { validatePrescriptionDate, checkMedicationAllergy, formatAllergyWarning } from '../../utils/businessRules';

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  consultationId?: string;
  onSubmit: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PrescriptionForm({ prescription, consultationId, onSubmit, onCancel }: PrescriptionFormProps) {
  const { 
    consultations, 
    patients, 
    currentUser, 
    medications, 
    medicalExams, 
    medicalCares 
  } = useApp();

  const [formData, setFormData] = useState({
    consultationId: prescription?.consultationId || consultationId || '',
    instructions: prescription?.instructions || '',
    validUntil: prescription?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [items, setItems] = useState<PrescriptionItem[]>(prescription?.items || []);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    type: 'medication' as 'medication' | 'exam' | 'care',
    itemId: '',
    quantity: 1,
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Get available consultations
  const availableConsultations = consultations.filter(consultation => {
    if (currentUser?.role === 'doctor') {
      return consultation.status === 'completed' && consultation.doctorId === currentUser.id;
    }
    return consultation.status === 'completed';
  });

  const selectedConsultation = availableConsultations.find(c => c.id === formData.consultationId);
  const selectedPatient = selectedConsultation 
    ? patients.find(p => p.id === selectedConsultation.patientId)
    : null;

  // Filter items based on type and search
  const getFilteredItems = () => {
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

  const getItemDetails = (type: string, itemId: string) => {
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemForm(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' ? parseInt(value) || 1 : value 
    }));
  };

  const handleAddItem = () => {
    if (!itemForm.itemId) return;

    const itemDetails = getItemDetails(itemForm.type, itemForm.itemId);
    if (!itemDetails) return;

    // Vérification des allergies pour les médicaments
    if (itemForm.type === 'medication' && selectedPatient && selectedPatient.allergies) {
      const medication = itemDetails as any;
      const allergies = selectedPatient.allergies.toLowerCase();
      const medicationName = medication.name.toLowerCase();
      const genericName = medication.genericName?.toLowerCase() || '';
      
      if (allergies.includes(medicationName) || (genericName && allergies.includes(genericName))) {
        const allergyWarning = `⚠️ ATTENTION: Le patient ${selectedPatient.firstName} ${selectedPatient.lastName} est allergique à "${medication.name}"${genericName ? ` (${medication.genericName})` : ''}.\n\nVoulez-vous tout de même ajouter ce médicament à la prescription ?`;
        
        if (!confirm(allergyWarning)) {
          return; // Annuler l'ajout si le médecin refuse
        }
      }
    }

    const newItem: PrescriptionItem = {
      id: Date.now().toString(),
      type: itemForm.type,
      itemId: itemForm.itemId,
      quantity: itemForm.quantity,
      dosage: itemForm.dosage.trim() || undefined,
      frequency: itemForm.frequency.trim() || undefined,
      duration: itemForm.duration.trim() || undefined,
      instructions: itemForm.instructions.trim() || undefined,
      unitPrice: itemDetails.unitPrice,
      totalPrice: itemDetails.unitPrice * itemForm.quantity
    };

    setItems(prev => [...prev, newItem]);
    
    // Reset form
    setItemForm({
      type: 'medication',
      itemId: '',
      quantity: 1,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    setSearchTerm('');
    setShowItemForm(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedConsultation || !currentUser) return;

    // Validation de la date de validité
    const validUntilDate = new Date(formData.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    validUntilDate.setHours(0, 0, 0, 0);
    
    if (validUntilDate <= today) {
      alert('❌ Erreur: La date de validité de la prescription doit être dans le futur.');
      return;
    }

    // Vérification finale des allergies pour tous les médicaments
    if (selectedPatient && selectedPatient.allergies) {
      const allergyWarnings: string[] = [];
      
      items.forEach(item => {
        if (item.type === 'medication') {
          const medication = getItemDetails(item.type, item.itemId) as any;
          if (medication) {
            const allergies = selectedPatient.allergies!.toLowerCase();
            const medicationName = medication.name.toLowerCase();
            const genericName = medication.genericName?.toLowerCase() || '';
            
            if (allergies.includes(medicationName) || (genericName && allergies.includes(genericName))) {
              allergyWarnings.push(`• ${medication.name}${genericName ? ` (${medication.genericName})` : ''}`);
            }
          }
        }
      });
      
      if (allergyWarnings.length > 0) {
        const confirmMessage = `⚠️ ALERTE ALLERGIES DÉTECTÉES ⚠️\n\nLe patient ${selectedPatient.firstName} ${selectedPatient.lastName} est allergique aux médicaments suivants dans cette prescription :\n\n${allergyWarnings.join('\n')}\n\nÊtes-vous sûr de vouloir créer cette prescription ?`;
        
        if (!confirm(confirmMessage)) {
          return; // Annuler la création si le médecin refuse
        }
      }
    }

    const prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'> = {
      consultationId: formData.consultationId,
      patientId: selectedConsultation.patientId,
      doctorId: currentUser.id,
      items,
      instructions: formData.instructions.trim(),
      status: 'active',
      validUntil: formData.validUntil,
    };

    onSubmit(prescriptionData);
  };

  const getFormText = (form: string) => {
    switch (form) {
      case 'tablet': return 'Comprimé';
      case 'syrup': return 'Sirop';
      case 'injection': return 'Injection';
      case 'capsule': return 'Gélule';
      case 'cream': return 'Crème';
      case 'drops': return 'Gouttes';
      case 'inhaler': return 'Inhalateur';
      case 'patch': return 'Patch';
      default: return form;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'antibiotic': return 'Antibiotique';
      case 'analgesic': return 'Antalgique';
      case 'antiviral': return 'Antiviral';
      case 'cardiovascular': return 'Cardiovasculaire';
      case 'respiratory': return 'Respiratoire';
      case 'digestive': return 'Digestif';
      case 'neurological': return 'Neurologique';
      case 'radiology': return 'Radiologie';
      case 'laboratory': return 'Laboratoire';
      case 'cardiology': return 'Cardiologie';
      case 'ultrasound': return 'Échographie';
      case 'endoscopy': return 'Endoscopie';
      case 'nursing': return 'Soins infirmiers';
      case 'procedure': return 'Procédure';
      case 'therapy': return 'Thérapie';
      default: return 'Autre';
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {prescription ? 'Modifier la Prescription' : 'Nouvelle Prescription'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultation Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="consultationId" className="block text-sm font-medium text-gray-700 mb-2">
              Consultation *
            </label>
            <select
              id="consultationId"
              name="consultationId"
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.consultationId}
              onChange={handleFormChange}
              disabled={!!prescription}
            >
              <option value="">Sélectionner une consultation</option>
              {availableConsultations.map((consultation) => {
                const patient = patients.find(p => p.id === consultation.patientId);
                return (
                  <option key={consultation.id} value={consultation.id}>
                    {patient?.firstName} {patient?.lastName} - {new Date(consultation.date).toLocaleDateString('fr-FR')}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-2">
              Valide jusqu'au *
            </label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              required
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.validUntil}
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Patient Info */}
        {selectedPatient && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Informations du patient</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Nom:</span> {selectedPatient.firstName} {selectedPatient.lastName}
              </div>
              <div>
                <span className="font-medium">Âge:</span> {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} ans
              </div>
              <div>
                <span className="font-medium">Allergies:</span> {selectedPatient.allergies || 'Aucune'}
              </div>
            </div>
          </div>
        )}

        {/* Prescription Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Éléments de la prescription</h3>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {items.map((item) => {
              const itemDetails = getItemDetails(item.type, item.itemId);
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          item.type === 'medication' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'exam' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.type === 'medication' ? 'Médicament' :
                           item.type === 'exam' ? 'Examen' : 'Soin'}
                        </div>
                        <h4 className="font-medium text-gray-900">{itemDetails?.name}</h4>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>Quantité: {item.quantity}</div>
                        {item.dosage && <div>Dosage: {item.dosage}</div>}
                        {item.frequency && <div>Fréquence: {item.frequency}</div>}
                        {item.duration && <div>Durée: {item.duration}</div>}
                      </div>
                      
                      {item.instructions && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Instructions:</span> {item.instructions}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {item.totalPrice.toLocaleString()} €
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.unitPrice.toLocaleString()} € × {item.quantity}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          {items.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total estimé:</span>
                <span className="text-lg font-bold text-blue-600">{totalAmount.toLocaleString()} €</span>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Instructions générales
          </label>
          <textarea
            id="instructions"
            name="instructions"
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.instructions}
            onChange={handleFormChange}
            placeholder="Instructions générales pour le patient..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={items.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prescription ? 'Mettre à jour' : 'Créer la prescription'}
          </button>
        </div>
      </form>

      {/* Add Item Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ajouter un élément</h3>
              <button
                onClick={() => {
                  setShowItemForm(false);
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
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'medication', label: 'Médicament' },
                    { value: 'exam', label: 'Examen' },
                    { value: 'care', label: 'Soin' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setItemForm(prev => ({ ...prev, type: type.value as any, itemId: '' }))}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                        itemForm.type === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={`Rechercher un ${itemForm.type === 'medication' ? 'médicament' : itemForm.type === 'exam' ? 'examen' : 'soin'}...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {getFilteredItems().map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setItemForm(prev => ({ ...prev, itemId: item.id }))}
                    className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                      itemForm.itemId === item.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.description || 
                           (item.genericName && `(${item.genericName})`) ||
                           getCategoryText(item.category)}
                        </div>
                        {item.form && (
                          <div className="text-xs text-gray-400">
                            {getFormText(item.form)} - {item.strength}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.unitPrice.toLocaleString()} €
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Item Details Form */}
              {itemForm.itemId && (
                <div className="space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        value={itemForm.quantity}
                        onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    {itemForm.type === 'medication' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                          <input
                            type="text"
                            value={itemForm.dosage}
                            onChange={handleItemFormChange}
                            name="dosage"
                            placeholder="Ex: 1 comprimé"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                          <input
                            type="text"
                            value={itemForm.frequency}
                            onChange={handleItemFormChange}
                            name="frequency"
                            placeholder="Ex: 3 fois par jour"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                          <input
                            type="text"
                            value={itemForm.duration}
                            onChange={handleItemFormChange}
                            name="duration"
                            placeholder="Ex: 7 jours"
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions spécifiques</label>
                    <textarea
                      value={itemForm.instructions}
                      onChange={handleItemFormChange}
                      name="instructions"
                      rows={2}
                      placeholder="Instructions particulières..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowItemForm(false);
                  setSearchTerm('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!itemForm.itemId}
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