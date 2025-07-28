import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Package, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { supabase, StockMovement, Product } from '../../lib/supabase';

interface StockMovementListProps {
  refreshTrigger?: number;
}

export default function StockMovementList({ refreshTrigger }: StockMovementListProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [filterProduct, setFilterProduct] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    try {
      console.log('Récupération des mouvements de stock...');
      
      // Récupérer les mouvements avec les relations
      const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name, unit),
          user:profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (movementsError) throw movementsError;

      // Récupérer les produits pour le filtre
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (productsError) throw productsError;

      console.log('Mouvements de stock récupérés:', movementsData?.length || 0);
      setMovements(movementsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      filterType === 'all' || movement.movement_type === filterType;

    const matchesProduct = 
      !filterProduct || movement.product_id === filterProduct;

    const matchesDateRange = 
      (!dateRange.start || new Date(movement.created_at) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(movement.created_at) <= new Date(dateRange.end + 'T23:59:59'));

    return matchesSearch && matchesType && matchesProduct && matchesDateRange;
  });

  const getTotalQuantityByType = (type: 'in' | 'out') => {
    return filteredMovements
      .filter(m => m.movement_type === type)
      .reduce((sum, m) => sum + m.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des Mouvements</h3>
        
        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            {/* Filtre par type */}
            <div className="lg:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'in' | 'out')}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="all">Tous les types</option>
                <option value="in">Entrées</option>
                <option value="out">Sorties</option>
              </select>
            </div>

            {/* Filtre par produit */}
            <div className="lg:w-48">
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="">Tous les produits</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre par date */}
            <div className="flex space-x-2 lg:w-64">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Date début"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Date fin"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mouvements</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{filteredMovements.length}</p>
            </div>
            <Package className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entrées</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">{getTotalQuantityByType('in')}</p>
            </div>
            <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sorties</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">{getTotalQuantityByType('out')}</p>
            </div>
            <TrendingDown className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Liste des mouvements */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredMovements.length > 0 ? (
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-gray-500">
                            {new Date(movement.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">
                          {movement.product?.name || 'Produit inconnu'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {movement.movement_type === 'in' ? (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Entrée
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Sortie
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        movement.movement_type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity} {movement.product?.unit || 'unité(s)'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {movement.reason || 'Aucune raison spécifiée'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {movement.user?.full_name || 'Utilisateur inconnu'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Version mobile/tablette - cartes */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredMovements.map((movement) => (
              <div key={movement.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(movement.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(movement.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 truncate mb-1">
                      {movement.product?.name || 'Produit inconnu'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {movement.user?.full_name || 'Utilisateur inconnu'}
                    </p>
                  </div>
                  
                  <div className="flex items-center ml-4">
                    {movement.movement_type === 'in' ? (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-bold">+{movement.quantity}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        <span className="text-sm font-bold">-{movement.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    {movement.movement_type === 'in' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Entrée
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Sortie
                      </span>
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {movement.product?.unit || 'unité(s)'}
                    </span>
                  </div>
                  
                  {movement.reason && (
                    <div>
                      <p className="text-sm text-gray-900">{movement.reason}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500">
              {searchTerm || filterType !== 'all' || filterProduct || dateRange.start || dateRange.end
                ? 'Aucun mouvement trouvé pour ces critères' 
                : 'Aucun mouvement de stock enregistré'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}