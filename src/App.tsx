import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from "./components/patients/PatientList";
import PatientForm from "./components/patients/PatientForm";
import PatientDetail from "./components/Patients/PatientDetail";
import ConsultationList from "./components/consultations/ConsultationList";
import ProductList from "./components/products/ProductList";
import { Patient } from './lib/supabase';

function App() {
  const { user, profile, loading, initialized, isSessionValid } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  

  // Vérifier la validité de la session périodiquement
  useEffect(() => {

    // Logs de debug uniquement en mode développement
    if (import.meta.env.DEV) {
      console.log('📦 État de l\'application :', {
        user: user ? { id: user.id, email: user.email } : null,
        profile: profile ? { id: profile.id, role: profile.role, full_name: profile.full_name } : null,
        loading,
        initialized,
        currentPage,
        showPatientForm,
        editingPatient: editingPatient ? editingPatient.id : null,
        viewingPatient: viewingPatient ? viewingPatient.id : null
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
    role: profile.role,
    currentPage
  });

  const handlePatientFormClose = () => {
    setShowPatientForm(false);
    setEditingPatient(null);
  };

  const handlePatientFormSuccess = () => {
    console.log('✅ Succès du formulaire patient');
    
    // Fermer le formulaire
    handlePatientFormClose();
    
    // TODO: Implémenter un système de rafraîchissement plus élégant
    // Pour l'instant, on recharge la page si on est sur la page des patients
    if (currentPage === 'patients') {
      console.log('🔄 Rechargement de la page pour rafraîchir la liste des patients');
      window.location.reload();
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        // Accessible à tous les rôles authentifiés
        return (
          <PatientList
            onCreatePatient={() => setShowPatientForm(true)}
            onEditPatient={(patient) => {
              setEditingPatient(patient);
              setShowPatientForm(true);
            }}
            onViewPatient={(patient) => setViewingPatient(patient)}
          />
        );
      case 'users':
        // Accessible uniquement aux admins
        if (profile?.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette section</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestion des Utilisateurs</h2>
            <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      case 'consultations':
        // Accessible aux docteurs, admins et caissiers (lecture seule pour caissiers)
        if (!['admin', 'doctor', 'cashier'].includes(profile?.role || '')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette section</p>
            </div>
          );
        }
        return <ConsultationList />;
      case 'my-consultations':
        // Accessible uniquement aux docteurs
        if (profile?.role !== 'doctor') {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Cette section est réservée aux docteurs</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mes Consultations</h2>
            <p className="text-gray-600">Vos consultations personnelles et historique</p>
            <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      case 'products':
        // Accessible aux admins et caissiers
        if (!['admin', 'cashier'].includes(profile?.role || '')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les produits</p>
            </div>
          );
        }
        return <ProductList />;
      case 'stock':
        // Accessible aux admins et caissiers
        if (!['admin', 'cashier'].includes(profile?.role || '')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Vous n'avez pas les permissions pour gérer le stock</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestion du Stock</h2>
            <p className="text-gray-600">
              {profile?.role === 'admin' 
                ? 'Gérez les entrées/sorties et niveaux de stock' 
                : 'Consultez les stocks et effectuez les mouvements'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      case 'invoices':
        // Accessible aux admins et caissiers
        if (!['admin', 'cashier'].includes(profile?.role || '')) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Vous n'avez pas les permissions pour gérer les factures</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Facturation</h2>
            <p className="text-gray-600">
              {profile?.role === 'admin' 
                ? 'Vue d\'ensemble de toutes les factures' 
                : 'Créez et gérez les factures des consultations'
              }
            </p>
            <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      case 'direct-billing':
        // Accessible uniquement aux caissiers
        if (profile?.role !== 'cashier') {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Cette section est réservée aux agents de caisse</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Facturation Directe</h2>
            <p className="text-gray-600">Créez des factures sans consultation préalable</p>
            <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      case 'reports':
        // Accessible uniquement aux admins
        if (profile?.role !== 'admin') {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Accès Refusé</h2>
              <p className="text-gray-600">Cette section est réservée aux administrateurs</p>
            </div>
          );
        }
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rapports & Statistiques</h2>
            <p className="text-gray-600">Exportez les rapports financiers, de stock et de patients</p>
            <p className="text-sm text-gray-500 mt-2">Cette fonctionnalité sera bientôt disponible</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCurrentPage()}
      </main>

      {/* Modals */}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onClose={handlePatientFormClose}
          onSuccess={handlePatientFormSuccess}
        />
      )}

      {viewingPatient && (
        <PatientDetail
          patient={viewingPatient}
          onClose={() => setViewingPatient(null)}
        />
      )}
    </div>
  );
}

export default App;