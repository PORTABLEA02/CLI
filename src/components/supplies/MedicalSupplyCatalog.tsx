import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { MedicalSupplyForm } from './MedicalSupplyForm';
import { Plus, Search, Edit, Eye, Package, AlertTriangle, Filter } from 'lucide-react';
import { MedicalSupply } from '../../types';

export function MedicalSupplyCatalog() {
  const { medicalSupplies, addMedicalSupply, updateMedicalSupply, currentProfile, systemSettings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupply, setEditingSupply] = useState<MedicalSupply | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStock, setFilterStock] = useState<string>('all');

  const filteredSupplies = medicalSupplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || supply.category === filterCategory;
    const matchesSubCategory = filterSubCategory === 'all' || supply.subCategory === filterSubCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && supply.isActive) ||
                         (filterStatus === 'inactive' && !supply.isActive);
    
    const matchesStock = filterStock === 'all' || 
                        (filterStock === 'low' && supply.stockQuantity <= supply.minStockLevel) ||
                        (filterStock === 'normal' && supply.stockQuantity > supply.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesSubCategory && matchesStatus && matchesStock;
  });

  const handleAddSupply = (supplyData: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMedicalSupply(supplyData);
    setShowForm(false);
  };

  const handleUpdateSupply = (supplyData: Omit<MedicalSupply, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSupply) {
      updateMedicalSupply(editingSupply.id, supplyData);
      setEditingSupply(null);
    }
  };

  // Contrôle d'accès : seuls les admins peuvent ajouter/modifier des fournitures
  const canManageSupplies = currentProfile?.role === 'admin';
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'disposable': return 'Jetable';
      case 'equipment': return 'Équipement';
      case 'consumable': return 'Consommable';
      case 'instrument': return 'Instrument';
      case 'protective': return 'Protection';
      default: return 'Autre';
    }
  };

  const getSubCategoryText = (subCategory?: string) => {
    if (!subCategory) return '';
    switch (subCategory) {
      case 'catheter': return 'Cathéter';
      case 'syringe': return 'Seringue';
      case 'bandage': return 'Bandage';
      case 'gloves': return 'Gants';
      case 'gauze': return 'Compresse';
      case 'tube': return 'Sonde';
      case 'mask': return 'Masque';
      case 'infusion': return 'Perfusion';
      default: return subCategory;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'disposable': return 'bg-blue-100 text-blue-800';
      case 'equipment': return 'bg-green-100 text-green-800';
      case 'consumable': return 'bg-yellow-100 text-yellow-800';
      case 'instrument': return 'bg-purple-100 text-purple-800';
      case 'protective': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (supply: MedicalSupply) => {
    if (supply.stockQuantity <= supply.minStockLevel) {
      return { status: 'low', color: 'text-red-600', icon: AlertTriangle };
    }
    return { status: 'normal', color: 'text-green-600', icon: Package };
  };

  const totalSupplies = filteredSupplies.length;
  const activeSupplies = filteredSupplies.filter(s => s.isActive).length;
  const lowStockSupplies = filteredSupplies.filter(s => s.stockQuantity <= s.minStockLevel).length;
  const totalValue = filteredSupplies.reduce((sum, supply) => sum + (supply.unitPrice * supply.stockQuantity), 0);

  // Get unique subcategories for filter
  const subCategories = [...new Set(medicalSupplies.map(s => s.subCategory).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue des Produits de Soins</h1>
        {canManageSupplies && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Produit</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{totalSupplies}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produits Actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeSupplies}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className="text-2xl font-bold text-red-600">{lowStockSupplies}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyWithSettings(totalValue, systemSettings)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600 font-bold text-xl">€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes les catégories</option>
          <option value="disposable">Jetables</option>
          <option value="equipment">Équipements</option>
          <option value="consumable">Consommables</option>
          <option value="instrument">Instruments</option>
          <option value="protective">Protection</option>
          <option value="other">Autres</option>
        </select>
        <select
          value={filterSubCategory}
          onChange={(e) => setFilterSubCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes les sous-catégories</option>
          {subCategories.map(subCat => (
            <option key={subCat} value={subCat}>
              {getSubCategoryText(subCat)}
            </option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les stocks</option>
          <option value="low">Stock faible</option>
          <option value="normal">Stock normal</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>

      {/* Supplies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Produits de Soins ({filteredSupplies.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
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
              {filteredSupplies.map((supply) => {
                const stockStatus = getStockStatus(supply);
                const StockIcon = stockStatus.icon;
                
                return (
                  <tr key={supply.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                          <span>{supply.name}</span>
                          {!supply.isActive && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              Inactif
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{supply.description}</div>
                        {supply.reference && (
                          <div className="text-xs text-gray-400">Réf: {supply.reference}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(supply.category)}`}>
                          {getCategoryText(supply.category)}
                        </span>
                        {supply.subCategory && (
                          <div className="text-xs text-gray-500">
                            {getSubCategoryText(supply.subCategory)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrencyWithSettings(supply.unitPrice, systemSettings)}
                      </div>
                      {supply.requiresDoctor && (
                        <div className="text-xs text-orange-600">
                          Médecin requis
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center space-x-1 ${stockStatus.color}`}>
                        <StockIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{supply.stockQuantity}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {supply.minStockLevel}
                      </div>
                      <div className="text-xs text-gray-500">
                        Valeur: {formatCurrencyWithSettings(supply.unitPrice * supply.stockQuantity, systemSettings)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {supply.supplier || 'Non spécifié'}
                      </div>
                      {supply.expirationDate && (
                        <div className="text-xs text-gray-500">
                          Exp: {new Date(supply.expirationDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        supply.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {supply.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canManageSupplies && (
                        <button
                          onClick={() => setEditingSupply(supply)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockSupplies > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Alerte Stock Faible
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {lowStockSupplies} produit(s) ont un stock inférieur ou égal au seuil minimum. 
                  Pensez à réapprovisionner ces articles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supply Form Modal */}
      {(showForm || editingSupply) && canManageSupplies && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MedicalSupplyForm
              supply={editingSupply}
              onSubmit={editingSupply ? handleUpdateSupply : handleAddSupply}
              onCancel={() => {
                setShowForm(false);
                setEditingSupply(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}