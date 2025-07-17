import { SystemSettings } from '../types';

/**
 * Formate un montant selon la devise configurée dans le système
 */
export const formatCurrency = (amount: number, currency?: string): string => {
  switch (currency) {
    case 'EUR':
      return `${amount.toLocaleString()} €`;
    case 'USD':
      return `$${amount.toLocaleString()}`;
    case 'GBP':
      return `£${amount.toLocaleString()}`;
    case 'FCFA':
    default:
      return `${amount.toLocaleString()} FCFA`;
  }
};

/**
 * Formate un montant en utilisant les paramètres système
 */
export const formatCurrencyWithSettings = (amount: number, systemSettings?: SystemSettings): string => {
  const currency = systemSettings?.system?.currency || 'FCFA';
  return formatCurrency(amount, currency);
};

/**
 * Formate une date selon le format configuré dans le système
 */
export const formatDate = (date: string | Date, systemSettings?: SystemSettings): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const format = systemSettings?.system?.dateFormat || 'DD/MM/YYYY';
  
  switch (format) {
    case 'MM/DD/YYYY':
      return dateObj.toLocaleDateString('en-US');
    case 'YYYY-MM-DD':
      return dateObj.toISOString().split('T')[0];
    case 'DD/MM/YYYY':
    default:
      return dateObj.toLocaleDateString('fr-FR');
  }
};

/**
 * Formate un pourcentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};