import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { Plus, Trash2, User, Euro, Clock } from 'lucide-react';
import { ConsultationCare, MedicalCare } from '../../types';

interface ConsultationCareManagerProps {
  consultationId: string;
  consultationCares: ConsultationCare[];
  onAddCare: (care: Omit<ConsultationCare, 'id' | 'createdAt'>) => void;
  onRemoveCare: (careId: string) => void;
}

export function ConsultationCareManager({ 
  consultationId, 
  consultationCares, 
  onAddCare, 
  onRemoveCare 
}: ConsultationCareManagerProps) {
  const { medicalCares, medicalSupplies, currentUser } = useApp();
  const [selectedCareId, setSelectedCareId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const activeCares = medicalCares.filter(care => care.isActive);
  const selectedCare = activeCares.find(care => care.id === selectedCareId);

  const handleAddCare = () => {
    if (!selectedCare || !currentUser) return;

    const newCare: Omit<ConsultationCare, 'id' | 'createdAt'> = {
      consultationId,
      careId: selectedCare.id,
      quantity,
      unitPrice: selectedCare.unitPrice,
      totalPrice: selectedCare.unitPrice * quantity,
      notes: notes.trim() || undefined,
      performedBy: currentUser.id,
      performedAt: new Date().toISOString(),
    };

    onAddCare(newCare);
    
    // Reset form
    setSelectedCareId('');
    setQuantity(1);
    setNotes('');
  };

  const getCareDetails = (careId: string) => {
    return medicalCares.find(care => care.id === careId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nursing':
        return 'bg-blue-100 text-blue-800';
      case 'injection':
        return 'bg-green-100 text-green-800';
      case 'examination':
        return 'bg-purple-100 text-purple-800';
      case 'procedure':
        return 'bg-red-100 text-red-800';
      case 'therapy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'nursing':
        return 'Soins infirmiers';
      case 'injection':
        return 'Injection';
      case 'examination':
        return 'Examen';
      case 'procedure':
        return 'Procédure';
      case 'therapy':
        return 'Thérapie';
      default:
        return 'Autre';
    }
  };

  const totalAmount = consultationCares.reduce((sum, care) => sum + care.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Soins et Actes Réalisés</h3>
        <div className="text-sm text-gray-500">
          Total: <span className="font-medium text-gray-900">{formatCurrencyWithSettings(totalAmount, systemSettings)}</span>
        </div>
      </div>

      {/* Add Care Form */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Ajouter un soin</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <select
              value={selectedCareId}
              onChange={(e) => setSelectedCareId(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Sélectionner un soin</option>
              {activeCares.map((care) => (
                <option key={care.id} value={care.id}>
                  {care.name} - {formatCurrencyWithSettings(care.unitPrice, systemSettings)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder="Quantité"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <button
              onClick={handleAddCare}
              disabled={!selectedCareId}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
        
        {selectedCare && (
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedCare.name}</p>
                <p className="text-sm text-gray-500">{selectedCare.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrencyWithSettings(selectedCare.unitPrice * quantity, systemSettings)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrencyWithSettings(selectedCare.unitPrice, systemSettings)} × {quantity}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes sur le soin (optionnel)"
            rows={2}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Care List */}
      <div className="space-y-3">
        {consultationCares.map((consultationCare) => {
          const careDetails = getCareDetails(consultationCare.careId);
          if (!careDetails) return null;

          return (
            <div key={consultationCare.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{careDetails.name}</h4>
                      <p className="text-sm text-gray-500">{careDetails.description}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded-full font-medium ${getCategoryColor(careDetails.category)}`}>
                      {getCategoryText(careDetails.category)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span>Quantité: {consultationCare.quantity}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Euro className="w-3 h-3" />
                      <span>{formatCurrencyWithSettings(consultationCare.unitPrice, systemSettings)} / unité</span>
                    </div>
                    {careDetails.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{careDetails.duration} min</span>
                      </div>
                    )}
                  </div>

                  {consultationCare.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {consultationCare.notes}
                      </p>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Réalisé le {new Date(consultationCare.performedAt).toLocaleDateString('fr-FR')} à {new Date(consultationCare.performedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrencyWithSettings(consultationCare.totalPrice, systemSettings)}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveCare(consultationCare.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {consultationCares.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun soin ajouté à cette consultation</p>
          </div>
        )}
      </div>
    </div>
  );
}