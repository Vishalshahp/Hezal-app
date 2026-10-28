import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { submitPublicReport } from '../services/adminService';

export default function ReportModal({ isOpen, onClose, targetVendorId, stallName }) {
  const [reason, setReason] = useState('inaccurate_location');
  const [details, setDetails] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide details explaining the issue.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await submitPublicReport({
        targetType: 'vendor',
        targetVendorId,
        reason,
        details: details.trim(),
        reporterName: reporterName.trim(),
        reporterEmail: reporterEmail.trim(),
      });

      if (res.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setDetails('');
    setReporterName('');
    setReporterEmail('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 font-display">
              Report Listing: {stallName}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Report Submitted</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thank you for keeping Hezal Market accurate. Our moderation team has received your report and will review the stall coordinates and credentials.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Reason for Reporting <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-primary-500"
              >
                <option value="inaccurate_location">Inaccurate Location / Stall Moved</option>
                <option value="closed_down">Permanently Closed / Stall No Longer Operates</option>
                <option value="misleading_products">Misleading or Unavailable Products</option>
                <option value="inappropriate_content">Inappropriate Content or Photos</option>
                <option value="fraudulent_vendor">Fake Stall / Fraudulent Listing</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Details / What did you observe? <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what is inaccurate or wrong with this stall (e.g. Stall has moved across the street near the bank)..."
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Shopper"
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Your Email (Optional)</label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="e.g. shopper@mail.com"
                  className="w-full p-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
