import React, { useState } from 'react';
import { Patient } from '../../types';

interface PatientFormProps {
  patient?: Patient | null;
  onSubmit: (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function PatientForm({ patient, onSubmit, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || 'male',
    phone: patient?.phone || '',
    email: patient?.email || '',
    address: patient?.address || '',
    emergencyContact: patient?.emergencyContact || '',
    bloodType: patient?.bloodType || '',
    allergies: patient?.allergies || '',
    medicalHistory: patient?.medicalHistory || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {patient ? 'Modifier le Patient' : 'Nouveau Patient'}
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
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date de naissance *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Genre *
          </label>
          <select
            id="gender"
            name="gender"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
            Groupe sanguin
          </label>
          <select
            id="bloodType"
            name="bloodType"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.bloodType}
            onChange={handleChange}
          >
            <option value="">Sélectionner</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div>
          <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
            Contact d'urgence *
          </label>
          <input
            type="text"
            id="emergencyContact"
            name="emergencyContact"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Nom - Téléphone"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Adresse *
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
          Allergies
        </label>
        <textarea
          id="allergies"
          name="allergies"
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.allergies}
          onChange={handleChange}
          placeholder="Allergies connues du patient"
        />
      </div>

      <div>
        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
          Historique médical
        </label>
        <textarea
          id="medicalHistory"
          name="medicalHistory"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={formData.medicalHistory}
          onChange={handleChange}
          placeholder="Historique médical du patient"
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
          {patient ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}