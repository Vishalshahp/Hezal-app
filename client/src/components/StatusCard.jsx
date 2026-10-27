import React, { useState, useEffect, useCallback } from 'react';
import { Server, Database, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { checkSystemHealth } from '../services/healthService';
import { API_BASE_URL } from '../services/api';

export default function StatusCard() {
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [status, setStatus] = useState({
    api: { connected: false, data: null, error: null },
    db: { connected: false, data: null, error: null },
  });

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    try {
      const result = await checkSystemHealth();
      setStatus(result);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setStatus({
        api: { connected: false, data: null, error: err.message },
        db: { connected: false, data: null, error: 'Database check bypassed' },
      });
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return (
    <div id="system-status" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
            System & Foundation Status
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Backend API target: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">{API_BASE_URL}</code>
          </p>
        </div>
        <button
          onClick={runHealthCheck}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          <span>{loading ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      {/* Grid of status items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* API Server Card */}
        <div className={`p-4 rounded-lg border transition-all ${
          loading
            ? 'bg-slate-50 border-slate-200'
            : status.api.connected
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-red-50/50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-lg ${
                loading ? 'bg-slate-200 text-slate-600' : status.api.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Express API</h3>
                <span className="text-xs text-slate-500">Backend Server</span>
              </div>
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              ) : status.api.connected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
            {loading ? (
              <span className="text-slate-400">Pinging /api/health...</span>
            ) : status.api.connected ? (
              <div className="space-y-1">
                <p className="text-emerald-700 font-medium">Running (HTTP 200 OK)</p>
                <p className="text-slate-500 text-[11px]">
                  Env: <span className="font-mono">{status.api.data?.environment || 'development'}</span> | Uptime: {status.api.data?.uptimeSeconds ?? 0}s
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-red-700 font-medium">Server Unreachable</p>
                <p className="text-red-600/80 text-[11px] break-words">{status.api.error || 'Connection refused. Ensure server is running on port 5000.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* MongoDB Database Card */}
        <div className={`p-4 rounded-lg border transition-all ${
          loading
            ? 'bg-slate-50 border-slate-200'
            : status.db.connected
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded-lg ${
                loading ? 'bg-slate-200 text-slate-600' : status.db.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">MongoDB Atlas</h3>
                <span className="text-xs text-slate-500">Database Engine</span>
              </div>
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
              ) : status.db.connected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
            {loading ? (
              <span className="text-slate-400">Checking /api/health/db...</span>
            ) : status.db.connected ? (
              <div className="space-y-1">
                <p className="text-emerald-700 font-medium">Connected & Active</p>
                <p className="text-slate-500 text-[11px]">
                  Database: <span className="font-mono">{status.db.data?.data?.database || 'default'}</span>
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-amber-800 font-medium">Database Offline / Disconnected</p>
                <p className="text-amber-700 text-[11px] break-words">
                  {status.db.error || 'Configure MONGODB_URI in server/.env to enable persistence.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1">
        <span>Foundation health verified at runtime via REST endpoints</span>
        {lastChecked && <span>Last checked: {lastChecked}</span>}
      </div>
    </div>
  );
}
