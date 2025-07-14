import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ConsultationCareManager } from './ConsultationCareManager';
import { Consultation, ConsultationCare } from '../../types';

interface ConsultationFormProps {
  consultation?: Consultation | null;
  onSubmit: (consultation: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ConsultationForm({ consultation, onSubmit, onCancel }: ConsultationFormProps) {
  const { patients, currentUser, addConsultationCare, removeConsultationCare, getConsultationCares } = useApp();
  const [formData, setFormData] = useState({
    patientId: consultation?.patientId || '',
    doctorId: consultation?.doctorId || currentUser?.id || '',
    date: consultation?.date || new Date().toISOString().split('T')[0],
    time: consultation?.time || '09:00',
    type: consultation?.type || 'general',
    status: consultation?.status || 'scheduled',
    symptoms: consultation?.symptoms || '',
    diagnosis: consultation?.diagnosis || '',
    notes: consultation?.notes || '',
    duration: consultation?.duration || 30,
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'care'>('basic');
  const consultationCares = consultation ? getConsultationCares(consultation.id) : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>);
  };

  const handleAddCare = (care: Omit<ConsultationCare, 'id' | 'createdAt'>) => {
    if (consultation) {
      addConsultationCare(care);
    }
  };

  const handleRemoveCare = (careId: string) => {
    removeConsultationCare(careId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {consultation ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Informations de base
          </button>
          {consultation && (
            <button
              onClick={() => setActiveTab('care')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'care'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Soins et actes ({consultationCares.length})
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'basic' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                Patient *
              </label>
              <select
                id="patientId"
                name="patientId"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.patientId}
                onChange={handleChange}
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Type de consultation *
              </label>
              <select
                id="type"
                name="type"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="general">Générale</option>
                <option value="specialist">Spécialiste</option>
                <option value="emergency">Urgence</option>
                <option value="followup">Suivi</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Heure *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.time}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Durée (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                required
                min="15"
                max="180"
                step="15"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Statut *
              </label>
              <select
                id="status"
                name="status"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="scheduled">Planifiée</option>
                <option value="in-progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">
              Symptômes *
            </label>
            <textarea
              id="symptoms"
              name="symptoms"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Décrire les symptômes du patient..."
            />
          </div>

          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700">
              Diagnostic
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Diagnostic médical..."
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes additionnelles..."
            />
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
              {consultation ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'care' && consultation && (
        <ConsultationCareManager
          consultationId={consultation.id}
          consultationCares={consultationCares}
          onAddCare={handleAddCare}
          onRemoveCare={handleRemoveCare}
        />
      )}
    </div>
  );
}