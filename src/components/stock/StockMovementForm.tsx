import React, { useState, useEffect } from 'react';
import { X, Save, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface StockMovementFormProps {
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

export default function StockMovementForm({ onClose, onSuccess, product }: StockMovementFormProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    product_id: product?.id || '',
    movement_type: 'in' as 'in' | 'out',
    quantity: 1,
    reason: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!product) {
      fetchProducts();
    }
  }, [product]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.product_id) {
        throw new Error('Veuillez sélectionner un produit');
      }

      if (formData.quantity <= 0) {
        throw new Error('La quantité doit être supérieure à 0');
      }

      if (!formData.reason.trim()) {
        throw new Error('Veuillez indiquer la raison du mouvement');
      }

      // Vérifier le stock disponible pour les sorties
      if (formData.movement_type === 'out') {
        const { data: productData } = await supabase
          .from('products')
          .select('current_stock, name')
          .eq('id', formData.product_id)
          .single();

        if (productData && productData.current_stock < formData.quantity) {
          throw new Error(`Stock insuffisant. Stock actuel: ${productData.current_stock}`);
        }
      }

      // Créer le mouvement de stock
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: formData.product_id,
          movement_type: formData.movement_type,
          quantity: formData.quantity,
          reason: formData.reason.trim(),
          user_id: profile?.id,
        }]);

      if (movementError) throw movementError;

      // Mettre à jour le stock du produit
      const stockChange = formData.movement_type === 'in' ? formData.quantity : -formData.quantity;
      
      // Récupérer le stock actuel
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('current_stock')
        .eq('id', formData.product_id)
        .single();

      if (fetchError) throw fetchError;

      const newStock = currentProduct.current_stock + stockChange;
      
      // Vérifier que le stock ne devient pas négatif
      if (newStock < 0) {
        throw new Error('Cette opération rendrait le stock négatif');
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({
          current_stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.product_id);

      if (updateError) throw updateError;

      console.log('Mouvement de stock enregistré avec succès');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement du mouvement:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = product || products.find(p => p.id === formData.product_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Package className="w-6 h-6 mr-2 text-blue-600" />
            Mouvement de Stock
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

          {/* Sélection du produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produit *
            </label>
            {product ? (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">
                  Stock actuel: {product.current_stock} {product.unit}
                </div>
              </div>
            ) : (
              <select
                value={formData.product_id}
                onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner un produit</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.current_stock} {product.unit})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type de mouvement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de mouvement *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, movement_type: 'in' }))}
                className={`flex items-center justify-center px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.movement_type === 'in'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Entrée
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, movement_type: 'out' }))}
                className={`flex items-center justify-center px-4 py-3 rounded-md border-2 transition-colors ${
                  formData.movement_type === 'out'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingDown className="w-5 h-5 mr-2" />
                Sortie
              </button>
            </div>
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {selectedProduct && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  {selectedProduct.unit}
                </div>
              )}
            </div>
            {formData.movement_type === 'out' && selectedProduct && (
              <p className="text-xs text-gray-600 mt-1">
                Stock disponible: {selectedProduct.current_stock} {selectedProduct.unit}
              </p>
            )}
          </div>

          {/* Raison */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison *
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                formData.movement_type === 'in' 
                  ? 'Ex: Réapprovisionnement, Livraison fournisseur...'
                  : 'Ex: Vente, Péremption, Casse...'
              }
              required
            />
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
              className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition-colors ${
                formData.movement_type === 'in'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
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