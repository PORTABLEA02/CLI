import React, { useState, useEffect } from 'react';
import { Save, Settings, Building, Phone, Mail, MapPin, DollarSign, FileText, Image } from 'lucide-react';
import { supabase, SystemSettings } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function SystemSettingsForm() {
  const { profile, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [formData, setFormData] = useState({
    clinic_name: '',
    clinic_address: '',
    clinic_phone: '',
    clinic_email: '',
    currency: 'FCFA',
    currency_symbol: 'FCFA',
    tax_rate: 0,
    invoice_footer: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Récupération des paramètres système...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        console.log('Paramètres système récupérés:', data);
        setSettings(data);
        setFormData({
          clinic_name: data.clinic_name,
          clinic_address: data.clinic_address || '',
          clinic_phone: data.clinic_phone || '',
          clinic_email: data.clinic_email || '',
          currency: data.currency,
          currency_symbol: data.currency_symbol,
          tax_rate: data.tax_rate,
          invoice_footer: data.invoice_footer || '',
          logo_url: data.logo_url || '',
        });
      } else {
        console.log('Aucun paramètre système trouvé, utilisation des valeurs par défaut');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      setError('Erreur lors du chargement des paramètres système');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.clinic_name.trim()) {
        throw new Error('Le nom de la clinique est obligatoire');
      }

      if (!formData.currency.trim()) {
        throw new Error('La devise est obligatoire');
      }

      if (!formData.currency_symbol.trim()) {
        throw new Error('Le symbole de la devise est obligatoire');
      }

      const settingsData = {
        clinic_name: formData.clinic_name.trim(),
        clinic_address: formData.clinic_address.trim() || null,
        clinic_phone: formData.clinic_phone.trim() || null,
        clinic_email: formData.clinic_email.trim() || null,
        currency: formData.currency.trim(),
        currency_symbol: formData.currency_symbol.trim(),
        tax_rate: formData.tax_rate,
        invoice_footer: formData.invoice_footer.trim() || null,
        logo_url: formData.logo_url.trim() || null,
      };

      if (settings) {
        // Mise à jour
        console.log('Mise à jour des paramètres système:', settings.id);
        const { error: updateError } = await supabase
          .from('system_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (updateError) throw updateError;
        console.log('Paramètres système mis à jour avec succès');
      } else {
        // Création
        console.log('Création des paramètres système');
        const { data: newSettings, error: insertError } = await supabase
          .from('system_settings')
          .insert([settingsData])
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
        console.log('Paramètres système créés avec succès');
      }

      setSuccess('Paramètres système sauvegardés avec succès');
      
      // Recharger les paramètres pour s'assurer qu'ils sont à jour
      setTimeout(() => {
        fetchSettings();
        setSuccess('');
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setError(error.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const currencyOptions = [
    { value: 'FCFA', label: 'Franc CFA (FCFA)', symbol: 'FCFA' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'USD', label: 'Dollar US ($)', symbol: '$' },
    { value: 'MAD', label: 'Dirham Marocain (MAD)', symbol: 'MAD' },
    { value: 'TND', label: 'Dinar Tunisien (TND)', symbol: 'TND' },
    { value: 'DZD', label: 'Dinar Algérien (DZD)', symbol: 'DZD' },
  ];

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCurrency = currencyOptions.find(option => option.value === e.target.value);
    if (selectedCurrency) {
      setFormData(prev => ({
        ...prev,
        currency: selectedCurrency.value,
        currency_symbol: selectedCurrency.symbol
      }));
    }
  };

  // Attendre que l'authentification ET les paramètres soient chargés
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérifier le rôle seulement après que tout soit chargé
  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder aux paramètres système</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Configuration Système
          </h2>
          <p className="text-gray-600 mt-1">
            Configurez les paramètres généraux de votre clinique
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Informations de la clinique */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Informations de la Clinique
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la clinique *
              </label>
              <input
                type="text"
                name="clinic_name"
                required
                value={formData.clinic_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de votre clinique"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <textarea
                name="clinic_address"
                rows={3}
                value={formData.clinic_address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adresse complète de la clinique"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                name="clinic_phone"
                value={formData.clinic_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="+33 1 23 45 67 89"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="clinic_email"
                value={formData.clinic_email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@clinique.com"
              />
            </div>
          </div>
        </div>

        {/* Configuration financière */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Configuration Financière
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise *
              </label>
              <select
                name="currency"
                required
                value={formData.currency}
                onChange={handleCurrencyChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbole de la devise *
              </label>
              <input
                type="text"
                name="currency_symbol"
                required
                value={formData.currency_symbol}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="FCFA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de taxe (%)
              </label>
              <input
                type="number"
                name="tax_rate"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax_rate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Configuration des documents */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Configuration des Documents
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Image className="w-4 h-4 inline mr-1" />
                URL du logo
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://exemple.com/logo.png"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL publique du logo de votre clinique (utilisé sur les factures et documents)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pied de page des factures
              </label>
              <textarea
                name="invoice_footer"
                rows={3}
                value={formData.invoice_footer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Merci de votre confiance - Système de gestion de clinique médicale"
              />
              <p className="text-xs text-gray-500 mt-1">
                Texte affiché en bas des factures générées
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}