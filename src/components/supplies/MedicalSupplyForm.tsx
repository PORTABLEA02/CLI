import React, { useState } from 'react';
import { MedicalSupply } from '../../types';
import { X } from 'lucide-react';

interface MedicalSupplyFormProps {
  supply?: MedicalSupply | null;
  onSubmit: (supply: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function MedicalSupplyForm({ supply, onSubmit, onCancel }: MedicalSupplyFormProps) {
  const [formData, setFormData] = useState({
    name: supply?.name || '',
    description: supply?.description || '',
    category: supply?.category || 'disposable',
    subCategory: supply?.subCategory || '',
    unitPrice: supply?.unitPrice || 0,
    stockQuantity: supply?.stockQuantity || 0,
    minStockLevel: supply?.minStockLevel || 0,
    supplier: supply?.supplier || '',
    reference: supply?.reference || '',
    expirationDate: supply?.expirationDate || '',
    isActive: supply?.isActive !== undefined ? supply.isActive : true,
    requiresDoctor: supply?.requiresDoctor !== undefined ? supply.requiresDoctor : false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'unitPrice' || name === 'stockQuantity' || name === 'minStockLevel') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>);
  };

  const getSubCategoryOptions = () => {
    switch (formData.category) {
      case 'disposable':
        return [
          { value: 'catheter', label: 'Cathéter' },
          { value: 'syringe', label: 'Seringue' },
          { value: 'tube', label: 'Sonde' },
          { value: 'infusion', label: 'Perfusion' },
        ];
      case 'consumable':
        return [
          { value: 'bandage', label: 'Bandage' },
          { value: 'gauze', label: 'Compresse' },
          { value: 'tape', label: 'Sparadrap' },
          { value: 'cotton', label: 'Coton' },
        ];
      case 'protective':
        return [
          { value: 'gloves', label: 'Gants' },
          { value: 'mask', label: 'Masque' },
          { value: 'gown', label: 'Blouse' },
          { value: 'cap', label: 'Calot' },
        ];
      case 'equipment':
        return [
          { value: 'monitor', label: 'Moniteur' },
          { value: 'pump', label: 'Pompe' },
          { value: 'ventilator', label: 'Ventilateur' },
        ];
      case 'instrument':
        return [
          { value: 'scissors', label: 'Ciseaux' },
          { value: 'forceps', label: 'Pince' },
          { value: 'scalpel', label: 'Scalpel' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {supply ? 'Modifier le Produit' : 'Nouveau Produit de Soins'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom du produit *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Cathéter urinaire, Seringue 10ml..."
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
              <option value="disposable">Jetable</option>
              <option value="equipment">Équipement</option>
              <option value="consumable">Consommable</option>
              <option value="instrument">Instrument</option>
              <option value="protective">Protection</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
              Sous-catégorie
            </label>
            <select
              id="subCategory"
              name="subCategory"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.subCategory}
              onChange={handleChange}
            >
              <option value="">Sélectionner...</option>
              {getSubCategoryOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              Quantité en stock *
            </label>
            <input
              type="number"
              id="stockQuantity"
              name="stockQuantity"
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.stockQuantity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700">
              Seuil minimum de stock *
            </label>
            <input
              type="number"
              id="minStockLevel"
              name="minStockLevel"
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.minStockLevel}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Fournisseur
            </label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.supplier}
              onChange={handleChange}
              placeholder="Ex: MedSupply Co., SafetyFirst..."
            />
          </div>

          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Référence produit
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Ex: CAT-FOL-16, SYR-10ML..."
            />
          </div>

          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
              Date d'expiration
            </label>
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.expirationDate}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description détaillée du produit..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="requiresDoctor"
              name="requiresDoctor"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.requiresDoctor}
              onChange={handleChange}
            />
            <label htmlFor="requiresDoctor" className="ml-2 block text-sm text-gray-900">
              Nécessite la présence d'un médecin
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
              Produit actif (disponible pour utilisation)
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
            {supply ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}