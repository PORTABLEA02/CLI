import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Search, User, Stethoscope } from 'lucide-react';
import { supabase, Invoice, Patient, Consultation, Product, InvoiceItem } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../hooks/useSystemSettings';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface InvoiceItemForm {
  id?: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export default function InvoiceForm({ invoice, onClose, onSuccess }: InvoiceFormProps) {
  const { profile } = useAuth();
  const currencySymbol = useCurrency();
  const [formData, setFormData] = useState({
    patient_id: '',
    consultation_id: '',
    total_amount: 0,
    status: 'draft' as 'draft' | 'paid' | 'cancelled',
    due_date: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItemForm[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [showConsultationSearch, setShowConsultationSearch] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (invoice) {
      setFormData({
        patient_id: invoice.patient_id,
        consultation_id: invoice.consultation_id || '',
        total_amount: invoice.total_amount,
        status: invoice.status,
        due_date: invoice.due_date ? invoice.due_date.split('T')[0] : '',
        notes: invoice.notes || '',
      });
      fetchInvoiceItems();
    }
  }, [invoice]);

  useEffect(() => {
    calculateTotal();
  }, [items]);

  const fetchInitialData = async () => {
    try {
      // Récupérer les patients
      const { data: patientsData } = await supabase
        .from('patients')
        .select('*')
        .order('first_name', { ascending: true });

      // Récupérer les produits actifs
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      setPatients(patientsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const fetchInvoiceItems = async () => {
    if (!invoice?.id) return;

    try {
      const { data, error } = await supabase
        .from('invoice_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('invoice_id', invoice.id);

      if (error) throw error;

      const formattedItems: InvoiceItemForm[] = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        product: item.product,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Erreur lors du chargement des éléments de facture:', error);
    }
  };

  const fetchConsultationsForPatient = async (patientId: string) => {
    try {
      const { data } = await supabase
        .from('consultations')
        .select(`
          *,
          doctor:profiles(full_name)
        `)
        .eq('patient_id', patientId)
        .eq('is_invoiced', false)
        .order('consultation_date', { ascending: false });

      setConsultations(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patient_id: patient.id, consultation_id: '' }));
    setShowPatientSearch(false);
    setSearchPatient(`${patient.first_name} ${patient.last_name}`);
    fetchConsultationsForPatient(patient.id);
  };

  const handleConsultationSelect = (consultationId: string) => {
    const consultation = consultations.find(c => c.id === consultationId);
    if (consultation) {
      setFormData(prev => ({ ...prev, consultation_id: consultationId }));
      
      // Ajouter automatiquement la consultation comme élément de facture
      const consultationItem: InvoiceItemForm = {
        product_id: '',
        description: `Consultation - ${consultation.diagnosis}`,
        quantity: 1,
        unit_price: consultation.consultation_fee,
        total_price: consultation.consultation_fee,
      };
      
      setItems(prev => [consultationItem, ...prev]);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItemForm = {
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      const item = { ...newItems[index] };
      
      if (field === 'product_id' && value) {
        const product = products.find(p => p.id === value);
        if (product) {
          item.product = product;
          item.description = product.name;
          item.unit_price = product.unit_price;
          item.total_price = item.quantity * product.unit_price;
        }
      } else if (field === 'quantity' || field === 'unit_price') {
        item[field] = parseFloat(value) || 0;
        item.total_price = item.quantity * item.unit_price;
      } else {
        item[field] = value;
      }
      
      newItems[index] = item;
      return newItems;
    });
  };

  const calculateTotal = () => {
    const total = items.reduce((sum, item) => sum + item.total_price, 0);
    setFormData(prev => ({ ...prev, total_amount: total }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.patient_id) {
        throw new Error('Veuillez sélectionner un patient');
      }

      if (items.length === 0) {
        throw new Error('Veuillez ajouter au moins un élément à la facture');
      }

      const invoiceData = {
        ...formData,
        cashier_id: profile?.id,
        issue_date: new Date().toISOString(),
        due_date: formData.due_date || null,
      };

      let invoiceId: string;

      if (invoice) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);

        if (updateError) throw updateError;

        // Supprimer les anciens éléments
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoice.id);

        invoiceId = invoice.id;
      } else {
        // Création
        const { data: newInvoice, error: insertError } = await supabase
          .from('invoices')
          .insert([invoiceData])
          .select()
          .single();

        if (insertError) throw insertError;
        invoiceId = newInvoice.id;
      }

      // Insérer les nouveaux éléments
      const invoiceItems = items.map(item => ({
        invoice_id: invoiceId,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      // Marquer la consultation comme facturée si applicable
      if (formData.consultation_id) {
        await supabase
          .from('consultations')
          .update({ is_invoiced: true })
          .eq('id', formData.consultation_id);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la facture:', error);
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {invoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Sélection du patient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchPatient}
                  onChange={(e) => {
                    setSearchPatient(e.target.value);
                    setShowPatientSearch(true);
                  }}
                  onFocus={() => setShowPatientSearch(true)}
                  placeholder="Rechercher un patient..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                
                {showPatientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handlePatientSelect(patient)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center"
                      >
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {patient.first_name} {patient.last_name}
                          </div>
                          {patient.phone && (
                            <div className="text-sm text-gray-500">{patient.phone}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sélection de la consultation */}
            {formData.patient_id && consultations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation (optionnel)
                </label>
                <select
                  value={formData.consultation_id}
                  onChange={(e) => handleConsultationSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une consultation</option>
                  {consultations.map((consultation) => (
                    <option key={consultation.id} value={consultation.id}>
                      {new Date(consultation.consultation_date).toLocaleDateString('fr-FR')} - {consultation.diagnosis} ({consultation.consultation_fee} {currencySymbol})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Brouillon</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Éléments de la facture */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Éléments de la facture</h4>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Produit
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Produit personnalisé</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.unit_price} {currencySymbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="text-xs font-medium text-gray-700 mb-1">Total</div>
                    <div className="text-sm font-bold text-green-600">
                      {item.total_price.toFixed(2)} {currencySymbol}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total de la facture:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.total_amount.toFixed(2)} {currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notes additionnelles..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}