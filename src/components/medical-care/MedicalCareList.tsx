import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { MedicalCareForm } from './MedicalCareForm';
import { Plus, Search, Edit, Eye, Clock, User, Euro, Filter } from 'lucide-react';
import { MedicalCare } from '../../types';

export function MedicalCareList() {
  const { medicalCares, addMedicalCare, updateMedicalCare, currentUser, systemSettings } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCare, setEditingCare] = useState<MedicalCare | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredCares = medicalCares.filter(care => {
    const matchesSearch = care.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         care.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || care.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && care.isActive) ||
                         (filterStatus === 'inactive' && !care.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddCare = (careData: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMedicalCare(careData);
    setShowForm(false);
  };

  const handleUpdateCare = (careData: Omit<MedicalCare, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCare) {
      updateMedicalCare(editingCare.id, careData);
      setEditingCare(null);
    }
  };

  // Contrôle d'accès : seuls les admins peuvent ajouter/modifier des soins
  const canManageCares = currentUser?.role === 'admin';
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nursing':
        return 'bg-blue-100 text-blue-800';
      case 'injection':
        return 'bg-green-100 text-green-800';
      case 'examination':
        return 'bg-purple-100 text-purple-800';
      case 'procedure':
        return 'bg-red-100 text-red-800';
      case 'therapy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'nursing':
        return 'Soins infirmiers';
      case 'injection':
        return 'Injection';
      case 'examination':
        return 'Examen';
      case 'procedure':
        return 'Procédure';
      case 'therapy':
        return 'Thérapie';
      default:
        return 'Autre';
    }
  };

  const totalActiveCares = filteredCares.filter(care => care.isActive).length;
  const averagePrice = filteredCares.length > 0 
    ? filteredCares.reduce((sum, care) => sum + care.unitPrice, 0) / filteredCares.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Soins et Actes Médicaux</h1>
        {canManageCares && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Soin</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Soins Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{totalActiveCares}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des Soins</p>
              <p className="text-2xl font-bold text-gray-900">{filteredCares.length}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prix Moyen</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrencyWithSettings(averagePrice, systemSettings)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Euro className="w-6 h-6 text-yellow-600" />
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
            placeholder="Rechercher un soin ou acte médical..."
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
          <option value="nursing">Soins infirmiers</option>
          <option value="injection">Injections</option>
          <option value="examination">Examens</option>
          <option value="procedure">Procédures</option>
          <option value="therapy">Thérapies</option>
          <option value="other">Autres</option>
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

      {/* Medical Care List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Soins et Actes Médicaux ({filteredCares.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCares.map((care) => (
            <div key={care.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <span>{care.name}</span>
                        {!care.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Inactif
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">{care.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(care.category)}`}>
                        {getCategoryText(care.category)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Euro className="w-4 h-4" />
                      <span className="font-medium">{formatCurrencyWithSettings(care.unitPrice, systemSettings)}</span>
                    </div>
                    {care.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{care.duration} min</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{care.requiresDoctor ? 'Médecin requis' : 'Infirmier autorisé'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {canManageCares && (
                    <button
                      onClick={() => setEditingCare(care)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Care Form Modal */}
      {(showForm || editingCare) && canManageCares && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MedicalCareForm
              care={editingCare}
              onSubmit={editingCare ? handleUpdateCare : handleAddCare}
              onCancel={() => {
                setShowForm(false);
                setEditingCare(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}