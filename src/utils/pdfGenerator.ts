import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, InvoiceItem } from '../lib/supabase';

export const generateInvoicePDF = (invoice: Invoice, items: InvoiceItem[]) => {
  const doc = new jsPDF();
  
  // Configuration des couleurs
  const primaryColor = [59, 130, 246]; // Blue-600
  const textColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100
  
  // En-tête de la clinique
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('CliniqueManager', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text('Système de gestion de clinique médicale', 20, 40);
  
  // Ligne de séparation
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Titre de la facture
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(`FACTURE ${invoice.invoice_number}`, 20, 60);
  
  // Informations de la facture
  const invoiceInfo = [
    ['Date d\'émission:', new Date(invoice.issue_date).toLocaleDateString('fr-FR')],
    ['Date d\'échéance:', invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('fr-FR') : 'N/A'],
    ['Statut:', getStatusText(invoice.status)],
  ];
  
  let yPosition = 75;
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  invoiceInfo.forEach(([label, value]) => {
    doc.text(label, 20, yPosition);
    doc.text(value, 70, yPosition);
    yPosition += 8;
  });
  
  // Informations du patient
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('FACTURÉ À:', 120, 75);
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  yPosition = 85;
  
  const patientInfo = [
    `${invoice.patient?.first_name} ${invoice.patient?.last_name}`,
    invoice.patient?.phone || '',
    invoice.patient?.email || '',
  ].filter(Boolean);
  
  patientInfo.forEach(info => {
    doc.text(info, 120, yPosition);
    yPosition += 8;
  });
  
  // Consultation associée (si applicable)
  if (invoice.consultation) {
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('CONSULTATION ASSOCIÉE:', 20, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    yPosition += 10;
    doc.text(`Diagnostic: ${invoice.consultation.diagnosis}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Date: ${new Date(invoice.consultation.consultation_date).toLocaleDateString('fr-FR')}`, 20, yPosition);
  }
  
  // Tableau des éléments
  const tableData = items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unit_price.toFixed(2)}€`,
    `${item.total_price.toFixed(2)}€`
  ]);
  
  autoTable(doc, {
    startY: yPosition + 20,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    foot: [['', '', 'TOTAL:', `${invoice.total_amount.toFixed(2)}€`]],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor
    },
    footStyles: {
      fillColor: lightGray,
      textColor: textColor,
      fontSize: 10,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });
  
  // Notes (si présentes)
  if (invoice.notes) {
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('NOTES:', 20, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, 20, finalY + 10);
  }
  
  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Merci de votre confiance - CliniqueManager', 20, pageHeight - 20);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, pageHeight - 10);
  
  return doc;
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Payée';
    case 'draft':
      return 'Brouillon';
    case 'cancelled':
      return 'Annulée';
    default:
      return status;
  }
};

export const downloadInvoicePDF = (invoice: Invoice, items: InvoiceItem[]) => {
  const doc = generateInvoicePDF(invoice, items);
  doc.save(`Facture_${invoice.invoice_number}.pdf`);
};

export const previewInvoicePDF = (invoice: Invoice, items: InvoiceItem[]) => {
  const doc = generateInvoicePDF(invoice, items);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};