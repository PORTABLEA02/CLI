import React, { useState, useEffect } from 'react';
import { Users, FileText, Package, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface DashboardStats {
  patientsCount: number;
  consultationsToday: number;
  invoicesThisMonth: number;
  lowStockItems: number;
  totalRevenue: number;
  recentConsultations: any[];
  lowStockProducts: any[];
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    patientsCount: 0,
    consultationsToday: 0,
    invoicesThisMonth: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    recentConsultations: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      // Compter les patients
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Consultations d'aujourd'hui
      const { count: consultationsToday } = await supabase
        .from('consultations')
        .select('*', { count: 'exact', head: true })
        .gte('consultation_date', today);

      // Factures de ce mois
      const { count: invoicesThisMonth } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDayOfMonth);

      // Revenus de ce mois
      const { data: revenueData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid')
        .gte('created_at', firstDayOfMonth);

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;

      // Stock faible
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('*')
        .lt('current_stock', 'min_stock_level')
        .eq('is_active', true);

      // Consultations récentes
      const { data: recentConsultations } = await supabase
        .from('consultations')
        .select(`
          *,
          patient:patients(first_name, last_name),
          doctor:profiles(full_name)
        `)
        .order('consultation_date', { ascending: false })
        .limit(5);

      setStats({
        patientsCount: patientsCount || 0,
        consultationsToday: consultationsToday || 0,
        invoicesThisMonth: invoicesThisMonth || 0,
        lowStockItems: lowStockProducts?.length || 0,
        totalRevenue,
        recentConsultations: recentConsultations || [],
        lowStockProducts: lowStockProducts || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.patientsCount,
      icon: Users,
      color: 'blue',
      visible: true,
    },
    {
      title: 'Consultations Aujourd\'hui',
      value: stats.consultationsToday,
      icon: Calendar,
      color: 'green',
      visible: ['doctor', 'admin', 'cashier'].includes(profile?.role || ''),
    },
    {
      title: 'Factures ce Mois',
      value: stats.invoicesThisMonth,
      icon: FileText,
      color: 'purple',
      visible: profile?.role === 'cashier' || profile?.role === 'admin',
    },
    {
      title: 'Revenus ce Mois',
      value: `${stats.totalRevenue.toFixed(2)}€`,
      icon: TrendingUp,
      color: 'yellow',
      visible: profile?.role === 'admin',
    },
    {
      title: 'Stock Faible',
      value: stats.lowStockItems,
      icon: AlertTriangle,
      color: 'red',
      visible: profile?.role === 'cashier' || profile?.role === 'admin',
    },
  ].filter(card => card.visible);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Tableau de Bord
        </h1>
        <p className="text-gray-600">
          Bienvenue, {profile?.full_name}
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const colorClasses = getColorClasses(card.color).split(' ');
          
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[2]}`}>
                  <Icon className={`w-6 h-6 ${colorClasses[1]}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultations récentes */}
        {(profile?.role === 'doctor' || profile?.role === 'admin') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Consultations Récentes
            </h3>
            <div className="space-y-3">
              {stats.recentConsultations.length > 0 ? (
                stats.recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {consultation.patient?.first_name} {consultation.patient?.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{consultation.diagnosis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {consultation.doctor?.full_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune consultation récente</p>
              )}
            </div>
          </div>
        )}

        {/* Stock faible */}
        {(profile?.role === 'cashier' || profile?.role === 'admin') && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Stock Faible
            </h3>
            <div className="space-y-3">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.type === 'medical' ? 'Produit médical' : 'Médicament'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {product.current_stock} {product.unit}
                      </p>
                      <p className="text-xs text-gray-600">
                        Min: {product.min_stock_level}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Tous les stocks sont suffisants</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}