import React, { useState, useEffect } from 'react';
import { X, Stethoscope, User, Calendar, Euro, Package, FileText, Phone, Mail } from 'lucide-react';
import { supabase, Consultation } from '../../lib/supabase';
import { useCurrency } from '../../hooks/useSystemSettings';

interface ConsultationDetailProps {
  consultation: Consultation;
  onClose: () => void;
}

interface ConsultationProduct {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    name: string;
    unit: string;
  };
}

export default function ConsultationDetail({ consultation, onClose }: ConsultationDetailProps) {
  const currencySymbol = useCurrency();
  const [products, setProducts] = useState<ConsultationProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultationProducts();
  }, [consultation.id]);

  const fetchConsultationProducts = async () => {
    try {
      console.log('Récupération des produits de la consultation:', consultation.id);
      const { data, error } = await supabase
        .from('consultation_products')
        .select(`
          *,
          product:products(name, unit)
        `)
        .eq('consultation_id', consultation.id);

      if (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        throw error;
      }

      console.log('Produits de consultation récupérés:', data?.length || 0);
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des produits de consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getTotalProductsCost = () => {
    return products.reduce((sum, product) => sum + (product.quantity * product.unit_price), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-600" />
            Détails de la Consultation
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations patient */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Patient
              </h4>
              <div className="space-y-2">
                <p className="font-medium text-lg">
                  {consultation.patient?.first_name} {consultation.patient?.last_name}
                </p>
                <div className="text-sm text-gray-600">
                  <p>{consultation.patient?.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                  {consultation.patient?.birth_date && (
                    <p>{calculateAge(consultation.patient.birth_date)} ans</p>
                  )}
                </div>
                <div className="space-y-1 mt-3">
                  {consultation.patient?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.patient.phone}</span>
                    </div>
                  )}
                  {consultation.patient?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{consultation.patient.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations consultation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Consultation
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(consultation.consultation_date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Heure:</span>
                  <span className="font-medium">
                    {new Date(consultation.consultation_date).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Docteur:</span>
                  <span className="font-medium">Dr. {consultation.doctor?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tarif:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <Euro className="w-4 h-4 mr-1" />
                    {consultation.consultation_fee} {currencySymbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    consultation.is_invoiced 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {consultation.is_invoiced ? 'Facturée' : 'Non facturée'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Diagnostic
            </h4>
            <p className="text-gray-800">{consultation.diagnosis}</p>
          </div>

          {/* Traitement */}
          {consultation.treatment && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Traitement prescrit
              </h4>
              <p className="text-gray-800">{consultation.treatment}</p>
            </div>
          )}

          {/* Produits utilisés */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                Produits utilisés ({products.length})
              </h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix unitaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.product?.name || 'Produit inconnu'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.quantity} {product.product?.unit || 'unité(s)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <Euro className="w-4 h-4 mr-1 text-green-600" />
                            {product.unit_price.toFixed(2)} {currencySymbol}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-bold text-green-600">
                            <Euro className="w-4 h-4 mr-1" />
                            {(product.quantity * product.unit_price).toFixed(2)} {currencySymbol}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Total produits:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-bold text-green-600">
                          <Euro className="w-4 h-4 mr-1" />
                          {getTotalProductsCost().toFixed(2)} {currencySymbol}
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {consultation.notes && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Notes additionnelles
              </h4>
              <p className="text-gray-800">{consultation.notes}</p>
            </div>
          )}

          {/* Antécédents médicaux du patient */}
          {(consultation.patient?.medical_history || consultation.patient?.allergies) && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Informations médicales importantes
              </h4>
              {consultation.patient?.medical_history && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700">Antécédents médicaux:</p>
                  <p className="text-sm text-gray-800">{consultation.patient.medical_history}</p>
                </div>
              )}
              {consultation.patient?.allergies && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Allergies:</p>
                  <p className="text-sm text-red-700 font-medium">{consultation.patient.allergies}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}