import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import StockMovementForm from './StockMovementForm';

interface StockOverviewProps {
  onRefresh?: () => void;
}

export default function StockOverview({ onRefresh }: StockOverviewProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Récupération des produits pour l\'aperçu du stock...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      console.log('Produits récupérés:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return { status: 'out_of_stock', color: 'text-red-600', bgColor: 'bg-red-100', text: 'Rupture' };
    } else if (product.current_stock <= product.min_stock_level) {
      return { status: 'low_stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Stock faible' };
    } else {
      return { status: 'in_stock', color: 'text-green-600', bgColor: 'bg-green-100', text: 'En stock' };
    }
  };

  const filteredProducts = products.filter(product => {
    const stockStatus = getStockStatus(product);
    
    switch (filterStock) {
      case 'in_stock':
        return stockStatus.status === 'in_stock';
      case 'low_stock':
        return stockStatus.status === 'low_stock';
      case 'out_of_stock':
        return stockStatus.status === 'out_of_stock';
      default:
        return true;
    }
  });

  const handleMovementSuccess = () => {
    fetchProducts();
    onRefresh?.();
  };

  const handleQuickMovement = (product: Product, type: 'in' | 'out') => {
    setSelectedProduct(product);
    setShowMovementForm(true);
  };

  const getStockStats = () => {
    const inStock = products.filter(p => p.current_stock > p.min_stock_level).length;
    const lowStock = products.filter(p => p.current_stock <= p.min_stock_level && p.current_stock > 0).length;
    const outOfStock = products.filter(p => p.current_stock === 0).length;
    
    return { inStock, lowStock, outOfStock };
  };

  const stats = getStockStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Aperçu du Stock</h3>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setShowMovementForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Mouvement
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Stock</p>
                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rupture</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filtre */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les produits</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock faible</option>
            <option value="out_of_stock">Rupture de stock</option>
          </select>
        </div>

        {/* Liste des produits */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actuel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Minimum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-5 h-5 mr-3 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              {product.description && (
                                <div className="text-sm text-gray-500">
                                  {product.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {product.current_stock} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {product.min_stock_level} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                            {stockStatus.status === 'in_stock' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {stockStatus.status !== 'in_stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {stockStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleQuickMovement(product, 'in')}
                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition-colors"
                              title="Entrée de stock"
                            >
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Entrée
                            </button>
                            <button
                              onClick={() => handleQuickMovement(product, 'out')}
                              className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                              title="Sortie de stock"
                              disabled={product.current_stock === 0}
                            >
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Sortie
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500">
                {filterStock !== 'all'
                  ? 'Aucun produit trouvé pour ce filtre' 
                  : 'Aucun produit disponible'
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {showMovementForm && (
        <StockMovementForm
          product={selectedProduct}
          onClose={() => {
            setShowMovementForm(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleMovementSuccess}
        />
      )}
    </>
  );
}