import React, { useState } from 'react';
import { Package, History, BarChart3 } from 'lucide-react';
import StockOverview from './StockOverview';
import StockMovementList from './StockMovementList';

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'movements'>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const tabs = [
    {
      id: 'overview',
      name: 'Aperçu du Stock',
      icon: Package,
      description: 'Vue d\'ensemble des niveaux de stock'
    },
    {
      id: 'movements',
      name: 'Historique des Mouvements',
      icon: History,
      description: 'Historique complet des entrées et sorties'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
            Gestion du Stock
          </h2>
          <p className="text-gray-600 mt-1">
            Gérez les entrées, sorties et niveaux de stock de vos produits
          </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'movements')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div>{tab.name}</div>
                    <div className="text-xs text-gray-500 font-normal">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <StockOverview onRefresh={handleRefresh} />
          )}
          
          {activeTab === 'movements' && (
            <StockMovementList refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  );
}