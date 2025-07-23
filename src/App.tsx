import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function AppContent() {
  const { currentProfile, isLoading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentProfile) {
    return <LoginForm />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <div className="flex">
          <Sidebar
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
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/consultations" element={<ConsultationList />} />
                  <Route 
                    path="/invoices" 
                    element={
                      currentProfile.role === 'cashier' ? <BillingDashboard /> : 
                      currentProfile.role === 'admin' ? <InvoiceList /> : 
                      <ProtectedRoute requiredRoles={['admin', 'cashier']}>
                        <div className="p-8 text-center">
                          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accès Restreint</h2>
                          <p className="text-gray-600">Vous n'avez pas accès à cette section.</p>
                        </div>
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/treatments" element={<MedicalCareList />} />
                  <Route path="/prescriptions" element={<PrescriptionList />} />
                  <Route path="/medications" element={<MedicationCatalog />} />
                  <Route path="/exams" element={<ExamCatalog />} />
                  <Route path="/supplies" element={<MedicalSupplyCatalog />} />
                  <Route 
                    path="/profiles" 
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <ProfileManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute requiredRoles={['admin']}>
                        <SystemSettings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/reports" element={<DoctorReports />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </Router>
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