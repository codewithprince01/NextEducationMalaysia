import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';

interface AccessDeniedProps {
  moduleName?: string;
}

export default function AccessDenied({ moduleName }: AccessDeniedProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative overflow-hidden">
        {/* Background accent glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-100 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mb-5 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Access Restricted</span>
          </div>

          <h2 className="text-xl font-bold text-slate-800 mb-2">Permission Required</h2>
          
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            You do not have permission to access the{' '}
            <span className="font-semibold text-slate-700 underline decoration-rose-300">
              {moduleName || 'requested'}
            </span>{' '}
            module. If you believe this is an error, please contact your Super Administrator.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <Link
              to="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
