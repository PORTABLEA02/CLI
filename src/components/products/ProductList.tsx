import React, { useState, useEffect } from 'react';
import { Search, Package, Euro, AlertTriangle, CheckCircle, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase, Product } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import ProductForm from './ProductForm';
import { useCurrency } from '../../hooks/useSystemSettings';

interface ProductListProps {
  onCreateProduct?: () => void;
  onEditProduct?: (product: Product) => void;
}

export default function ProductList({ onCreateProduct, onEditProduct }: ProductListProps) {
  const { profile } = useAuth();
  const currencySymbol = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'medical' | 'medication'>('all');
  const [filterStock, setFilterStock] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    try {
      console.log('Récupération de la liste des produits...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
      }
      
      console.log('Produits récupérés avec succès:', data?.length || 0, 'produits');
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des produits:', error);
      console.error('Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm);

    const matchesType = 
      filterType === 'all' || product.type === filterType;

    const matchesStock = 
      filterStock === 'all' ||
      (filterStock === 'in_stock' && product.current_stock > product.min_stock_level) ||
      (filterStock === 'low_stock' && product.current_stock <= product.min_stock_level && product.current_stock > 0) ||
      (filterStock === 'out_of_stock' && product.current_stock === 0);

    return matchesSearch && matchesType && matchesStock;
  });

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) {
      return { status: 'out_of_stock', color: 'text-red-600', bgColor: 'bg-red-100', text: 'Rupture' };
    } else if (product.current_stock <= product.min_stock_level) {
      return { status: 'low_stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100', text: 'Stock faible' };
    } else {
      return { status: 'in_stock', color: 'text-green-600', bgColor: 'bg-green-100', text: 'En stock' };
    }
  };

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'medical':
        return 'Produit médical';
      case 'medication':
        return 'Médicament';
      default:
        return type;
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseForm();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      console.log('Produit supprimé avec succès');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      alert('Erreur lors de la suppression du produit. Il est peut-être utilisé dans des consultations ou factures.');
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">
          Produits Médicaux & Médicaments
        </h2>
        <div className="flex items-center space-x-4">
          {(profile?.role === 'admin' || profile?.role === 'cashier') && (
            <button
              onClick={handleCreateProduct}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Produit
            </button>
          )}
          <div className="text-sm text-gray-600">
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Barre de recherche */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, description ou code-barres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtre par type */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'medical' | 'medication')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="medical">Produits médicaux</option>
              <option value="medication">Médicaments</option>
            </select>
          </div>

          {/* Filtre par stock */}
          <div>
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as 'all' | 'in_stock' | 'low_stock' | 'out_of_stock')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les stocks</option>
              <option value="in_stock">En stock</option>
              <option value="low_stock">Stock faible</option>
              <option value="out_of_stock">Rupture de stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des produits */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="hidden md:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix Unitaire
                  </th>
                  <th className="hidden sm:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="hidden lg:table-cell px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration
                  </th>
                  {(profile?.role === 'admin' || profile?.role === 'cashier') && (
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const expiringSoon = isExpiringSoon(product.expiry_date);
                  const expired = isExpired(product.expiry_date);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {/* Afficher le type sur mobile */}
                            <div className="md:hidden mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                product.type === 'medical' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {getTypeDisplayName(product.type)}
                              </span>
                            </div>
                            {product.description && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                {product.description}
                              </div>
                            )}
                            {product.barcode && (
                              <div className="text-xs text-gray-400 font-mono mt-1">
                                Code: {product.barcode}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.type === 'medical' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {getTypeDisplayName(product.type)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <Euro className="w-4 h-4 mr-1 text-green-600" />
                          <div>
                            <div>{product.unit_price} {currencySymbol}</div>
                            <div className="text-xs text-gray-500">/ {product.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {product.current_stock} {product.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {product.min_stock_level} {product.unit}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                          {stockStatus.status === 'in_stock' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {stockStatus.status !== 'in_stock' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {stockStatus.text}
                        </span>
                        {/* Afficher le stock sur mobile */}
                        <div className="sm:hidden text-xs text-gray-600 mt-1">
                          Stock: {product.current_stock} {product.unit}
                        </div>
                      </td>
                      <td className="hidden lg:table-cell px-4 lg:px-6 py-4 whitespace-nowrap">
                        {product.expiry_date ? (
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            <div>
                              <div className={`text-sm ${
                                expired ? 'text-red-600 font-medium' : 
                                expiringSoon ? 'text-yellow-600 font-medium' : 
                                'text-gray-900'
                              }`}>
                                {new Date(product.expiry_date).toLocaleDateString('fr-FR')}
                              </div>
                              {expired && (
                                <div className="text-xs text-red-600">Expiré</div>
                              )}
                              {expiringSoon && !expired && (
                                <div className="text-xs text-yellow-600">Expire bientôt</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      {(profile?.role === 'admin' || profile?.role === 'cashier') && (
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {profile?.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
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
              {searchTerm || filterType !== 'all' || filterStock !== 'all'
                ? 'Aucun produit trouvé pour ces critères' 
                : 'Aucun produit disponible'
              }
            </div>
          </div>
        )}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">En Stock</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {products.filter(p => p.current_stock > p.min_stock_level).length}
              </p>
            </div>
            <CheckCircle className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-xl lg:text-2xl font-bold text-yellow-600">
                {products.filter(p => p.current_stock <= p.min_stock_level && p.current_stock > 0).length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Rupture</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {products.filter(p => p.current_stock === 0).length}
              </p>
            </div>
            <AlertTriangle className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
          </div>
        </div>
      </div>
    </div>

    {showForm && (
      <ProductForm
        product={selectedProduct}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />
    )}
    </>
  );
}