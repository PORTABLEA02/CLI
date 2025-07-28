import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Activity, Stethoscope, CreditCard, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
      { path: '/dashboard', label: 'Tableau de bord', shortLabel: 'Dashboard', icon: Activity },
    ];

    switch (profile?.role) {
      case 'admin':
        return [
          ...baseItems,
          // Administration
          { 
            type: 'group',
            label: 'Administration',
            items: [
              { path: '/users', label: 'Gestion Utilisateurs', shortLabel: 'Utilisateurs', icon: User },
              { path: '/system-settings', label: 'Configuration', shortLabel: 'Config', icon: User },
            ]
          },
          // Patients et consultations
          { 
            type: 'group',
            label: 'Patients et consultations',
            items: [
              { path: '/patients', label: 'Patients', shortLabel: 'Patients', icon: User },
              { path: '/consultations', label: 'Consultations', shortLabel: 'Consultations', icon: Stethoscope },
            ]
          },
          // Gestion des produits
          { 
            type: 'group',
            label: 'Gestion des produits',
            items: [
              { path: '/products', label: 'Produits Médicaux', shortLabel: 'Produits', icon: Activity },
              { path: '/stock', label: 'Gestion Stock', shortLabel: 'Stock', icon: Activity },
            ]
          },
          { path: '/invoices', label: 'Factures', shortLabel: 'Factures', icon: CreditCard },
        ];
      case 'doctor':
        return [
          ...baseItems,
          // Patients et consultations
          { 
            type: 'group',
            label: 'Patients et consultations',
            items: [
              { path: '/patients', label: 'Patients', shortLabel: 'Patients', icon: User },
              { path: '/consultations', label: 'Consultations', shortLabel: 'Consultations', icon: Stethoscope },
            ]
          },
        ];
      case 'cashier':
        return [
          ...baseItems,
          // Patients et consultations
          { 
            type: 'group',
            label: 'Patients et consultations',
            items: [
              { path: '/patients', label: 'Patients', shortLabel: 'Patients', icon: User },
              { path: '/consultations-readonly', label: 'Consultations (Lecture)', shortLabel: 'Consult. (L)', icon: Stethoscope },
            ]
          },
          // Gestion des produits
          { 
            type: 'group',
            label: 'Gestion des produits',
            items: [
              { path: '/products', label: 'Produits Médicaux', shortLabel: 'Produits', icon: Activity },
              { path: '/stock', label: 'Stock', shortLabel: 'Stock', icon: Activity },
            ]
          },
          { path: '/invoices', label: 'Factures', shortLabel: 'Factures', icon: CreditCard },
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
              <h1 className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">CliniqueManager</h1>
              <h1 className="ml-2 text-lg font-bold text-gray-900 sm:hidden">CM</h1>
            </div>
            
            <div className="hidden lg:ml-8 lg:flex lg:space-x-2 xl:space-x-6">
              {getNavigationItems().map((item, index) => {
                if (item.type === 'group') {
                  return (
                    <div key={index} className="relative group">
                      <button className="inline-flex items-center px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
                        <span className="hidden xl:inline">{item.label}</span>
                        <span className="xl:hidden text-xs">{item.label.split(' ')[0]}</span>
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-1">
                          {item.items.map((subItem) => {
                            const Icon = subItem.icon;
                            const isActive = location.pathname === subItem.path;
                            return (
                              <button
                                key={subItem.path}
                                onClick={() => navigate(subItem.path)}
                                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className="w-4 h-4 mr-3" />
                                {subItem.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`inline-flex items-center px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-3 h-3 lg:w-4 lg:h-4 mr-1 xl:mr-2" />
                      <span className="hidden xl:inline">{item.label}</span>
                      <span className="xl:hidden text-xs">{item.shortLabel || item.label.split(' ')[0]}</span>
                    </button>
                  );
                }
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Menu mobile toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-32 lg:max-w-none">{profile?.full_name}</p>
                <p className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor()}`}>
                  {getRoleDisplayName()}
                </p>
              </div>
              <div className="text-gray-400 md:hidden">
                {getRoleIcon()}
              </div>
              <div className="text-gray-400 hidden md:block">
                {getRoleIcon()}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="hidden sm:inline-flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
              <span className="hidden md:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-3 pt-3 pb-4 space-y-2 border-t border-gray-200 bg-white">
              {/* Profil utilisateur mobile */}
              <div className="flex items-center px-3 py-3 mb-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getRoleIcon()}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor()}`}>
                    {getRoleDisplayName()}
                  </p>
                </div>
              </div>

              {/* Navigation mobile */}
              {getNavigationItems().map((item, index) => {
                if (item.type === 'group') {
                  return (
                    <div key={index} className="space-y-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon;
                        const isActive = location.pathname === subItem.path;
                        return (
                          <button
                            key={subItem.path}
                            onClick={() => {
                              navigate(subItem.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                } else {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                      {item.label}
                    </button>
                  );
                }
              })}

              {/* Déconnexion mobile */}
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors mt-4 border-t border-gray-200 pt-4"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}