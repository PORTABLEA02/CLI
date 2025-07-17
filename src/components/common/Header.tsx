import React from 'react';
import { User, Bell, Settings, LogOut, Menu, Shield, UserCheck, Receipt } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useCommonTranslation } from '../../hooks/useTranslation';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { currentProfile, logout } = useApp();
  const { t } = useCommonTranslation();

  const getRoleInfo = () => {
    switch (currentProfile?.role) {
      case 'admin':
        return {
          title: t('roles.admin'),
          subtitle: 'Gestion complète du système',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          icon: Shield
        };
      case 'doctor':
        return {
          title: t('roles.doctor'),
          subtitle: 'Consultations & Prescriptions',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: UserCheck
        };
      case 'cashier':
        return {
          title: t('roles.cashier'),
          subtitle: 'Facturation & Paiements',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Receipt
        };
      default:
        return {
          title: 'Profil',
          subtitle: 'ClinicPro',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: User
        };
    }
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t('app.name')}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{t('app.description')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-10 h-10 ${roleInfo.bgColor} rounded-full`}>
              <RoleIcon className={`h-5 w-5 ${roleInfo.color}`} />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-900">{currentProfile?.name}</div>
                <span className={`px-2 py-1 text-xs font-medium ${roleInfo.color} ${roleInfo.bgColor} rounded-full`}>
                  {roleInfo.title}
                </span>
              </div>
              <div className="text-xs text-gray-500">{roleInfo.subtitle}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}