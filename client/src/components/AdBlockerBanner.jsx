import React, { useState } from 'react';
import { ShieldAlert, X, Info, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAdBlocker } from '../hooks/useAdBlocker';

export default function AdBlockerBanner() {
  const { isAdBlockerActive, dismissed, dismissAdBlocker, resetDismiss } = useAdBlocker();
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!isAdBlockerActive) {
    return null;
  }

  return (
    <>
      {/* Top Notification Banner (Shown when not dismissed) */}
      {!dismissed && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white shadow-md text-xs sm:text-sm py-2.5 px-4 relative z-50 transition-all duration-300"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 flex-1 min-w-[280px]">
              <div className="p-1 rounded-full bg-white/20 text-white shrink-0">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="leading-snug">
                <span className="font-bold">Ad Blocker Detected:</span>{' '}
                <span className="opacity-95">
                  Hezal Market is <strong>100% ad-free</strong> with 0% vendor commission. Certain ad blocker filters can mistakenly block live OpenStreetMap tiles, GPS street stall markers, or vendor WhatsApp chat buttons.
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
              >
                <Info className="h-3.5 w-3.5" />
                <span>Why disable?</span>
              </button>

              <button
                type="button"
                onClick={dismissAdBlocker}
                aria-label="Dismiss ad blocker notification"
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
                title="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Pill (Always visible in bottom-left corner so user is continuously informed) */}
      {dismissed && (
        <div className="fixed bottom-20 sm:bottom-4 left-4 z-40">
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            title="Ad Blocker is active on this browser — click to learn why certain map tiles or GPS pins may be impacted"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-500/95 hover:bg-amber-600 text-white shadow-lg text-[11px] font-bold tracking-tight backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>AdBlock Active</span>
          </button>
        </div>
      )}

      {/* Educational Whitelist Information Modal */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E5EAE5] space-y-5 text-[#17231D] relative">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold font-display text-lg sm:text-xl text-[#17231D]">
                  Ad Blocker & Hezal Market
                </h3>
                <p className="text-xs text-[#647067]">
                  Why street discovery platforms need clean network access
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-[#647067] leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold block mb-0.5">100% Ad-Free & Privacy-First</strong>
                  Hezal Market has <strong>zero advertisements</strong>, zero tracking cookies, and charges 0% commission to local vendors. You will never see sponsored banner ads or popups here.
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-[#17231D] text-xs uppercase tracking-wider">
                  Why you might want to pause your ad blocker for this site:
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>
                    <strong>OpenStreetMap Tile Blocking:</strong> Some filter lists block external map tiles from OpenStreetMap or satellite tile providers.
                  </li>
                  <li>
                    <strong>Live GPS Coordinates:</strong> Geolocation APIs and walking route distance calculators can be treated as tracking scripts.
                  </li>
                  <li>
                    <strong>Roadside Vendor WhatsApp & Phone Links:</strong> Direct customer-to-vendor communication buttons (e.g. `api.whatsapp.com`) may be suppressed.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                💡 <em>How to whitelist:</em> Click your browser extension icon (uBlock Origin, AdBlock, Brave Shields) in the top toolbar and toggle it off for <code>hezal-market.vercel.app</code> or <code>localhost</code>.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  dismissAdBlocker();
                  setShowInfoModal(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
              >
                Got it, keep adblock on
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInfoModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
