import React, { useState, useEffect } from 'react';
import { X, Save, Search, User, Calendar, Euro, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { supabase, Patient, Product, Consultation } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface ConsultationFormProps {
  consultation?: Consultation | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ConsultationProduct {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;
}

export default function ConsultationForm({ consultation, onClose, onSuccess }: ConsultationFormProps) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    consultation_fee: 50, // Tarif par défaut
  });
  const [products, setProducts] = useState<ConsultationProduct[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (consultation) {
      setFormData({
        patient_id: consultation.patient_id,
        diagnosis: consultation.diagnosis,
        treatment: consultation.treatment || '',
        notes: consultation.notes || '',
        consultation_fee: consultation.consultation_fee,
      });
      
      // Récupérer les produits de la consultation
      fetchConsultationProducts();
      
      // Définir le nom du patient pour l'affichage
      if (consultation.patient) {
        setSearchPatient(`${consultation.patient.first_name} ${consultation.patient.last_name}`);
      }
    }
  }, [consultation]);

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
      setAvailableProducts(productsData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const fetchConsultationProducts = async () => {
    if (!consultation?.id) return;

    try {
      const { data, error } = await supabase
        .from('consultation_products')
        .select(`
          *,
          product:products(*)
        `)
        .eq('consultation_id', consultation.id);

      if (error) throw error;

      const formattedProducts: ConsultationProduct[] = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        product: item.product,
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Erreur lors du chargement des produits de consultation:', error);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patient_id: patient.id }));
    setShowPatientSearch(false);
    setSearchPatient(`${patient.first_name} ${patient.last_name}`);
  };

  const addProduct = () => {
    const newProduct: ConsultationProduct = {
      product_id: '',
      quantity: 1,
      unit_price: 0,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ConsultationProduct, value: any) => {
    setProducts(prev => {
      const newProducts = [...prev];
      const product = { ...newProducts[index] };
      
      if (field === 'product_id' && value) {
        const selectedProduct = availableProducts.find(p => p.id === value);
        if (selectedProduct) {
          product.product = selectedProduct;
          product.unit_price = selectedProduct.unit_price;
        }
      } else if (field === 'quantity' || field === 'unit_price') {
        product[field] = parseFloat(value) || 0;
      } else {
        product[field] = value;
      }
      
      newProducts[index] = product;
      return newProducts;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.patient_id) {
        throw new Error('Veuillez sélectionner un patient');
      }

      if (!formData.diagnosis.trim()) {
        throw new Error('Le diagnostic est obligatoire');
      }

      const consultationData = {
        ...formData,
        doctor_id: profile?.id,
        consultation_date: new Date().toISOString(),
      };

      let consultationId: string;

      if (consultation) {
        // Mise à jour
        const { error: updateError } = await supabase
          .from('consultations')
          .update(consultationData)
          .eq('id', consultation.id);

        if (updateError) throw updateError;

        // Supprimer les anciens produits
        await supabase
          .from('consultation_products')
          .delete()
          .eq('consultation_id', consultation.id);

        consultationId = consultation.id;
      } else {
        // Création
        const { data: newConsultation, error: insertError } = await supabase
          .from('consultations')
          .insert([consultationData])
          .select()
          .single();

        if (insertError) throw insertError;
        consultationId = newConsultation.id;
      }

      // Insérer les produits de la consultation
      if (products.length > 0) {
        const consultationProducts = products
          .filter(product => product.product_id && product.quantity > 0)
          .map(product => ({
            consultation_id: consultationId,
            product_id: product.product_id,
            quantity: product.quantity,
            unit_price: product.unit_price,
          }));

        if (consultationProducts.length > 0) {
          const { error: productsError } = await supabase
            .from('consultation_products')
            .insert(consultationProducts);

          if (productsError) throw productsError;

          // Mettre à jour le stock des produits
          for (const product of consultationProducts) {
            const { error: stockError } = await supabase.rpc('update_product_stock', {
              product_id: product.product_id,
              quantity_used: product.quantity,
              movement_type: 'out',
              reason: 'Consultation',
              reference_id: consultationId,
              user_id: profile?.id
            });

            if (stockError) {
              console.warn('Erreur lors de la mise à jour du stock:', stockError);
            }
          }
        }
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde de la consultation:', error);
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
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-600" />
            {consultation ? 'Modifier la Consultation' : 'Nouvelle Consultation'}
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
                        <div className="text-sm text-gray-500">
                          {patient.phone && `${patient.phone} • `}
                          Né(e) le {new Date(patient.birth_date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Diagnostic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnostic *
            </label>
            <textarea
              rows={3}
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez le diagnostic..."
              required
            />
          </div>

          {/* Traitement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Traitement prescrit
            </label>
            <textarea
              rows={3}
              value={formData.treatment}
              onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez le traitement prescrit..."
            />
          </div>

          {/* Tarif de consultation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarif de consultation
            </label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.consultation_fee}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_fee: parseFloat(e.target.value) || 0 }))}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Produits utilisés */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Produits utilisés (optionnel)</h4>
              <button
                type="button"
                onClick={addProduct}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {products.map((product, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Produit
                    </label>
                    <select
                      value={product.product_id}
                      onChange={(e) => updateProduct(index, 'product_id', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sélectionner un produit</option>
                      {availableProducts.map((availableProduct) => (
                        <option key={availableProduct.id} value={availableProduct.id}>
                          {availableProduct.name} - {availableProduct.unit_price}€/{availableProduct.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.unit_price}
                      onChange={(e) => updateProduct(index, 'unit_price', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes additionnelles
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Notes complémentaires..."
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