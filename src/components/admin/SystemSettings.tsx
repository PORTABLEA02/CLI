import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
  Settings, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Database,
  Bell,
  Palette,
  Clock,
  DollarSign,
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';

export function SystemSettings() {
  const { systemSettings, updateSystemSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'clinic' | 'system' | 'notifications' | 'billing'>('clinic');
  const [settings, setSettings] = useState(systemSettings || {
    clinic: {
      name: 'ClinicPro',
      address: '123 Rue de la Santé, 75000 Paris, France',
      phone: '+33 1 23 45 67 89',
      email: 'contact@clinicpro.fr',
      website: 'www.clinicpro.fr',
      logo: '',
      description: 'Clinique médicale moderne'
    },
    system: {
      timezone: 'Europe/Paris',
      language: 'fr',
      dateFormat: 'DD/MM/YYYY',
      currency: 'EUR',
      taxRate: 8,
      sessionTimeout: 30,
      backupFrequency: 'daily',
      maintenanceMode: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      appointmentReminders: true,
      paymentReminders: true,
      stockAlerts: true,
      systemAlerts: true
    },
    billing: {
      invoicePrefix: 'INV',
      invoiceNumbering: 'auto',
      paymentTerms: 30,
      lateFee: 5,
      defaultTaxRate: 8,
      acceptedPaymentMethods: ['cash', 'card', 'mobile_money', 'bank_transfer']
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateSystemSettings(settings);
      // Show success message
      alert('Paramètres sauvegardés avec succès !');
    } catch (error) {
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'clinic', label: 'Clinique', icon: Building },
    { id: 'system', label: 'Système', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Facturation', icon: DollarSign }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configuration Système</h1>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'clinic' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Informations de la Clinique</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la clinique
                </label>
                <input
                  type="text"
                  value={settings.clinic.name}
                  onChange={(e) => handleSettingChange('clinic', 'name', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email principal
                </label>
                <input
                  type="email"
                  value={settings.clinic.email}
                  onChange={(e) => handleSettingChange('clinic', 'email', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={settings.clinic.phone}
                  onChange={(e) => handleSettingChange('clinic', 'phone', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site web
                </label>
                <input
                  type="url"
                  value={settings.clinic.website}
                  onChange={(e) => handleSettingChange('clinic', 'website', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète
                </label>
                <textarea
                  rows={3}
                  value={settings.clinic.address}
                  onChange={(e) => handleSettingChange('clinic', 'address', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={settings.clinic.description}
                  onChange={(e) => handleSettingChange('clinic', 'description', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Paramètres Système</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuseau horaire
                </label>
                <select
                  value={settings.system.timezone}
                  onChange={(e) => handleSettingChange('system', 'timezone', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Langue
                </label>
                <select
                  value={settings.system.language}
                  onChange={(e) => handleSettingChange('system', 'language', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format de date
                </label>
                <select
                  value={settings.system.dateFormat}
                  onChange={(e) => handleSettingChange('system', 'dateFormat', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  value={settings.system.currency}
                  onChange={(e) => handleSettingChange('system', 'currency', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar US ($)</option>
                  <option value="GBP">Livre Sterling (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de TVA par défaut (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.system.taxRate}
                  onChange={(e) => handleSettingChange('system', 'taxRate', parseFloat(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout de session (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.system.sessionTimeout}
                  onChange={(e) => handleSettingChange('system', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence de sauvegarde
                </label>
                <select
                  value={settings.system.backupFrequency}
                  onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="hourly">Toutes les heures</option>
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    id="maintenanceMode"
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                    Mode maintenance (bloque l'accès aux utilisateurs non-admin)
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Paramètres de Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notifications par email</h4>
                  <p className="text-sm text-gray-500">Envoyer des notifications par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Notifications SMS</h4>
                  <p className="text-sm text-gray-500">Envoyer des notifications par SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Rappels de rendez-vous</h4>
                  <p className="text-sm text-gray-500">Rappeler les consultations aux patients</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.appointmentReminders}
                  onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Rappels de paiement</h4>
                  <p className="text-sm text-gray-500">Rappeler les factures impayées</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.paymentReminders}
                  onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alertes de stock</h4>
                  <p className="text-sm text-gray-500">Alerter quand le stock est faible</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.stockAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'stockAlerts', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Alertes système</h4>
                  <p className="text-sm text-gray-500">Alerter en cas de problème système</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Paramètres de Facturation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Préfixe des factures
                </label>
                <input
                  type="text"
                  value={settings.billing.invoicePrefix}
                  onChange={(e) => handleSettingChange('billing', 'invoicePrefix', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numérotation des factures
                </label>
                <select
                  value={settings.billing.invoiceNumbering}
                  onChange={(e) => handleSettingChange('billing', 'invoiceNumbering', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="auto">Automatique</option>
                  <option value="manual">Manuelle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de paiement (jours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.billing.paymentTerms}
                  onChange={(e) => handleSettingChange('billing', 'paymentTerms', parseInt(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pénalité de retard (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.1"
                  value={settings.billing.lateFee}
                  onChange={(e) => handleSettingChange('billing', 'lateFee', parseFloat(e.target.value))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modes de paiement acceptés
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cash', label: 'Espèces' },
                    { value: 'card', label: 'Carte bancaire' },
                    { value: 'mobile_money', label: 'Mobile Money' },
                    { value: 'bank_transfer', label: 'Virement bancaire' }
                  ].map((method) => (
                    <div key={method.value} className="flex items-center">
                      <input
                        id={method.value}
                        type="checkbox"
                        checked={settings.billing.acceptedPaymentMethods.includes(method.value)}
                        onChange={(e) => {
                          const methods = settings.billing.acceptedPaymentMethods;
                          if (e.target.checked) {
                            handleSettingChange('billing', 'acceptedPaymentMethods', [...methods, method.value]);
                          } else {
                            handleSettingChange('billing', 'acceptedPaymentMethods', methods.filter(m => m !== method.value));
                          }
                        }}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor={method.value} className="ml-2 block text-sm text-gray-900">
                        {method.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}