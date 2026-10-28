import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminNav from '../components/AdminNav';
import {
  getAdminVendors,
  getAdminVendorDetails,
  updateAdminVendorStatus,
} from '../services/adminService';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Clock,
  Store,
  MapPin,
  ShoppingBag,
  History,
  X,
} from 'lucide-react';

export default function AdminVendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';
  const initialReviewId = searchParams.get('review') || null;

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Inspection modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [inspectionData, setInspectionData] = useState(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);

  // Moderation action modal state
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject' | 'request_corrections' | 'suspend' | 'restore'
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminVendors({
        status: currentStatus,
        q: searchQuery,
      });
      if (res.success) {
        setVendors(res.data.vendors || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [currentStatus, searchQuery]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Load inspection if requested via URL param
  useEffect(() => {
    if (initialReviewId) {
      openInspectionModal({ _id: initialReviewId });
    }
  }, [initialReviewId]);

  const handleStatusFilter = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    setSearchParams(params);
  };

  const openInspectionModal = async (vendor) => {
    const vendorId = vendor.id || vendor._id;
    setSelectedVendor(vendor);
    setInspectionLoading(true);
    setActionError(null);
    try {
      const res = await getAdminVendorDetails(vendorId);
      if (res.success) {
        setInspectionData(res.data);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to fetch vendor inspection details');
    } finally {
      setInspectionLoading(false);
    }
  };

  const closeInspectionModal = () => {
    setSelectedVendor(null);
    setInspectionData(null);
    setActionType(null);
    setActionReason('');
    setActionError(null);
    // remove review query param
    if (searchParams.get('review')) {
      const params = new URLSearchParams(searchParams);
      params.delete('review');
      setSearchParams(params);
    }
  };

  const handleExecuteAction = async () => {
    if (!actionType || !selectedVendor) return;

    // Reason validation
    if (
      ['reject', 'request_corrections', 'suspend'].includes(actionType) &&
      !actionReason.trim()
    ) {
      setActionError(`An explicit reason is required when executing "${actionType.replace('_', ' ')}".`);
      return;
    }

    try {
      setActionSubmitting(true);
      setActionError(null);

      const vendorId = selectedVendor.id || selectedVendor._id;
      const res = await updateAdminVendorStatus(vendorId, {
        action: actionType,
        reason: actionReason.trim(),
      });

      if (res.success) {
        // Refresh local list and inspection data
        await fetchVendors();
        if (selectedVendor) {
          await openInspectionModal(selectedVendor);
        }
        setActionType(null);
        setActionReason('');
      }
    } catch (err) {
      setActionError(err.message || 'Action failed to execute');
    } finally {
      setActionSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved & Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="h-3 w-3 mr-1" /> Pending Review
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <RotateCcw className="h-3 w-3 mr-1" /> Corrections Requested
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" /> Suspended
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 border border-slate-300">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AdminNav />

      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Vendor Approvals & Listing Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant stall credentials, verify self-reported locations, request changes, or suspend rogue stalls.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stall, phone, area..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
        {[
          { key: 'all', label: 'All Stalls' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'changes_requested', label: 'Corrections Needed' },
          { key: 'suspended', label: 'Suspended' },
          { key: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              currentStatus === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      )}

      {/* Vendor Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <RotateCcw className="h-6 w-6 animate-spin text-primary-500" />
            <span>Loading vendor applications...</span>
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Store className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No vendors found</p>
            <p className="text-xs text-slate-400">
              There are no vendor applications matching status &ldquo;{currentStatus}&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Stall Name & Type</th>
                  <th className="py-3 px-4">Location / Area</th>
                  <th className="py-3 px-4">Owner / Contact</th>
                  <th className="py-3 px-4">Approval Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => {
                  const id = vendor.id || vendor._id;
                  return (
                    <tr key={id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {vendor.stallName}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {vendor.stallType || 'permanent'}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate max-w-xs">
                            {vendor.tagline || 'No tagline provided'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center text-slate-800 font-medium">
                          <MapPin className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                          <span>{vendor.address?.area || '—'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-4">
                          {vendor.address?.city || 'Ahmedabad'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {vendor.vendorId?.name || '—'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {vendor.vendorId?.email || vendor.contactPublic?.phone || '—'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(vendor.approvalStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(vendor.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => openInspectionModal(vendor)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                        >
                          Inspect & Adjudicate
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

      {/* Vendor Inspection & Moderation Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-display">
                    {selectedVendor.stallName}
                  </h2>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {getStatusBadge(
                      inspectionData?.profile?.approvalStatus || selectedVendor.approvalStatus
                    )}
                    <span className="text-xs text-slate-500">
                      ID: {selectedVendor.id || selectedVendor._id}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={closeInspectionModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {inspectionLoading ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-2">
                  <RotateCcw className="h-6 w-6 animate-spin text-primary-500" />
                  <span>Loading full stall profile & catalog...</span>
                </div>
              ) : (
                <>
                  {actionError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                      {actionError}
                    </div>
                  )}

                  {/* General Stall Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <Store className="h-4 w-4 text-primary-600" />
                        <span>Stall Identity</span>
                      </h3>
                      <div>
                        <span className="text-slate-400">Tagline:</span>{' '}
                        <span className="text-slate-800 font-medium">
                          {inspectionData?.profile?.tagline || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Description:</span>{' '}
                        <p className="text-slate-700 mt-0.5 leading-relaxed">
                          {inspectionData?.profile?.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Stall Type:</span>{' '}
                        <span className="text-slate-800 font-semibold uppercase">
                          {inspectionData?.profile?.stallType || 'permanent'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span>Location & Contact</span>
                      </h3>
                      <div>
                        <span className="text-slate-400">Address:</span>{' '}
                        <span className="text-slate-800">
                          {inspectionData?.profile?.address?.street || ''},{' '}
                          {inspectionData?.profile?.address?.area || ''},{' '}
                          {inspectionData?.profile?.address?.city || 'Ahmedabad'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">GPS Coordinates:</span>{' '}
                        <span className="font-mono text-slate-800">
                          {inspectionData?.profile?.location?.coordinates
                            ? `[${inspectionData.profile.location.coordinates[0]}, ${inspectionData.profile.location.coordinates[1]}]`
                            : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Owner:</span>{' '}
                        <span className="text-slate-800 font-medium">
                          {inspectionData?.user?.name} ({inspectionData?.user?.email})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Public Phone:</span>{' '}
                        <span className="text-slate-800">
                          {inspectionData?.profile?.contactPublic?.phone || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection / Correction History Banner */}
                  {inspectionData?.profile?.rejectionReason && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                      <div className="font-bold flex items-center space-x-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-700" />
                        <span>Latest Moderation Note / Reason on Record:</span>
                      </div>
                      <p className="text-xs text-amber-800">
                        {inspectionData.profile.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Product Catalog Preview */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <ShoppingBag className="h-4 w-4 text-slate-700" />
                        <span>Listed Products ({inspectionData?.products?.length || 0})</span>
                      </span>
                    </h3>

                    {inspectionData?.products?.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">
                        Vendor has not listed any products yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {inspectionData?.products?.map((prod) => (
                          <div
                            key={prod._id || prod.id}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                          >
                            <div>
                              <div className="font-bold text-slate-800">{prod.name}</div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                {prod.description || 'No description'}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 text-xs">
                                ₹{prod.price}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {prod.isAvailable ? 'In stock' : 'Out of stock'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audit Trail for this Vendor */}
                  {inspectionData?.auditLogs?.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                        <History className="h-4 w-4 text-slate-700" />
                        <span>Moderation History Log</span>
                      </h3>
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {inspectionData.auditLogs.map((log) => (
                          <div
                            key={log._id || log.id}
                            className="p-2.5 bg-slate-50/50 flex items-center justify-between text-[11px]"
                          >
                            <div>
                              <span className="font-bold text-slate-800 font-mono">
                                {log.action}
                              </span>
                              {log.reason && (
                                <span className="text-slate-500 ml-2">
                                  — &ldquo;{log.reason}&rdquo;
                                </span>
                              )}
                            </div>
                            <span className="text-slate-400 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Moderation Adjudication Action Panel */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Take Moderation Action
                    </h3>

                    {/* Action Selector Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setActionType('approve');
                          setActionReason('');
                          setActionError(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          actionType === 'approve'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        ✓ Approve Stall
                      </button>

                      <button
                        onClick={() => {
                          setActionType('request_corrections');
                          setActionReason('');
                          setActionError(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          actionType === 'request_corrections'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        ↺ Request Corrections
                      </button>

                      <button
                        onClick={() => {
                          setActionType('reject');
                          setActionReason('');
                          setActionError(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          actionType === 'reject'
                            ? 'bg-slate-800 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        ✕ Reject Stall
                      </button>

                      <button
                        onClick={() => {
                          setActionType('suspend');
                          setActionReason('');
                          setActionError(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          actionType === 'suspend'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white hover:bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        ⚠ Suspend Stall
                      </button>

                      <button
                        onClick={() => {
                          setActionType('restore');
                          setActionReason('');
                          setActionError(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          actionType === 'restore'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        ⟳ Restore Stall
                      </button>
                    </div>

                    {/* Reason input for actions that require explanation */}
                    {actionType && (
                      <div className="space-y-3 pt-2 border-t border-slate-200">
                        {['reject', 'request_corrections', 'suspend'].includes(actionType) && (
                          <div>
                            <label className="block text-slate-700 font-bold mb-1">
                              Reason for {actionType.replace('_', ' ')}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              rows={3}
                              value={actionReason}
                              onChange={(e) => setActionReason(e.target.value)}
                              placeholder={`Explain clearly why this stall is being ${
                                actionType === 'request_corrections'
                                  ? 'asked for changes (e.g. Please clarify stall location or photo)'
                                  : actionType === 'suspend'
                                  ? 'suspended (e.g. Inaccurate location, stall closed down)'
                                  : 'rejected'
                              }...`}
                              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        )}

                        {actionType === 'approve' && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                            Approving will immediately publish this stall to customer discovery and make it searchable on interactive maps.
                          </p>
                        )}

                        {actionType === 'restore' && (
                          <p className="text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                            Restoring will reactivate the stall back to approved status and reinstate map discovery.
                          </p>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleExecuteAction}
                            disabled={actionSubmitting}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                          >
                            {actionSubmitting ? 'Executing...' : `Confirm & Execute ${actionType.replace('_', ' ')}`}
                          </button>
                          <button
                            onClick={() => {
                              setActionType(null);
                              setActionReason('');
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Action will be permanently recorded in administrative audit logs.
              </span>
              <button
                onClick={closeInspectionModal}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
