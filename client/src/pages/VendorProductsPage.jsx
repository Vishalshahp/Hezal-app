import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import vendorService from '../services/vendorService';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';

export default function VendorProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    image: '',
    isAvailable: true,
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getMyProducts(),
        vendorService.getCategories(),
      ]);

      if (prodRes?.data?.products) {
        setProducts(prodRes.data.products);
      }
      if (catRes?.data?.categories) {
        setCategories(catRes.data.categories);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load product catalogue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?.id || categories[0]?._id || '',
      price: '',
      image: '',
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name || '',
      description: prod.description || '',
      categoryId: prod.categoryId?.id || prod.categoryId?._id || prod.categoryId || '',
      price: prod.price !== null && prod.price !== undefined ? prod.price : '',
      image: prod.image || '',
      isAvailable: prod.isAvailable !== undefined ? prod.isAvailable : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await productService.toggleProductAvailability(id, !currentStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isAvailable: !currentStatus } : p))
      );
    } catch (err) {
      alert(err.message || 'Failed to update product availability.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your catalogue?`)) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccessMsg(`"${name}" removed from catalogue.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await productService.uploadProductImage(file);
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
      }
    } catch (err) {
      alert(err.message || 'Failed to upload product image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitModal = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (!formData.name || formData.name.trim().length < 2) {
      alert('Product name must be at least 2 characters long.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId || null,
      price: formData.price !== '' ? parseFloat(formData.price) : null,
      image: formData.image,
      isAvailable: formData.isAvailable,
    };

    try {
      if (editingProduct) {
        const res = await productService.updateProduct(editingProduct.id, payload);
        const updated = res.data?.product;
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        setSuccessMsg('Product updated successfully!');
      } else {
        const res = await productService.createProduct(payload);
        const created = res.data?.product;
        setProducts((prev) => [created, ...prev]);
        setSuccessMsg('Product added to catalogue successfully!');
      }
      closeModal();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert(err.data?.message || err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/vendor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vendor Dashboard</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              Manage Product Catalogue
            </h1>
            <p className="text-xs text-slate-500">
              Publish products and prices without requiring online checkout.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          <p className="text-xs">Loading product catalogue...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 font-display">No Products Listed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your stall catalogue is currently empty. Add your snacks, juices, produce, or services so nearby customers can discover what you sell.
          </p>
          <div className="pt-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="h-40 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-300 text-center">
                      <ImageIcon className="h-10 w-10 mx-auto" />
                      <span className="text-[11px] block text-slate-400">No image</span>
                    </div>
                  )}
                  {/* Availability Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    {prod.isAvailable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500 text-white shadow-sm">
                        In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-white shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{prod.name}</h3>
                    <span className="font-bold text-sm text-slate-900 font-mono whitespace-nowrap">
                      {prod.price !== null && prod.price !== undefined ? `₹${prod.price}` : 'On Request'}
                    </span>
                  </div>

                  {prod.categoryId && (
                    <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {typeof prod.categoryId === 'object' ? prod.categoryId.name : 'Categorized'}
                    </span>
                  )}

                  {prod.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(prod.id, prod.isAvailable)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${
                    prod.isAvailable
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {prod.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(prod)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                    title="Edit Product"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {editingProduct ? 'Edit Product Item' : 'Add New Product to Stall'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Cold Pressed Mosambi Juice"
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price in ₹ (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 40 (or leave blank)"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <span className="text-[10px] text-slate-400">Leave blank if sold by weight / on-request.</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Portion size, ingredients, options..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Photo
                </label>
                <div className="flex items-center space-x-3">
                  <div className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Availability checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isAvailable" className="font-semibold text-slate-700 cursor-pointer">
                  Available in stock now
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center space-x-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
