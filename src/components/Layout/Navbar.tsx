import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Activity, Stethoscope, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      console.log('🚪 Demande de déconnexion depuis la navbar');
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion depuis la navbar:', error);
        // TODO: Afficher une notification d'erreur à l'utilisateur
      } else {
        console.log('✅ Déconnexion réussie depuis la navbar');
      }
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la déconnexion depuis la navbar:', error);
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'doctor':
        return <Stethoscope className="w-5 h-5" />;
      case 'cashier':
        return <CreditCard className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (profile?.role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'cashier':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = () => {
    switch (profile?.role) {
      case 'admin':
        return 'ADMINISTRATEUR';
      case 'doctor':
        return 'DOCTEUR';
      case 'cashier':
        return 'CAISSIER';
      default:
        return profile?.role?.toUpperCase() || 'UTILISATEUR';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Tableau de bord', icon: Activity },
    ];

    switch (profile?.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/users', label: 'Gestion Utilisateurs', icon: User },
          { path: '/patients', label: 'Patients', icon: User },
          { path: '/consultations', label: 'Consultations', icon: Stethoscope },
          { path: '/products', label: 'Produits Médicaux', icon: Activity },
          { path: '/stock', label: 'Gestion Stock', icon: Activity },
          { path: '/invoices', label: 'Factures', icon: CreditCard },
          { path: '/reports', label: 'Rapports', icon: Activity },
          { path: '/system-settings', label: 'Configuration', icon: User },
        ];
      case 'doctor':
        return [
          ...baseItems,
          { path: '/patients', label: 'Patients', icon: User },
          { path: '/consultations', label: 'Consultations', icon: Stethoscope },
          { path: '/my-consultations', label: 'Mes Consultations', icon: Stethoscope },
        ];
      case 'cashier':
        return [
          ...baseItems,
          { path: '/patients', label: 'Patients', icon: User },
          { path: '/consultations-readonly', label: 'Consultations (Lecture)', icon: Stethoscope },
          { path: '/invoices', label: 'Factures', icon: CreditCard },
          { path: '/products', label: 'Produits Médicaux', icon: Activity },
          { path: '/stock', label: 'Stock', icon: Activity },
          { path: '/direct-billing', label: 'Facturation Directe', icon: CreditCard },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">CliniqueManager</h1>
            </div>
            
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {getNavigationItems().map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor()}`}>
                  {getRoleDisplayName()}
                </p>
              </div>
              <div className="text-gray-400">
                {getRoleIcon()}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}