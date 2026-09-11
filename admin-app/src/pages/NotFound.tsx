import { Link } from 'react-router-dom';
import { Construction, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
        <Construction className="w-10 h-10" />
      </div>

      <div className="max-w-md space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Module Under Development
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
          This admin module is currently being configured and built in Vite + React SPA.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
