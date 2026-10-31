import React, { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  toggleAdminCategoryStatus,
  deleteAdminCategory,
} from '../services/adminService';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  ShoppingBag,
  Store,
  Tag,
  X,
  Layers,
} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'Store',
    displayOrder: 0,
    isActive: true,
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Delete confirmation
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminCategories();
      if (res.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'Store',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Store',
      displayOrder: cat.displayOrder ?? 0,
      isActive: Boolean(cat.isActive),
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      // only auto-update slug if user hasn't explicitly customized an existing category slug
      slug: !editingCategory ? generatedSlug : prev.slug,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError(null);

      if (editingCategory) {
        const catId = editingCategory.id || editingCategory._id;
        const res = await updateAdminCategory(catId, formData);
        if (res.success) {
          setSuccessMessage(`Category "${formData.name}" updated successfully.`);
          setIsModalOpen(false);
          await fetchCategories();
        }
      } else {
        const res = await createAdminCategory(formData);
        if (res.success) {
          setSuccessMessage(`Category "${formData.name}" created successfully.`);
          setIsModalOpen(false);
          await fetchCategories();
        }
      }
    } catch (err) {
      setModalError(err.message || 'Failed to save category');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const catId = cat.id || cat._id;
      const res = await toggleAdminCategoryStatus(catId);
      if (res.success) {
        setSuccessMessage(res.message);
        await fetchCategories();
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle category status');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      const catId = deletingCategory.id || deletingCategory._id;
      const res = await deleteAdminCategory(catId);
      if (res.success) {
        setSuccessMessage(`Category "${deletingCategory.name}" permanently deleted.`);
        setDeletingCategory(null);
        await fetchCategories();
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete category');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Category Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage discovery categories, reorder display priorities, and organize stall listings.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RotateCcw className="h-6 w-6 animate-spin text-primary-500" />
            <span>Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Tag className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No categories found</p>
            <p className="text-xs text-slate-400">Click &ldquo;Add New Category&rdquo; to create your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Icon & Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Display Order</th>
                  <th className="py-3 px-4">Usage Counts</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => {
                  const id = cat.id || cat._id;
                  const totalUsage = (cat.vendorCount || 0) + (cat.productCount || 0);

                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary-700 border border-primary-200 flex items-center justify-center font-bold text-xs">
                            <Tag className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                            <div className="text-[11px] text-slate-400">Icon: {cat.icon || 'Store'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {cat.slug}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-semibold">
                        {cat.displayOrder ?? 0}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2 text-[11px]">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            <Store className="h-3 w-3 text-slate-400" />
                            <span>{cat.vendorCount || 0} stalls</span>
                          </span>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            <ShoppingBag className="h-3 w-3 text-slate-400" />
                            <span>{cat.productCount || 0} products</span>
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {cat.isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setDeletingCategory(cat);
                            setDeleteError(null);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            totalUsage > 0
                              ? 'text-slate-300 hover:text-slate-400 bg-slate-50 cursor-pointer'
                              : 'text-red-600 hover:bg-red-50 bg-slate-100'
                          }`}
                          title={
                            totalUsage > 0
                              ? `In use by ${totalUsage} stalls/products. Deactivate instead of deleting.`
                              : 'Permanently Delete'
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center space-x-2">
                <Layers className="h-4 w-4 text-primary-600" />
                <span>{editingCategory ? 'Edit Category' : 'Create New Category'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Street Food, Pottery, Fresh Juices"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))
                  }
                  placeholder="e.g. street-food"
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Icon Identifier</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    placeholder="e.g. Store, Utensils"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        displayOrder: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="categoryIsActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300"
                />
                <label htmlFor="categoryIsActive" className="text-slate-800 font-medium">
                  Active (show in shopper discovery and search filters)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Category Deletion
              </h3>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                {deleteError}
              </div>
            )}

            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete category{' '}
              <strong className="text-slate-900">&ldquo;{deletingCategory.name}&rdquo;</strong>?
            </p>

            {((deletingCategory.vendorCount || 0) > 0 || (deletingCategory.productCount || 0) > 0) && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <strong>Safeguard Active:</strong> This category is linked to{' '}
                {deletingCategory.vendorCount || 0} vendor stall(s) and{' '}
                {deletingCategory.productCount || 0} product(s). The database will block deletion.
                Please deactivate the category instead to preserve referential integrity.
              </div>
            )}

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {deleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
