import React, { useState } from 'react';
import { MedicalExam } from '../../types';
import { X } from 'lucide-react';

interface ExamFormProps {
  exam?: MedicalExam | null;
  onSubmit: (exam: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ExamForm({ exam, onSubmit, onCancel }: ExamFormProps) {
  const [formData, setFormData] = useState({
    name: exam?.name || '',
    description: exam?.description || '',
    category: exam?.category || 'other',
    unitPrice: exam?.unitPrice || 0,
    duration: exam?.duration || 0,
    preparationInstructions: exam?.preparationInstructions || '',
    isActive: exam?.isActive !== undefined ? exam.isActive : true,
    requiresAppointment: exam?.requiresAppointment !== undefined ? exam.requiresAppointment : true,
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
    onSubmit(formData as Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {exam ? 'Modifier l\'Examen' : 'Nouvel Examen'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom de l'examen *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Radiographie thoracique, Échographie abdominale..."
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
              <option value="radiology">Radiologie</option>
              <option value="laboratory">Laboratoire</option>
              <option value="cardiology">Cardiologie</option>
              <option value="ultrasound">Échographie</option>
              <option value="endoscopy">Endoscopie</option>
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
              placeholder="Description détaillée de l'examen..."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="preparationInstructions" className="block text-sm font-medium text-gray-700">
              Instructions de préparation
            </label>
            <textarea
              id="preparationInstructions"
              name="preparationInstructions"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.preparationInstructions}
              onChange={handleChange}
              placeholder="Instructions pour préparer l'examen (jeûne, médicaments à arrêter, etc.)..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="requiresAppointment"
              name="requiresAppointment"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.requiresAppointment}
              onChange={handleChange}
            />
            <label htmlFor="requiresAppointment" className="ml-2 block text-sm text-gray-900">
              Nécessite un rendez-vous
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
              Examen actif (disponible pour prescription)
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
            {exam ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}