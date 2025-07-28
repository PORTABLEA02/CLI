import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PatientsPage from "./pages/PatientsPage";
import ConsultationsPage from "./pages/ConsultationsPage";
import UsersPage from "./pages/UsersPage";
import ProductsPage from "./pages/ProductsPage";
import InvoicesPage from "./pages/InvoicesPage";
import StockPage from "./pages/StockPage";
import SystemSettingsPage from "./pages/SystemSettingsPage";

// Composant pour protéger les routes selon les rôles
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { profile } = useAuth();
  
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
        <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette section</p>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Composant pour les pages non implémentées
function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
    </div>
  );
}

function App() {
  const { user, profile, loading, initialized, isSessionValid, isVisible, refreshSession } = useAuth();

  // Vérifier la validité de la session périodiquement
  useEffect(() => {
    if (user && initialized) {
      const checkSession = () => {
        if (!isSessionValid()) {
          console.warn('⚠️ Session invalide détectée, redirection vers la connexion');
          // La déconnexion sera gérée automatiquement par useAuth
        }
      };

      // Vérifier toutes les 5 minutes
      const interval = setInterval(checkSession, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, initialized, isSessionValid]);

  // Gérer le retour sur l'onglet
  useEffect(() => {
    if (isVisible && user && initialized) {
      console.log('👁️ Application redevenue visible, vérification de l\'état...');
      
      // Vérifier si la session est toujours valide
      if (!isSessionValid()) {
        console.warn('⚠️ Session expirée détectée lors du retour sur l\'onglet');
        // Tenter un rafraîchissement de la session
        refreshSession().then((success) => {
          if (!success) {
            console.error('❌ Impossible de rafraîchir la session, déconnexion nécessaire');
          }
        });
      }
    }
  }, [isVisible, user, initialized, isSessionValid, refreshSession]);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* Route par défaut - Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Routes des patients - accessibles à tous les rôles authentifiés */}
          <Route path="/patients/*" element={<PatientsPage />} />
          
          {/* Routes des consultations - accessibles aux docteurs et admins */}
          <Route 
            path="/consultations" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <ConsultationsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes des produits - accessibles aux admins et caissiers */}
          <Route 
            path="/products" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <ProductsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes réservées aux admins */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ComingSoon 
                  title="Rapports & Statistiques" 
                  description="Exportez les rapports financiers, de stock et de patients" 
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/system-settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemSettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes réservées aux docteurs */}
          <Route 
            path="/my-consultations" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <ComingSoon 
                  title="Mes Consultations" 
                  description="Vos consultations personnelles et historique" 
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes pour les caissiers et admins */}
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <StockPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <InvoicesPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Route réservée aux caissiers */}
          <Route 
            path="/direct-billing" 
            element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <ComingSoon 
                  title="Facturation Directe" 
                  description="Créez des factures sans consultation préalable" 
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Route pour les caissiers - Consultations en lecture seule */}
          <Route 
            path="/consultations-readonly" 
            element={
              <ProtectedRoute allowedRoles={['cashier']}>
                <ConsultationsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Route 404 - Page non trouvée */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;