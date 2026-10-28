import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '../components/AdminNav';
import {
  getAdminReports,
  updateAdminReport,
  updateAdminVendorStatus,
} from '../services/adminService';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Store,
  User,
  Mail,
  X,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Moderation modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [targetStatus, setTargetStatus] = useState('resolved'); // 'under_review' | 'resolved' | 'dismissed'
  const [resolutionNote, setResolutionNote] = useState('');
  const [suspendVendorToo, setSuspendVendorToo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminReports({
        status: statusFilter,
        reason: reasonFilter,
      });
      if (res.success) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load listing reports');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reasonFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const openResolutionModal = (report) => {
    setSelectedReport(report);
    setTargetStatus(report.status === 'open' ? 'resolved' : report.status);
    setResolutionNote(report.resolutionNote || '');
    setSuspendVendorToo(false);
    setModalError(null);
  };

  const closeResolutionModal = () => {
    setSelectedReport(null);
    setResolutionNote('');
    setSuspendVendorToo(false);
    setModalError(null);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    if (['resolved', 'dismissed'].includes(targetStatus) && !resolutionNote.trim()) {
      setModalError('A resolution note is required when resolving or dismissing a report.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const reportId = selectedReport.id || selectedReport._id;

      // 1. Update report status
      const res = await updateAdminReport(reportId, {
        status: targetStatus,
        resolutionNote: resolutionNote.trim(),
      });

      // 2. Optionally suspend the target vendor stall if checked
      if (suspendVendorToo && selectedReport.targetVendorId) {
        const vendorId =
          selectedReport.targetVendorId.id ||
          selectedReport.targetVendorId._id ||
          selectedReport.targetVendorId;

        await updateAdminVendorStatus(vendorId, {
          action: 'suspend',
          reason: `Suspended pursuant to community report: ${resolutionNote.trim()}`,
        });
      }

      if (res.success) {
        setSuccessMessage(`Report #${reportId.slice(-6)} marked as ${targetStatus}.`);
        closeResolutionModal();
        await fetchReports();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to adjudicate report');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="h-3 w-3 mr-1" /> Open
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="h-3 w-3 mr-1" /> Under Review
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-700 border border-slate-300">
            <XCircle className="h-3 w-3 mr-1" /> Dismissed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'inaccurate_location':
        return 'Inaccurate Map Coordinates / Moved Stall';
      case 'closed_down':
        return 'Permanently Closed / Stall No Longer Operates';
      case 'misleading_products':
        return 'Misleading or Outdated Product Catalog';
      case 'inappropriate_content':
        return 'Inappropriate Imagery or Offensive Profile';
      case 'fraudulent_vendor':
        return 'Fraudulent Stall / Impersonation';
      default:
        return reason.replace('_', ' ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AdminNav />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Listing Moderation & Community Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review shopper complaints regarding relocated stalls, stale listings, or misleading details.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Reports' },
            { key: 'open', label: 'Open' },
            { key: 'under_review', label: 'Under Review' },
            { key: 'resolved', label: 'Resolved' },
            { key: 'dismissed', label: 'Dismissed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <label className="text-slate-500 font-medium">Filter by Reason:</label>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Reasons</option>
            <option value="inaccurate_location">Inaccurate Location</option>
            <option value="closed_down">Closed Down</option>
            <option value="misleading_products">Misleading Products</option>
            <option value="inappropriate_content">Inappropriate Content</option>
            <option value="fraudulent_vendor">Fraudulent Stall</option>
            <option value="other">Other</option>
          </select>
        </div>
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
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl border border-slate-200">
          <RotateCcw className="h-6 w-6 animate-spin text-primary-500" />
          <span>Loading community reports...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No Reports Found</p>
          <p className="text-xs text-slate-400">
            No complaints are active under &ldquo;{statusFilter}&rdquo; status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const reportId = report.id || report._id;
            const targetStall = report.targetVendor;

            return (
              <div
                key={reportId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(report.status)}
                    <span className="font-mono text-slate-400 text-[11px]">
                      #{reportId.slice(-6)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                      {getReasonLabel(report.reason)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Target stall */}
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Target Listing:
                    </span>
                    <div className="flex items-center space-x-2">
                      <Store className="h-4 w-4 text-primary-600 shrink-0" />
                      <span className="font-bold text-slate-900 text-sm">
                        {targetStall?.stallName || 'Vendor Stall Listing'}
                      </span>
                    </div>
                    {targetStall?.address && (
                      <p className="text-slate-500 text-[11px] pl-6">
                        {targetStall.address.area}, {targetStall.address.city}
                      </p>
                    )}
                  </div>

                  {/* Reporter Info */}
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Reported By:
                    </span>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {report.reporterName || 'Anonymous Shopper'}
                      </span>
                    </div>
                    {report.reporterEmail && (
                      <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{report.reporterEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Resolution info */}
                  <div className="space-y-1 md:text-right">
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                      Adjudication:
                    </span>
                    <div>
                      {report.status === 'open' ? (
                        <span className="text-red-700 font-semibold">Requires Moderator Review</span>
                      ) : (
                        <div className="text-slate-700">
                          <span className="capitalize font-medium">{report.status}</span>
                          {report.resolvedAt && (
                            <span className="text-slate-400 text-[11px] block">
                              on {new Date(report.resolvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-semibold text-slate-700 text-xs mb-1">Shopper Complaint:</p>
                  <p className="text-slate-800 leading-relaxed text-xs">
                    {report.details || 'No detailed message provided by reporter.'}
                  </p>
                </div>

                {/* Existing Resolution Note */}
                {report.resolutionNote && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold block mb-0.5">Admin Resolution Note:</span>
                    <p className="text-xs">{report.resolutionNote}</p>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openResolutionModal(report)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Take Action / Resolve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <h2 className="text-base font-bold text-slate-900 font-display">
                  Adjudicate Report #{ (selectedReport.id || selectedReport._id).slice(-6) }
                </h2>
              </div>
              <button
                onClick={closeResolutionModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Set Resolution Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'under_review', label: 'Under Review' },
                    { id: 'resolved', label: 'Resolved' },
                    { id: 'dismissed', label: 'Dismissed' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setTargetStatus(s.id)}
                      className={`p-2 rounded-xl font-bold border transition-colors ${
                        targetStatus === s.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Resolution Note / Findings <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required={['resolved', 'dismissed'].includes(targetStatus)}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Record what action was taken (e.g. Verified vendor location updated, or dismissed as duplicate)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Vendor Suspension Option */}
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="suspendVendorToo"
                    checked={suspendVendorToo}
                    onChange={(e) => setSuspendVendorToo(e.target.checked)}
                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500 border-red-300"
                  />
                  <label htmlFor="suspendVendorToo" className="text-red-900 font-bold text-xs">
                    Immediately suspend reported vendor stall
                  </label>
                </div>
                <p className="text-[11px] text-red-700 pl-6 leading-tight">
                  Check this if the complaint confirms severe infractions (e.g., fraudulent stall or permanently closed). Stall will be removed from map discovery.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeResolutionModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Apply Adjudication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
