import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="text-center py-16 max-w-md mx-auto space-y-4">
      <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 font-display">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-600">
        The route you are trying to visit does not exist or has not been implemented yet.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    </div>
  );
}
