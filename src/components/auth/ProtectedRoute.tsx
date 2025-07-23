import React from 'react';
import { useApp } from '../../contexts/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { currentProfile } = useApp();

  if (!currentProfile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Non Autorisé</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
      </div>
    );
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(currentProfile.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Rôles requis: {requiredRoles.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}