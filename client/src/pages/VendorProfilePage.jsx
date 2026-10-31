import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import { getImageUrl } from '../utils/imageUrl';
import { getStallCoverImage } from '../utils/stallImages';
import {
  Store,
  Upload,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

export default function VendorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [formData, setFormData] = useState({
    stallName: '',
    stallType: 'fixed',
    tagline: '',
    description: '',
    categories: [],
    coverPhoto: '',
    contactPublic: {
      phone: '',
      whatsapp: '',
    },
    address: {
      street: '',
      area: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      landmark: '',
      postalCode: '',
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch categories
      const catRes = await vendorService.getCategories();
      if (catRes?.data?.categories) {
        setCategoriesList(catRes.data.categories);
      }

      // 2. Fetch existing profile
      try {
        const profileRes = await vendorService.getMyProfile();
        if (profileRes?.data?.profile) {
          const p = profileRes.data.profile;
          setIsEditing(true);
          setFormData({
            stallName: p.stallName || '',
            stallType: p.stallType || 'fixed',
            tagline: p.tagline || '',
            description: p.description || '',
            categories: p.categories?.map((c) => (typeof c === 'object' ? c.id || c._id : c)) || [],
            coverPhoto: p.coverPhoto || '',
            contactPublic: {
              phone: p.contactPublic?.phone || '',
              whatsapp: p.contactPublic?.whatsapp || '',
            },
            address: {
              street: p.address?.street || '',
              area: p.address?.area || '',
              city: p.address?.city || 'Ahmedabad',
              state: p.address?.state || 'Gujarat',
              landmark: p.address?.landmark || '',
              postalCode: p.address?.postalCode || '',
            },
          });
        }
      } catch (profileErr) {
        if (profileErr.status !== 404) {
          setErrorMsg(profileErr.message);
        }
        setIsEditing(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize vendor profile form.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contact_')) {
      const field = name.replace('contact_', '');
      setFormData((prev) => ({
        ...prev,
        contactPublic: { ...prev.contactPublic, [field]: value },
      }));
    } else if (name.startsWith('address_')) {
      const field = name.replace('address_', '');
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const toggleCategory = (catId) => {
    setFormData((prev) => {
      const current = prev.categories || [];
      const updated = current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId];
      return { ...prev, categories: updated };
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    // Immediate local object URL preview
    const localUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, coverPhoto: localUrl }));
    setImageError(false);

    setUploadingImage(true);
    try {
      const res = await vendorService.uploadStallImage(file);
      if (res?.data?.url) {
        setFormData((prev) => ({ ...prev, coverPhoto: res.data.url }));
        setImageError(false);
      }
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!formData.stallName || formData.stallName.trim().length < 2) {
      setErrorMsg('Stall name must be at least 2 characters long.');
      setSubmitting(false);
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setErrorMsg('Please provide a descriptive explanation of your business (at least 10 characters).');
      setSubmitting(false);
      return;
    }

    if (!formData.contactPublic.phone) {
      setErrorMsg('Public contact phone is required.');
      setSubmitting(false);
      return;
    }

    if (!formData.address.street || !formData.address.area) {
      setErrorMsg('Street and Area address details are required.');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing) {
        await vendorService.updateProfile(formData);
        setSuccessMsg('Stall profile updated successfully!');
      } else {
        await vendorService.createProfile(formData);
        setIsEditing(true);
        setSuccessMsg('Stall profile created and submitted for administrator review!');
      }
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Failed to save profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2 text-[#647067]">
        <Loader2 className="h-8 w-8 animate-spin text-[#16803D]" />
        <p className="text-xs">Loading stall profile configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/vendor/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#647067] hover:text-[#17231D] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Vendor Dashboard</span>
        </Link>
        <span className="text-xs font-semibold text-[#647067]">
          {isEditing ? 'Editing Stall Profile' : 'New Stall Profile Setup'}
        </span>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card space-y-2">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7] flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-[#17231D]">
              {isEditing ? 'Edit Stall Business Profile' : 'Create Your Stall Profile'}
            </h1>
            <p className="text-xs text-[#647067]">
              Public profile information displayed to customers browsing Hezal Market.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-[#EDF7EF] border border-[#D1EAD7] text-xs text-[#14532D] flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-[#16803D] flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#17231D] uppercase tracking-wider pb-2 border-b border-[#E5EAE5]">
            1. Stall Identity & Category
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Stall / Business Name *
              </label>
              <input
                type="text"
                name="stallName"
                required
                value={formData.stallName}
                onChange={handleChange}
                placeholder="e.g. Ramesh Fresh Fruits & Juice"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Stall Mobility Type *
              </label>
              <select
                name="stallType"
                value={formData.stallType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              >
                <option value="fixed">Fixed Stall (Permanent kiosk, shop front, fixed booth)</option>
                <option value="mobile">Temporary / Mobile (Pushcart, van, seasonal spot)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Short Tagline / Specialty
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              placeholder="e.g. Cold pressed fresh seasonal juices and fruit bowls"
              maxLength={150}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1.5">
              Categories (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {categoriesList.map((cat) => {
                const isSelected = formData.categories.includes(cat.id || cat._id);
                return (
                  <button
                    key={cat.id || cat._id}
                    type="button"
                    onClick={() => toggleCategory(cat.id || cat._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border cursor-pointer ${
                      isSelected
                        ? 'bg-[#16803D] text-white border-[#16803D] shadow-xs'
                        : 'bg-[#FAFAF5] text-[#17231D] border-[#E5EAE5] hover:bg-[#EDF7EF]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17231D] mb-1">
              Business Bio / Description *
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you sell, how long you have operated, quality standards..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
            />
          </div>
        </div>

        {/* Section 2: Stall Media */}
        <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#17231D] uppercase tracking-wider pb-2 border-b border-[#E5EAE5]">
            2. Stall Cover Photograph
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-36 w-60 rounded-2xl border border-[#E5EAE5] bg-[#FAFAF5] flex items-center justify-center overflow-hidden flex-shrink-0 relative group shadow-card">
              {((!imageError && formData.coverPhoto) ? getImageUrl(formData.coverPhoto) : getStallCoverImage(formData)) ? (
                <>
                  <img
                    src={(!imageError && formData.coverPhoto) ? getImageUrl(formData.coverPhoto) : getStallCoverImage(formData)}
                    alt={formData.stallName || 'Stall preview'}
                    onError={() => setImageError(true)}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                    <span className="text-[11px] text-white font-semibold">
                      {formData.coverPhoto && !imageError ? 'Custom Photo' : 'Curated Gujarat Photo'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 text-[#647067] space-y-1.5">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[#EDF7EF] text-[#16803D] flex items-center justify-center">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs block font-medium">No cover photo</span>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white font-semibold cursor-pointer transition-colors shadow-xs active:scale-95">
                  <Upload className="h-4 w-4" />
                  <span>{uploadingImage ? 'Uploading...' : formData.coverPhoto ? 'Change Stall Photo' : 'Upload Stall Photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                {formData.coverPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverPhoto: '' }));
                      setImageError(false);
                    }}
                    className="px-3 py-2.5 rounded-xl border border-[#E5EAE5] text-[#647067] hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Remove Custom Photo
                  </button>
                )}
              </div>
              <p className="text-[#647067] text-[11px] leading-relaxed">
                Recommended: 16:9 ratio, clear daytime view of your stall front. Max size: 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Public Contact Details */}
        <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#17231D] uppercase tracking-wider pb-2 border-b border-[#E5EAE5]">
            3. Public Customer Inquiries
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Public Contact Phone *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
                <input
                  type="tel"
                  name="contact_phone"
                  required
                  value={formData.contactPublic.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                WhatsApp Inquiry Number (Optional)
              </label>
              <div className="relative">
                <MessageCircle className="h-4 w-4 text-[#647067] absolute left-3 top-3" />
                <input
                  type="tel"
                  name="contact_whatsapp"
                  value={formData.contactPublic.whatsapp}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Stall Operating Address */}
        <div className="bg-white rounded-2xl border border-[#E5EAE5] p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-[#17231D] uppercase tracking-wider pb-2 border-b border-[#E5EAE5] flex items-center justify-between">
            <span>4. Stall Address & Locality</span>
            <MapPin className="h-4 w-4 text-[#16803D]" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Street Address / Spot Description *
              </label>
              <input
                type="text"
                name="address_street"
                required
                value={formData.address.street}
                onChange={handleChange}
                placeholder="e.g. Stall 4, Opp. City Central Library, Ellisbridge"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Locality / Area Name *
              </label>
              <input
                type="text"
                name="address_area"
                required
                value={formData.address.area}
                onChange={handleChange}
                placeholder="e.g. Navrangpura / Law Garden"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Landmark Description
              </label>
              <input
                type="text"
                name="address_landmark"
                value={formData.address.landmark}
                onChange={handleChange}
                placeholder="e.g. Under the large Neem tree"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                City
              </label>
              <input
                type="text"
                name="address_city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="Ahmedabad"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17231D] mb-1">
                Postal Code (PIN)
              </label>
              <input
                type="text"
                name="address_postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                placeholder="380006"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16803D]/20 focus:border-[#16803D]"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to="/vendor/dashboard"
            className="px-4 py-2.5 rounded-xl border border-[#E5EAE5] text-[#17231D] hover:bg-[#FAFAF5] text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Profile Changes' : 'Create & Submit Profile'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
