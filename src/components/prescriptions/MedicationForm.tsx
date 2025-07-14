import React, { useState } from 'react';
import { Medication } from '../../types';
import { X } from 'lucide-react';

interface MedicationFormProps {
  medication?: Medication | null;
  onSubmit: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function MedicationForm({ medication, onSubmit, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    name: medication?.name || '',
    genericName: medication?.genericName || '',
    form: medication?.form || 'tablet',
    strength: medication?.strength || '',
    manufacturer: medication?.manufacturer || '',
    unitPrice: medication?.unitPrice || 0,
    stockQuantity: medication?.stockQuantity || 0,
    isActive: medication?.isActive !== undefined ? medication.isActive : true,
    category: medication?.category || 'other',
    requiresPrescription: medication?.requiresPrescription !== undefined ? medication.requiresPrescription : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'unitPrice' || name === 'stockQuantity') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {medication ? 'Modifier le Médicament' : 'Nouveau Médicament'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom commercial *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Doliprane, Amoxicilline..."
            />
          </div>

          <div>
            <label htmlFor="genericName" className="block text-sm font-medium text-gray-700">
              Nom générique
            </label>
            <input
              type="text"
              id="genericName"
              name="genericName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.genericName}
              onChange={handleChange}
              placeholder="Ex: Paracétamol, Amoxicilline..."
            />
          </div>

          <div>
            <label htmlFor="form" className="block text-sm font-medium text-gray-700">
              Forme *
            </label>
            <select
              id="form"
              name="form"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.form}
              onChange={handleChange}
            >
              <option value="tablet">Comprimé</option>
              <option value="syrup">Sirop</option>
              <option value="injection">Injection</option>
              <option value="capsule">Gélule</option>
              <option value="cream">Crème</option>
              <option value="drops">Gouttes</option>
              <option value="inhaler">Inhalateur</option>
              <option value="patch">Patch</option>
            </select>
          </div>

          <div>
            <label htmlFor="strength" className="block text-sm font-medium text-gray-700">
              Dosage *
            </label>
            <input
              type="text"
              id="strength"
              name="strength"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.strength}
              onChange={handleChange}
              placeholder="Ex: 500mg, 10ml, 1g..."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="antibiotic">Antibiotique</option>
              <option value="analgesic">Antalgique</option>
              <option value="antiviral">Antiviral</option>
              <option value="cardiovascular">Cardiovasculaire</option>
              <option value="respiratory">Respiratoire</option>
              <option value="digestive">Digestif</option>
              <option value="neurological">Neurologique</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
              Fabricant
            </label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="Ex: Sanofi, Pfizer..."
            />
          </div>

          <div>
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
              Prix unitaire (€) *
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.unitPrice}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
              Quantité en stock
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.stockQuantity}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="requiresPrescription"
              name="requiresPrescription"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.requiresPrescription}
              onChange={handleChange}
            />
            <label htmlFor="requiresPrescription" className="ml-2 block text-sm text-gray-900">
              Nécessite une ordonnance
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Médicament actif (disponible pour prescription)
            </label>
          </div>
        </div>

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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            {medication ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}