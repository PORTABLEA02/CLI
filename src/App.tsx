import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from "./components/patients/PatientList";
import PatientForm from "./components/patients/PatientForm";
import PatientDetail from "./components/Patients/PatientDetail";
import ConsultationList from "./components/consultations/ConsultationList";
import ProductList from "./components/products/ProductList";

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
  const { user, profile, loading, initialized, isSessionValid } = useAuth();

  // Vérifier la validité de la session périodiquement
  useEffect(() => {
    // Logs de debug uniquement en mode développement
    if (import.meta.env.DEV) {
      console.log('📦 État de l\'application :', {
        user: user ? { id: user.id, email: user.email } : null,
        profile: profile ? { id: profile.id, role: profile.role, full_name: profile.full_name } : null,
        loading,
        initialized
      });
    }

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

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!initialized ? 'Initialisation de l\'application...' : 'Chargement du profil utilisateur...'}
            {user && !profile && (
              <span className="block text-sm mt-2 text-blue-600">
                Récupération des informations utilisateur...
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('🔒 Utilisateur non authentifié, affichage du formulaire de connexion');
    return <LoginForm />;
  }

  console.log('✅ Utilisateur authentifié:', {
    email: user.email,
    role: profile.role
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          {/* Route par défaut - Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Routes des patients - accessibles à tous les rôles authentifiés */}
          <Route path="/patients" element={<PatientList />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id/edit" element={<PatientForm />} />
          <Route path="/patients/:id/view" element={<PatientDetail />} />
          
          {/* Routes des consultations - accessibles aux docteurs, admins et caissiers */}
          <Route 
            path="/consultations" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'cashier']}>
                <ConsultationList />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes des produits - accessibles aux admins et caissiers */}
          <Route 
            path="/products" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <ProductList />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes réservées aux admins */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ComingSoon 
                  title="Gestion des Utilisateurs" 
                  description="Cette fonctionnalité sera bientôt disponible" 
                />
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
                <ComingSoon 
                  title="Gestion du Stock" 
                  description={
                    profile?.role === 'admin' 
                      ? 'Gérez les entrées/sorties et niveaux de stock' 
                      : 'Consultez les stocks et effectuez les mouvements'
                  } 
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'cashier']}>
                <ComingSoon 
                  title="Facturation" 
                  description={
                    profile?.role === 'admin' 
                      ? 'Vue d\'ensemble de toutes les factures' 
                      : 'Créez et gérez les factures des consultations'
                  } 
                />
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
          
          {/* Route 404 - Page non trouvée */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;