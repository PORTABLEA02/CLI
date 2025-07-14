import React, { useState } from 'react';
import { MedicalCare } from '../../types';

interface MedicalCareFormProps {
  care?: MedicalCare | null;
  onSubmit: (care: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function MedicalCareForm({ care, onSubmit, onCancel }: MedicalCareFormProps) {
  const [formData, setFormData] = useState({
    name: care?.name || '',
    description: care?.description || '',
    category: care?.category || 'nursing',
    unitPrice: care?.unitPrice || 0,
    duration: care?.duration || 0,
    requiresDoctor: care?.requiresDoctor || false,
    isActive: care?.isActive !== undefined ? care.isActive : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'unitPrice' || name === 'duration') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {care ? 'Modifier le Soin' : 'Nouveau Soin'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Fermer</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom du soin *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Pansement simple, Injection intramusculaire..."
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
            <option value="nursing">Soins infirmiers</option>
            <option value="injection">Injection</option>
            <option value="examination">Examen</option>
            <option value="procedure">Procédure</option>
            <option value="therapy">Thérapie</option>
            <option value="other">Autre</option>
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
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Durée estimée (minutes)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.duration}
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
            placeholder="Description détaillée du soin ou acte médical..."
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
            Soin actif (disponible pour les consultations)
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {care ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}