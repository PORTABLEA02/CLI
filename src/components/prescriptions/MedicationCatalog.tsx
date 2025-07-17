import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { MedicationForm } from './MedicationForm';
import { Plus, Search, Edit, Eye, Filter } from 'lucide-react';
import { Medication } from '../../types';

export function MedicationCatalog() {
  const { medications, addMedication, updateMedication, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterForm, setFilterForm] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || medication.category === filterCategory;
    const matchesForm = filterForm === 'all' || medication.form === filterForm;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && medication.isActive) ||
                         (filterStatus === 'inactive' && !medication.isActive);
    
    return matchesSearch && matchesCategory && matchesForm && matchesStatus;
  });

  const handleAddMedication = (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMedication(medicationData);
    setShowForm(false);
  };

  const handleUpdateMedication = (medicationData: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMedication) {
      updateMedication(editingMedication.id, medicationData);
      setEditingMedication(null);
    }
  };

  // Contrôle d'accès : seuls les admins peuvent ajouter/modifier des médicaments
  const canManageMedications = currentUser?.role === 'admin';
  const getFormText = (form: string) => {
    switch (form) {
      case 'tablet': return 'Comprimé';
      case 'syrup': return 'Sirop';
      case 'injection': return 'Injection';
      case 'capsule': return 'Gélule';
      case 'cream': return 'Crème';
      case 'drops': return 'Gouttes';
      case 'inhaler': return 'Inhalateur';
      case 'patch': return 'Patch';
      default: return form;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'antibiotic': return 'Antibiotique';
      case 'analgesic': return 'Antalgique';
      case 'antiviral': return 'Antiviral';
      case 'cardiovascular': return 'Cardiovasculaire';
      case 'respiratory': return 'Respiratoire';
      case 'digestive': return 'Digestif';
      case 'neurological': return 'Neurologique';
      default: return 'Autre';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'antibiotic': return 'bg-red-100 text-red-800';
      case 'analgesic': return 'bg-blue-100 text-blue-800';
      case 'antiviral': return 'bg-green-100 text-green-800';
      case 'cardiovascular': return 'bg-purple-100 text-purple-800';
      case 'respiratory': return 'bg-yellow-100 text-yellow-800';
      case 'digestive': return 'bg-indigo-100 text-indigo-800';
      case 'neurological': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMedications = filteredMedications.length;
  const activeMedications = filteredMedications.filter(m => m.isActive).length;
  const averagePrice = filteredMedications.length > 0 
    ? filteredMedications.reduce((sum, med) => sum + med.unitPrice, 0) / filteredMedications.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue des Médicaments</h1>
        {canManageMedications && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Médicament</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Médicaments</p>
              <p className="text-2xl font-bold text-gray-900">{totalMedications}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Médicaments Actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeMedications}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Filter className="w-6 h-6 text-green-600" />
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
            placeholder="Rechercher un médicament..."
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
          <option value="antibiotic">Antibiotiques</option>
          <option value="analgesic">Antalgiques</option>
          <option value="antiviral">Antiviraux</option>
          <option value="cardiovascular">Cardiovasculaires</option>
          <option value="respiratory">Respiratoires</option>
          <option value="digestive">Digestifs</option>
          <option value="neurological">Neurologiques</option>
          <option value="other">Autres</option>
        </select>
        <select
          value={filterForm}
          onChange={(e) => setFilterForm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Toutes les formes</option>
          <option value="tablet">Comprimés</option>
          <option value="syrup">Sirops</option>
          <option value="injection">Injections</option>
          <option value="capsule">Gélules</option>
          <option value="cream">Crèmes</option>
          <option value="drops">Gouttes</option>
          <option value="inhaler">Inhalateurs</option>
          <option value="patch">Patchs</option>
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

      {/* Medications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Médicaments ({filteredMedications.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médicament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forme & Dosage
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
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.map((medication) => (
                <tr key={medication.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {medication.name}
                      </div>
                      {medication.genericName && (
                        <div className="text-sm text-gray-500">
                          ({medication.genericName})
                        </div>
                      )}
                      {medication.manufacturer && (
                        <div className="text-xs text-gray-400">
                          {medication.manufacturer}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getFormText(medication.form)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {medication.strength}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(medication.category)}`}>
                      {getCategoryText(medication.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrencyWithSettings(medication.unitPrice, systemSettings)}
                    </div>
                    {medication.requiresPrescription && (
                      <div className="text-xs text-red-600">
                        Sur ordonnance
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {medication.stockQuantity !== undefined ? medication.stockQuantity : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      medication.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {medication.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canManageMedications && (
                      <button
                        onClick={() => setEditingMedication(medication)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medication Form Modal */}
      {(showForm || editingMedication) && canManageMedications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <MedicationForm
              medication={editingMedication}
              onSubmit={editingMedication ? handleUpdateMedication : handleAddMedication}
              onCancel={() => {
                setShowForm(false);
                setEditingMedication(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}