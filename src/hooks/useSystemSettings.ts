import { useState, useEffect } from 'react';
import { supabase, SystemSettings } from '../lib/supabase';

// Hook pour obtenir le symbole de devise
export function useCurrency() {
  const { settings } = useSystemSettings();
  return settings?.currency_symbol || 'FCFA';
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        // Utiliser les valeurs par défaut si aucun paramètre n'est trouvé
        console.log('Aucun paramètre système trouvé, utilisation des valeurs par défaut');
        const defaultSettings: Partial<SystemSettings> = {
          clinic_name: 'CliniqueManager',
          currency: 'FCFA',
          currency_symbol: 'FCFA',
          tax_rate: 0,
          invoice_footer: 'Merci de votre confiance',
        };
        setSettings(defaultSettings as SystemSettings);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres système:', error);
      setError('Erreur lors du chargement des paramètres système');
      
      // Utiliser les valeurs par défaut en cas d'erreur
      const defaultSettings: Partial<SystemSettings> = {
        clinic_name: 'CliniqueManager',
        currency: 'FCFA',
        currency_symbol: 'FCFA',
        tax_rate: 0,
        invoice_footer: 'Merci de votre confiance',
      };
      setSettings(defaultSettings as SystemSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = () => {
    setLoading(true);
    fetchSettings();
  };

  return {
    settings,
    loading,
    error,
    refreshSettings,
  };
}