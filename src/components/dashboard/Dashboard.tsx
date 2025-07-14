import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { DashboardCard } from './DashboardCard';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  Pill
} from 'lucide-react';

export function Dashboard() {
  const { currentUser, stats, consultations, patients, invoices, prescriptions, medicalSupplies } = useApp();

  const getRecentConsultations = () => {
    let filteredConsultations = consultations;
    
    // Filter by role
    if (currentUser?.role === 'doctor') {
      filteredConsultations = consultations.filter(c => c.doctorId === currentUser.id);
    }
    
    return filteredConsultations
      .filter(c => c.status === 'scheduled' || c.status === 'in-progress')
      .slice(0, 5);
  };

  const getRecentPatients = () => {
    return patients
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getRoleSpecificStats = () => {
    switch (currentUser?.role) {
      case 'admin':
        return [
          {
            title: "Total Patients",
            value: stats.totalPatients,
            icon: Users,
            color: "blue" as const,
            trend: { value: 12, isPositive: true }
          },
          {
            title: "Consultations Aujourd'hui",
            value: stats.todayConsultations,
            icon: Calendar,
            color: "green" as const,
            trend: { value: 8, isPositive: true }
          },
          {
            title: "Factures En Attente",
            value: stats.pendingInvoices,
            icon: CreditCard,
            color: "yellow" as const
          },
          {
            title: "Revenus Mensuels",
            value: `${stats.monthlyRevenue.toLocaleString()} €`,
            icon: TrendingUp,
            color: "green" as const,
            trend: { value: 15, isPositive: true }
          },
          {
            title: "Consultations Terminées",
            value: stats.completedConsultations,
            icon: Activity,
            color: "indigo" as const
          },
          {
            title: "Stock Faible",
            value: medicalSupplies.filter(s => s.stockQuantity <= s.minStockLevel).length,
            icon: AlertTriangle,
            color: "red" as const
          }
        ];

      case 'doctor':
        const myConsultations = consultations.filter(c => c.doctorId === currentUser.id);
        const myPrescriptions = prescriptions.filter(p => p.doctorId === currentUser.id);
        const todayConsultations = myConsultations.filter(c => 
          new Date(c.date).toDateString() === new Date().toDateString()
        );
        const completedConsultations = myConsultations.filter(c => c.status === 'completed');
        const activePrescriptions = myPrescriptions.filter(p => p.status === 'active');

        return [
          {
            title: "Mes Consultations Aujourd'hui",
            value: todayConsultations.length,
            icon: Calendar,
            color: "blue" as const
          },
          {
            title: "Consultations Terminées",
            value: completedConsultations.length,
            icon: CheckCircle,
            color: "green" as const
          },
          {
            title: "Prescriptions Actives",
            value: activePrescriptions.length,
            icon: FileText,
            color: "purple" as const
          },
          {
            title: "Mes Patients",
            value: [...new Set(myConsultations.map(c => c.patientId))].length,
            icon: Users,
            color: "indigo" as const
          }
        ];

      case 'cashier':
        const todayInvoices = invoices.filter(inv => 
          new Date(inv.createdAt).toDateString() === new Date().toDateString()
        );
        const todayRevenue = todayInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.total, 0);
        const pendingAmount = invoices
          .filter(inv => inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.total, 0);

        return [
          {
            title: "Factures Aujourd'hui",
            value: todayInvoices.length,
            icon: FileText,
            color: "blue" as const
          },
          {
            title: "Revenus Aujourd'hui",
            value: `${todayRevenue.toLocaleString()} €`,
            icon: DollarSign,
            color: "green" as const
          },
          {
            title: "Montant En Attente",
            value: `${pendingAmount.toLocaleString()} €`,
            icon: Clock,
            color: "yellow" as const
          },
          {
            title: "Factures En Attente",
            value: stats.pendingInvoices,
            icon: CreditCard,
            color: "red" as const
          }
        ];

      default:
        return [];
    }
  };

  const roleStats = getRoleSpecificStats();

  const getDashboardTitle = () => {
    switch (currentUser?.role) {
      case 'admin':
        return 'Tableau de Bord - Administration';
      case 'doctor':
        return 'Tableau de Bord - Espace Médecin';
      case 'cashier':
        return 'Tableau de Bord - Espace Caissier';
      default:
        return 'Tableau de Bord';
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Bonjour';
    
    if (hour < 12) greeting = 'Bonjour';
    else if (hour < 18) greeting = 'Bon après-midi';
    else greeting = 'Bonsoir';

    return `${greeting}, ${currentUser?.name}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getDashboardTitle()}
          </h1>
          <p className="text-gray-600 mt-1">{getWelcomeMessage()}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleStats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Consultations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentUser?.role === 'doctor' ? 'Mes Prochaines Consultations' : 'Consultations Récentes'}
          </h3>
          <div className="space-y-3">
            {getRecentConsultations().map((consultation) => {
              const patient = patients.find(p => p.id === consultation.patientId);
              return (
                <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {patient?.firstName} {patient?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(consultation.date).toLocaleDateString('fr-FR')} à {consultation.time}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {consultation.symptoms.substring(0, 50)}...
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    consultation.status === 'scheduled' 
                      ? 'bg-blue-100 text-blue-800'
                      : consultation.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {consultation.status === 'scheduled' ? 'Planifiée' : 
                     consultation.status === 'in-progress' ? 'En cours' : 'Terminée'}
                  </span>
                </div>
              );
            })}
            {getRecentConsultations().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune consultation récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients or Role-specific content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {currentUser?.role === 'cashier' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Factures Récentes</h3>
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => {
                  const patient = patients.find(p => p.id === invoice.patientId);
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          #{invoice.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(invoice.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.total.toLocaleString()} €
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status === 'pending' ? 'En attente' :
                           invoice.status === 'paid' ? 'Payée' : 'En retard'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nouveaux Patients</h3>
              <div className="space-y-3">
                {getRecentPatients().map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{patient.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(patient.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role-specific quick actions */}
      {currentUser?.role === 'admin' && medicalSupplies.filter(s => s.stockQuantity <= s.minStockLevel).length > 0 && (
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
                  {medicalSupplies.filter(s => s.stockQuantity <= s.minStockLevel).length} produit(s) 
                  nécessitent un réapprovisionnement urgent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}