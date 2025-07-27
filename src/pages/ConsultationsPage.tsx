import React, { useState } from 'react';
import ConsultationList from '../components/consultations/ConsultationList';
import ConsultationForm from '../components/consultations/ConsultationForm';
import ConsultationDetail from '../components/consultations/ConsultationDetail';
import { Consultation } from '../lib/supabase';

export default function ConsultationsPage() {
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateConsultation = () => {
    setSelectedConsultation(null);
    setShowForm(true);
  };

  const handleEditConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowForm(true);
  };

  const handleViewConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedConsultation(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedConsultation(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseForm();
  };

  return (
    <>
      <ConsultationList
        key={refreshTrigger}
        onCreateConsultation={handleCreateConsultation}
        onEditConsultation={handleEditConsultation}
        onViewConsultation={handleViewConsultation}
      />
      
      {showForm && (
        <ConsultationForm
          consultation={selectedConsultation}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
      
      {showDetail && selectedConsultation && (
        <ConsultationDetail
          consultation={selectedConsultation}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}