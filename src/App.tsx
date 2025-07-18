import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientList } from './components/patients/PatientList';
import { ConsultationList } from './components/consultations/ConsultationList';
import { InvoiceList } from './components/invoices/InvoiceList';
import { MedicalCareList } from './components/medical-care/MedicalCareList';
import { BillingDashboard } from './components/billing/BillingDashboard';
import { PrescriptionList } from './components/prescriptions/PrescriptionList';
import { MedicationCatalog } from './components/prescriptions/MedicationCatalog';
import { ExamCatalog } from './components/prescriptions/ExamCatalog';
import { MedicalSupplyCatalog } from './components/supplies/MedicalSupplyCatalog';
import { DoctorReports } from './components/reports/DoctorReports';
import { ProfileManagement } from './components/admin/ProfileManagement';
import { SystemSettings } from './components/admin/SystemSettings';

function AppContent() {
  const { currentProfile, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirection basée sur le rôle lors de la connexion
  React.useEffect(() => {
    if (currentProfile) {
      // Rediriger vers la page par défaut selon le rôle
      switch (currentProfile.role) {
        case 'admin':
          setActiveTab('dashboard');
          break;
        case 'doctor':
          setActiveTab('consultations');
          break;
        case 'cashier':
          setActiveTab('invoices');
          break;
        default:
          setActiveTab('dashboard');
      }
    }
  }, [currentProfile]);

  // Afficher le loader pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Afficher le formulaire de connexion si pas d'utilisateur connecté
  if (!currentProfile) {
    return <LoginForm />;
  }

  // Fonction pour vérifier l'accès à un onglet
  const hasAccessToTab = (tab: string) => {
    const role = currentProfile.role;
    
    switch (tab) {
      case 'dashboard':
        return true;
      case 'patients':
        return role === 'admin' || role === 'doctor' || role === 'cashier';
      case 'consultations':
        return role === 'admin' || role === 'doctor' || role === 'cashier';
      case 'treatments':
        return role === 'admin' || role === 'doctor';
      case 'prescriptions':
        return role === 'admin' || role === 'doctor' || role === 'cashier';
      case 'medications':
        return true;
      case 'exams':
        return true;
      case 'supplies':
        return role === 'admin' || role === 'doctor' || role === 'cashier';
      case 'invoices':
        return role === 'admin' || role === 'cashier';
      case 'reports':
        return role === 'admin' || role === 'doctor';
      case 'profiles':
        return role === 'admin';
      case 'settings':
        return role === 'admin';
      default:
        return false;
    }
  };

  // Fonction pour gérer le changement d'onglet avec vérification d'accès
  const handleTabChange = (tab: string) => {
    if (hasAccessToTab(tab)) {
      setActiveTab(tab);
    } else {
      console.warn(`Accès refusé à l'onglet: ${tab} pour le rôle: ${currentProfile.role}`);
    }
  };

  const renderContent = () => {
    // Vérifier l'accès avant de rendre le contenu
    if (!hasAccessToTab(activeTab)) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas accès à cette section avec votre rôle actuel ({currentProfile.role}).
          </p>
          <button
            onClick={() => {
              switch (currentProfile.role) {
                case 'admin':
                  setActiveTab('dashboard');
                  break;
                case 'doctor':
                  setActiveTab('consultations');
                  break;
                case 'cashier':
                  setActiveTab('invoices');
                  break;
                default:
                  setActiveTab('dashboard');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientList />;
      case 'consultations':
        return <ConsultationList />;
      case 'invoices':
        return currentProfile.role === 'cashier' ? <BillingDashboard /> : <InvoiceList />;
      case 'treatments':
        return <MedicalCareList />;
      case 'prescriptions':
        return <PrescriptionList />;
      case 'medications':
        return <MedicationCatalog />;
      case 'exams':
        return <ExamCatalog />;
      case 'supplies':
        return <MedicalSupplyCatalog />;
      case 'reports':
        return <DoctorReports />;
      case 'profiles':
        return <ProfileManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
        />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 lg:ml-0 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;