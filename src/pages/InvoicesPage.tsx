import React, { useState } from 'react';
import InvoiceList from '../components/invoices/InvoiceList';
import InvoiceForm from '../components/invoices/InvoiceForm';
import InvoiceDetail from '../components/invoices/InvoiceDetail';
import { Invoice } from '../lib/supabase';

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetail(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedInvoice(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedInvoice(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseForm();
  };

  return (
    <>
      <InvoiceList
        key={refreshTrigger}
        onCreateInvoice={handleCreateInvoice}
        onEditInvoice={handleEditInvoice}
        onViewInvoice={handleViewInvoice}
      />
      
      {showForm && (
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
      
      {showDetail && selectedInvoice && (
        <InvoiceDetail
          invoice={selectedInvoice}
          onClose={handleCloseDetail}
          onEdit={handleEditInvoice}
        />
      )}
    </>
  );
}