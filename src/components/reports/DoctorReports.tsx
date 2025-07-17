import React, { useState, useMemo } from 'react';
import { useApp } from '../../contexts/AppContext';
import { formatCurrencyWithSettings } from '../../utils/formatters';
import { DashboardCard } from '../dashboard/DashboardCard';
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity, 
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Filter,
  Download,
  Eye
} from 'lucide-react';

export function DoctorReports() {
  const { 
    currentUser, 
    consultations, 
    patients, 
    prescriptions, 
    systemSettings 
  } = useApp();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Filter data for current doctor
  const myConsultations = useMemo(() => {
    return consultations.filter(c => c.doctorId === currentUser?.id);
  }, [consultations, currentUser?.id]);

  const myPrescriptions = useMemo(() => {
    return prescriptions.filter(p => p.doctorId === currentUser?.id);
  }, [prescriptions, currentUser?.id]);

  // Calculate date ranges
  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(selectedYear, 0, 1);
        now.setFullYear(selectedYear, 11, 31);
        break;
    }
    
    return { startDate, endDate: now };
  };

  const { startDate, endDate } = getDateRange();

  // Filter consultations by period
  const periodConsultations = useMemo(() => {
    return myConsultations.filter(consultation => {
      const consultationDate = new Date(consultation.date);
      return consultationDate >= startDate && consultationDate <= endDate;
    });
  }, [myConsultations, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalConsultations = periodConsultations.length;
    const completedConsultations = periodConsultations.filter(c => c.status === 'completed').length;
    const cancelledConsultations = periodConsultations.filter(c => c.status === 'cancelled').length;
    const scheduledConsultations = periodConsultations.filter(c => c.status === 'scheduled').length;
    
    const uniquePatients = new Set(periodConsultations.map(c => c.patientId)).size;
    
    const totalDuration = periodConsultations.reduce((sum, c) => sum + (c.duration || 0), 0);
    const averageDuration = totalConsultations > 0 ? totalDuration / totalConsultations : 0;
    
    const activePrescriptions = myPrescriptions.filter(p => p.status === 'active').length;
    const totalPrescriptions = myPrescriptions.filter(p => {
      const prescriptionDate = new Date(p.createdAt);
      return prescriptionDate >= startDate && prescriptionDate <= endDate;
    }).length;

    // Calculate consultation types distribution
    const consultationTypes = periodConsultations.reduce((acc, consultation) => {
      acc[consultation.type] = (acc[consultation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly trends (for the year view)
    const monthlyData = [];
    if (selectedPeriod === 'year') {
      for (let month = 0; month < 12; month++) {
        const monthConsultations = myConsultations.filter(c => {
          const date = new Date(c.date);
          return date.getFullYear() === selectedYear && date.getMonth() === month;
        });
        monthlyData.push({
          month: new Date(selectedYear, month).toLocaleDateString('fr-FR', { month: 'short' }),
          consultations: monthConsultations.length,
          completed: monthConsultations.filter(c => c.status === 'completed').length
        });
      }
    }

    return {
      totalConsultations,
      completedConsultations,
      cancelledConsultations,
      scheduledConsultations,
      uniquePatients,
      averageDuration,
      activePrescriptions,
      totalPrescriptions,
      consultationTypes,
      monthlyData,
      completionRate: totalConsultations > 0 ? (completedConsultations / totalConsultations) * 100 : 0
    };
  }, [periodConsultations, myPrescriptions, startDate, endDate, selectedYear, selectedPeriod, myConsultations]);

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'week': return 'Cette semaine';
      case 'month': return 'Ce mois';
      case 'quarter': return 'Ce trimestre';
      case 'year': return `Année ${selectedYear}`;
      default: return '';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general': return 'Générale';
      case 'specialist': return 'Spécialiste';
      case 'emergency': return 'Urgence';
      case 'followup': return 'Suivi';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general': return 'bg-blue-500';
      case 'specialist': return 'bg-green-500';
      case 'emergency': return 'bg-red-500';
      case 'followup': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Rapports & Statistiques</h1>
          <p className="text-gray-600 mt-1">Analyse de votre activité médicale</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Période:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { value: 'week', label: 'Semaine' },
                { value: 'month', label: 'Mois' },
                { value: 'quarter', label: 'Trimestre' },
                { value: 'year', label: 'Année' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          
          {selectedPeriod === 'year' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Année:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="mt-2">
          <span className="text-lg font-semibold text-blue-600">{getPeriodText()}</span>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Consultations"
          value={stats.totalConsultations}
          icon={Calendar}
          color="blue"
        />
        <DashboardCard
          title="Consultations Terminées"
          value={stats.completedConsultations}
          icon={CheckCircle}
          color="green"
        />
        <DashboardCard
          title="Patients Uniques"
          value={stats.uniquePatients}
          icon={Users}
          color="purple"
        />
        <DashboardCard
          title="Prescriptions Actives"
          value={stats.activePrescriptions}
          icon={FileText}
          color="indigo"
        />
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Réalisation</p>
              <p className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Durée Moyenne</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(stats.averageDuration)} min</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prescriptions Créées</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPrescriptions}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultation Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Types de Consultations</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {Object.entries(stats.consultationTypes).map(([type, count]) => {
              const percentage = stats.totalConsultations > 0 ? (count / stats.totalConsultations) * 100 : 0;
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(type)}`} />
                    <span className="text-sm font-medium text-gray-700">{getTypeText(type)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{count}</span>
                    <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {Object.keys(stats.consultationTypes).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune donnée pour cette période</p>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Statut des Consultations</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Terminées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${stats.totalConsultations > 0 ? (stats.completedConsultations / stats.totalConsultations) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.completedConsultations}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Planifiées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stats.totalConsultations > 0 ? (stats.scheduledConsultations / stats.totalConsultations) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.scheduledConsultations}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Annulées</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${stats.totalConsultations > 0 ? (stats.cancelledConsultations / stats.totalConsultations) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.cancelledConsultations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend (for year view) */}
      {selectedPeriod === 'year' && stats.monthlyData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution Mensuelle - {selectedYear}</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-12 gap-2">
            {stats.monthlyData.map((month, index) => {
              const maxConsultations = Math.max(...stats.monthlyData.map(m => m.consultations));
              const height = maxConsultations > 0 ? (month.consultations / maxConsultations) * 100 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="w-full h-32 bg-gray-100 rounded flex items-end justify-center relative">
                    <div 
                      className="w-full bg-blue-600 rounded transition-all duration-300 flex items-end justify-center"
                      style={{ height: `${height}%` }}
                    >
                      {month.consultations > 0 && (
                        <span className="text-white text-xs font-medium mb-1">{month.consultations}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{month.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Résumé de la Période</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalConsultations}</div>
            <div className="text-sm text-blue-700">Consultations totales</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.uniquePatients}</div>
            <div className="text-sm text-green-700">Patients différents</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{Math.round(stats.averageDuration)}</div>
            <div className="text-sm text-purple-700">Minutes par consultation</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPrescriptions}</div>
            <div className="text-sm text-yellow-700">Prescriptions émises</div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informations sur les Rapports
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Ces statistiques sont calculées en temps réel à partir de vos consultations et prescriptions. 
                Utilisez les filtres de période pour analyser votre activité sur différentes échelles de temps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}