import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PatientList from '../components/patients/PatientList';
import PatientForm from '../components/patients/PatientForm';
import PatientDetail from '../components/patients/PatientDetail';
import { Patient } from '../lib/supabase';

export default function PatientsPage() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setShowForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowForm(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPatient(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedPatient(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseForm();
  };

  return (
    <>
      <PatientList
        key={refreshTrigger}
        onCreatePatient={handleCreatePatient}
        onEditPatient={handleEditPatient}
        onViewPatient={handleViewPatient}
      />
      
      {showForm && (
        <PatientForm
          patient={selectedPatient}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
      
      {showDetail && selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}