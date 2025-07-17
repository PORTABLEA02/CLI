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
  const { currentProfile } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentProfile) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientList />;
      case 'consultations':
        return <ConsultationList />;
      case 'invoices':
        // Show billing dashboard for cashiers, regular invoice list for others
        return currentProfile.role === 'cashier' ? <BillingDashboard /> : 
               (currentProfile.role === 'admin' ? <InvoiceList /> : 
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
                  <p className="text-gray-600">Vous n'avez pas accès à cette section.</p>
                </div>);
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
      case 'profiles':
        return currentProfile.role === 'admin' ? <ProfileManagement /> : 
               <div className="p-8 text-center">
                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
                 <p className="text-gray-600">Seuls les administrateurs peuvent gérer les profils.</p>
               </div>;
      case 'settings':
        return currentProfile.role === 'admin' ? <SystemSettings /> : 
               <div className="p-8 text-center">
                 <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
                 <p className="text-gray-600">Seuls les administrateurs peuvent modifier les paramètres système.</p>
               </div>;
      case 'reports':
        return <DoctorReports />;
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
          onTabChange={setActiveTab}
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