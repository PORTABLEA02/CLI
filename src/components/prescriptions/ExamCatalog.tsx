import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { ExamForm } from './ExamForm';
import { Plus, Search, Edit, Eye, Clock } from 'lucide-react';
import { MedicalExam } from '../../types';

export function ExamCatalog() {
  const { medicalExams, addMedicalExam, updateMedicalExam, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<MedicalExam | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredExams = medicalExams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || exam.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && exam.isActive) ||
                         (filterStatus === 'inactive' && !exam.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleAddExam = (examData: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMedicalExam(examData);
    setShowForm(false);
  };

  const handleUpdateExam = (examData: Omit<MedicalExam, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExam) {
      updateMedicalExam(editingExam.id, examData);
      setEditingExam(null);
    }
  };

  // Contrôle d'accès : seuls les admins peuvent ajouter/modifier des examens
  const canManageExams = currentUser?.role === 'admin';
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'radiology': return 'Radiologie';
      case 'laboratory': return 'Laboratoire';
      case 'cardiology': return 'Cardiologie';
      case 'ultrasound': return 'Échographie';
      case 'endoscopy': return 'Endoscopie';
      default: return 'Autre';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'radiology': return 'bg-blue-100 text-blue-800';
      case 'laboratory': return 'bg-green-100 text-green-800';
      case 'cardiology': return 'bg-red-100 text-red-800';
      case 'ultrasound': return 'bg-purple-100 text-purple-800';
      case 'endoscopy': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExams = filteredExams.length;
  const activeExams = filteredExams.filter(e => e.isActive).length;
  const averagePrice = filteredExams.length > 0 
    ? filteredExams.reduce((sum, exam) => sum + exam.unitPrice, 0) / filteredExams.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue des Examens</h1>
        {canManageExams && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvel Examen</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Examens</p>
              <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Examens Actifs</p>
              <p className="text-2xl font-bold text-green-600">{activeExams}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Search className="w-6 h-6 text-green-600" />
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
            placeholder="Rechercher un examen..."
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
          <option value="radiology">Radiologie</option>
          <option value="laboratory">Laboratoire</option>
          <option value="cardiology">Cardiologie</option>
          <option value="ultrasound">Échographie</option>
          <option value="endoscopy">Endoscopie</option>
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

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            Examens ({filteredExams.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Search className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                        <span>{exam.name}</span>
                        {!exam.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Inactif
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-500">{exam.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exam.category)}`}>
                        {getCategoryText(exam.category)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">{formatCurrencyWithSettings(exam.unitPrice, systemSettings)}</span>
                    </div>
                    {exam.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{exam.duration} min</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <span>{exam.requiresAppointment ? 'RDV requis' : 'Sans RDV'}</span>
                    </div>
                  </div>

                  {exam.preparationInstructions && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Préparation:</span>
                      <p className="text-sm text-gray-600 mt-1">{exam.preparationInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {canManageExams && (
                    <button
                      onClick={() => setEditingExam(exam)}
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

      {/* Exam Form Modal */}
      {(showForm || editingExam) && canManageExams && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ExamForm
              exam={editingExam}
              onSubmit={editingExam ? handleUpdateExam : handleAddExam}
              onCancel={() => {
                setShowForm(false);
                setEditingExam(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}