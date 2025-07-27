import React, { useState } from 'react';
import ProductList from '../components/products/ProductList';
import ProductForm from '../components/products/ProductForm';
import { Product } from '../lib/supabase';

export default function ProductsPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    handleCloseForm();
  };

  return (
    <>
      <ProductList
        key={refreshTrigger}
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
      />
      
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}