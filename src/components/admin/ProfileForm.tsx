import React, { useState } from 'react';
import { Profile } from '../../types';
import { X, Eye, EyeOff } from 'lucide-react';

interface ProfileFormProps {
  profile?: Profile | null;
  onSubmit: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProfileForm({ profile, onSubmit, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    role: profile?.role || 'doctor',
    phone: profile?.phone || '',
    specialization: profile?.specialization || '',
    password: '',
    confirmPassword: '',
    isActive: profile?.isActive !== undefined ? profile.isActive : true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!profile && !formData.password) {
      alert('Le mot de passe est requis pour un nouveau profil');
      return;
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const profileData: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      phone: formData.phone.trim() || undefined,
      specialization: formData.specialization.trim() || undefined,
      isActive: formData.isActive,
    };

    if (formData.password) {
      profileData.password = formData.password;
    }

    onSubmit(profileData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          {profile ? 'Modifier le Profil' : 'Nouveau Profil'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Dr. Jean Dupont"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
              placeholder="jean.dupont@clinic.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle *
            </label>
            <select
              id="role"
              name="role"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="doctor">Médecin</option>
              <option value="cashier">Caissier</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          {formData.role === 'doctor' && (
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Spécialisation
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Ex: Cardiologie, Pédiatrie..."
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {profile ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
            </label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                required={!profile}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm pr-10"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe {!profile && '*'}
            </label>
            <div className="mt-1 relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                required={!profile || !!formData.password}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Profil actif (peut se connecter)
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Permissions par rôle :</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Administrateur :</strong> Accès complet au système, gestion des profils</p>
            <p><strong>Médecin :</strong> Consultations, prescriptions, patients</p>
            <p><strong>Caissier :</strong> Facturation, paiements, support consultations</p>
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
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
          >
            {profile ? 'Mettre à jour' : 'Créer le profil'}
          </button>
        </div>
      </form>
    </div>
  );
}