import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook that wraps react-i18next's useTranslation
// This allows us to add custom logic or typing if needed
export const useTranslation = (namespace?: string | string[]) => {
  return useI18nTranslation(namespace);
};

// Helper hook for common translations
export const useCommonTranslation = () => {
  return useI18nTranslation('common');
};

// Helper hook for specific namespaces
export const useAuthTranslation = () => {
  return useI18nTranslation('auth');
};

export const useDashboardTranslation = () => {
  return useI18nTranslation('dashboard');
};

export const usePatientsTranslation = () => {
  return useI18nTranslation('patients');
};

export const useMedicationsTranslation = () => {
  return useI18nTranslation('medications');
};