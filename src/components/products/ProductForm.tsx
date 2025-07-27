import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'medical' as 'medical' | 'medication',
    unit_price: 0,
    current_stock: 0,
    min_stock_level: 0,
    unit: 'pièce',
    barcode: '',
    expiry_date: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        type: product.type,
        unit_price: product.unit_price,
        current_stock: product.current_stock,
        min_stock_level: product.min_stock_level,
        unit: product.unit,
        barcode: product.barcode || '',
        expiry_date: product.expiry_date || '',
        is_active: product.is_active,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Le nom du produit est obligatoire');
      }

      if (formData.unit_price < 0) {
        throw new Error('Le prix unitaire ne peut pas être négatif');
      }

      if (formData.current_stock < 0) {
        throw new Error('Le stock actuel ne peut pas être négatif');
      }

      if (formData.min_stock_level < 0) {
        throw new Error('Le stock minimum ne peut pas être négatif');
      }

      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        barcode: formData.barcode.trim() || null,
        expiry_date: formData.expiry_date || null,
      };

      if (product) {
        // Mise à jour
        console.log('Mise à jour du produit ID:', product.id);
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        console.log('Produit mis à jour avec succès');
      } else {
        // Création
        console.log('Création d\'un nouveau produit');
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        console.log('Nouveau produit créé avec succès');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            {product ? 'Modifier le Produit' : 'Nouveau Produit'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom du produit"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="medical">Produit médical</option>
                <option value="medication">Médicament</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire (€) *
              </label>
              <input
                type="number"
                name="unit_price"
                min="0"
                step="0.01"
                required
                value={formData.unit_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock actuel *
              </label>
              <input
                type="number"
                name="current_stock"
                min="0"
                step="1"
                required
                value={formData.current_stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock minimum *
              </label>
              <input
                type="number"
                name="min_stock_level"
                min="0"
                step="1"
                required
                value={formData.min_stock_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité *
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pièce">Pièce</option>
                <option value="boîte">Boîte</option>
                <option value="flacon">Flacon</option>
                <option value="tube">Tube</option>
                <option value="ampoule">Ampoule</option>
                <option value="comprimé">Comprimé</option>
                <option value="ml">Millilitre (ml)</option>
                <option value="g">Gramme (g)</option>
                <option value="kg">Kilogramme (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code-barres
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Code-barres du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'expiration
              </label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-gray-700">Produit actif</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Les produits inactifs ne sont pas visibles dans les listes de sélection
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}