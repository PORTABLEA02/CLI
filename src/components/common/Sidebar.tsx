import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings, 
  Stethoscope,
  ClipboardList,
  TrendingUp,
  Pill,
  Search,
  Package,
  Shield,
  UserCheck,
  Activity,
  DollarSign,
  Receipt,
  BookOpen,
  Clipboard
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useCommonTranslation } from '../../hooks/useTranslation';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
}

export function Sidebar({ activeTab, onTabChange, isOpen }: SidebarProps) {
  const { currentProfile } = useApp();
  const { t } = useCommonTranslation();

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: t('navigation.dashboard'), icon: Home }
    ];

    const roleSpecificItems = {
      admin: [
        // Gestion des profils et patients
        { 
          id: 'section-profiles', 
          label: t('sections.profiles'), 
          isSection: true 
        },
        { id: 'patients', label: t('navigation.patients'), icon: Users },
        
        // Gestion médicale
        { 
          id: 'section-medical', 
          label: t('sections.medical'), 
          isSection: true 
        },
        { id: 'consultations', label: t('navigation.consultations'), icon: Calendar },
        { id: 'treatments', label: t('navigation.treatments'), icon: Stethoscope },
        { id: 'prescriptions', label: t('navigation.prescriptions'), icon: FileText },
        
        // Catalogues et inventaire
        { 
          id: 'section-catalog', 
          label: t('sections.catalog'), 
          isSection: true 
        },
        { id: 'medications', label: t('navigation.medications'), icon: Pill },
        { id: 'exams', label: t('navigation.exams'), icon: Search },
        { id: 'supplies', label: t('navigation.supplies'), icon: Package },
        
        // Finance et facturation
        { 
          id: 'section-finance', 
          label: t('sections.finance'), 
          isSection: true 
        },
        { id: 'invoices', label: t('navigation.invoices'), icon: CreditCard },
        { id: 'reports', label: t('navigation.reports'), icon: TrendingUp },
        
        // Administration
        { 
          id: 'section-admin', 
          label: t('sections.admin'), 
          isSection: true 
        },
        { id: 'profiles', label: t('navigation.profiles'), icon: Users },
        { id: 'settings', label: t('navigation.settings'), icon: Settings },
      ],
      
      doctor: [
        // Activité médicale principale
        { 
          id: 'section-medical', 
          label: 'ACTIVITÉ MÉDICALE', 
          isSection: true 
        },
        { id: 'patients', label: 'Mes Patients', icon: Users },
        { id: 'consultations', label: 'Mes Consultations', icon: Calendar },
        { id: 'treatments', label: 'Soins & Actes', icon: Stethoscope },
        
        // Prescriptions et ordonnances
        { 
          id: 'section-prescriptions', 
          label: 'PRESCRIPTIONS', 
          isSection: true 
        },
        { id: 'prescriptions', label: 'Mes Prescriptions', icon: FileText },
        { id: 'medications', label: 'Catalogue Médicaments', icon: Pill },
        { id: 'exams', label: 'Catalogue Examens', icon: Search },
        { id: 'supplies', label: 'Produits de Soins', icon: Package },
        
        // Suivi et rapports
        { 
          id: 'section-reports', 
          label: 'SUIVI & RAPPORTS', 
          isSection: true 
        },
        { id: 'reports', label: 'Mes Statistiques', icon: Activity },
      ],
      
      cashier: [
        // Facturation principale
        { 
          id: 'section-billing', 
          label: 'FACTURATION', 
          isSection: true 
        },
        { id: 'invoices', label: 'Module Facturation', icon: CreditCard },
        
        // Support aux consultations
        { 
          id: 'section-support', 
          label: 'SUPPORT MÉDICAL', 
          isSection: true 
        },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'consultations', label: 'Consultations', icon: Calendar },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        
        // Catalogues (lecture seule)
        { 
          id: 'section-catalog', 
          label: 'CATALOGUES', 
          isSection: true 
        },
        { id: 'medications', label: 'Médicaments', icon: Pill },
        { id: 'exams', label: 'Examens', icon: Search },
        { id: 'supplies', label: 'Produits de Soins', icon: Package },
      ]
    };

    const items = roleSpecificItems[currentProfile?.role as keyof typeof roleSpecificItems] || [];
    return [...baseItems, ...items];
  };

  const navigationItems = getNavigationItems();

  const getRoleTitle = () => {
    switch (currentProfile?.role) {
      case 'admin':
        return t('roles.adminSpace');
      case 'doctor':
        return t('roles.doctorSpace');
      case 'cashier':
        return t('roles.cashierSpace');
      default:
        return 'ClinicPro';
    }
  };

  const getRoleColor = () => {
    switch (currentProfile?.role) {
      case 'admin':
        return 'bg-purple-600';
      case 'doctor':
        return 'bg-green-600';
      case 'cashier':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getRoleIcon = () => {
    switch (currentProfile?.role) {
      case 'admin':
        return Shield;
      case 'doctor':
        return UserCheck;
      case 'cashier':
        return Receipt;
      default:
        return Home;
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Role Header */}
        <div className={`${getRoleColor()} px-4 py-6`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-lg">
              <RoleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{getRoleTitle()}</h2>
              <p className="text-white text-opacity-80 text-sm">{currentProfile?.name}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              // Section headers
              if (item.isSection) {
                return (
                  <div key={item.id} className="pt-4 pb-2">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </h3>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive
                      ? `${getRoleColor()} text-white shadow-md`
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0 transition-colors
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
                  `} />
                  {item.label}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full opacity-80" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span>{t('system.online')}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {t('app.version')}
          </div>
        </div>
      </div>
    </aside>
  );
}