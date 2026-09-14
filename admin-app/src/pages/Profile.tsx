import { useAdminAuth } from '@/context/AdminAuthContext';
import { User, Mail, Shield, Clock } from 'lucide-react';

export default function Profile() {
  const { user } = useAdminAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Profile</h1>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-md shadow-indigo-500/25">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900">{user?.name || 'Administrator'}</h2>
            <p className="text-xs sm:text-sm font-semibold text-indigo-600">{user?.email}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mt-1">
              <Shield className="w-3 h-3" />
              {user?.role || 'Super Admin'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              Full Name
            </span>
            <p className="text-sm font-bold text-slate-800">{user?.name || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              Email Address
            </span>
            <p className="text-sm font-bold text-slate-800">{user?.email || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              Assigned Role
            </span>
            <p className="text-sm font-bold text-slate-800 capitalize">{user?.role || 'Super Admin'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Last Session Login
            </span>
            <p className="text-sm font-bold text-slate-800">
              {user?.last_login ? new Date(user.last_login).toLocaleString() : 'Current Session'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
