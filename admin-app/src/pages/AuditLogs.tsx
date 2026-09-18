import React, { useEffect, useState } from 'react';
import Pagination from '@/components/common/Pagination';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Globe,
  Monitor,
  X,
  Copy,
  Check,
  Eye,
  Activity,
  ShieldCheck,
  Terminal,
  FileCode2,
  PlusCircle,
  Edit3,
  Trash2,
  LogIn
} from 'lucide-react';

interface AuditLogItem {
  id: number;
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  action: string;
  module: string;
  record_id?: string | null;
  description?: string | null;
  old_values?: any;
  new_values?: any;
  diff_values?: Record<string, { old: any; new: any }> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  status?: string | null;
  created_at: string;
}

interface AuditStats {
  total: number;
  create: number;
  update: number;
  delete: number;
  view: number;
  login: number;
  activeAdmins: number;
  touchedModules: number;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Stats
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    create: 0,
    update: 0,
    delete: 0,
    view: 0,
    login: 0,
    activeAdmins: 0,
    touchedModules: 0,
  });

  // Modal detail view
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [modalTab, setModalTab] = useState<'diff' | 'new' | 'old' | 'client'>('diff');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      if (search.trim()) params.append('search', search.trim());
      if (actionFilter.trim()) params.append('action', actionFilter.trim());
      if (moduleFilter.trim()) params.append('module', moduleFilter.trim());
      if (startDate.trim()) params.append('startDate', startDate.trim());
      if (endDate.trim()) params.append('endDate', endDate.trim());

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status && json.data) {
          setLogs(json.data);
          if (json.pagination) {
            setTotalPages(json.pagination.totalPages || 1);
            setTotalItems(json.pagination.total || 0);
          }
          if (json.stats) {
            setStats(json.stats);
          }
        } else {
          setLogs([]);
        }
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 400);
      }
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, moduleFilter, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch('');
    setActionFilter('');
    setModuleFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    switch (act) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            <PlusCircle className="w-3 h-3" />
            CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            <Edit3 className="w-3 h-3" />
            UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
            <Trash2 className="w-3 h-3" />
            DELETE
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
            <LogIn className="w-3 h-3" />
            LOGIN
          </span>
        );
      case 'VIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
            <Eye className="w-3 h-3" />
            VIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            {act}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER & AUDIT METRICS ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Security & Compliance
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Audit Stream
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Admin Audit Trail & Activity Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Complete record of all administrative modifications, creations, deletions, JSON property diffs, and client sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh audit stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* ── KPI METRICS RIBBON ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Logs</span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">{stats.total.toLocaleString()}</span>
          </div>
          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Created Records</span>
            <span className="text-lg font-black text-emerald-800 mt-0.5 block">{stats.create.toLocaleString()}</span>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Updated Records</span>
            <span className="text-lg font-black text-blue-800 mt-0.5 block">{stats.update.toLocaleString()}</span>
          </div>
          <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Deleted Records</span>
            <span className="text-lg font-black text-rose-800 mt-0.5 block">{stats.delete.toLocaleString()}</span>
          </div>
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Active Admins</span>
            <span className="text-lg font-black text-amber-800 mt-0.5 block">{stats.activeAdmins.toLocaleString()} Staff</span>
          </div>
        </div>
      </div>

      {/* ── ADVANCED SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, description, IP..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="LOGIN">LOGIN</option>
              <option value="VIEW">VIEW</option>
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="">All Modules</option>
              <option value="auth">Auth & Login</option>
              <option value="users">Users</option>
              <option value="permissions">Permissions</option>
              <option value="page-banners">Page Banners</option>
              <option value="university">Universities</option>
              <option value="programs">Programs</option>
              <option value="blogs">Blogs</option>
              <option value="seo">SEO</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              title="Start Date"
            />
          </div>

          {/* Date Range End & Reset */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              title="End Date"
            />
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Reset Filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── AUDIT LOGS TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12">#</th>
                <th className="py-3.5 px-4">Admin User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Module & Target</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Client Info (IP & OS)</th>
                <th className="py-3.5 px-4">Timestamp (MYT)</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    Loading audit trail entries...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No audit logs found</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search criteria or date filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Admin User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          {log.user_name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">
                            {log.user_name || 'System / Guest'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block truncate">
                            {log.user_email || 'anonymous'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Action Pill */}
                    <td className="py-3.5 px-4">
                      {renderActionBadge(log.action)}
                    </td>

                    {/* Module & Record */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-700 uppercase tracking-wide text-[10.5px]">
                          {log.module}
                        </span>
                        {log.record_id && (
                          <span className="text-[10px] font-mono text-slate-400">
                            ID: {log.record_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <span className="font-medium text-slate-800 line-clamp-2" title={log.description || ''}>
                        {log.description || 'Action performed'}
                      </span>
                    </td>

                    {/* Client Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[10.5px]">
                        <span className="font-mono text-slate-700 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {log.ip_address || '127.0.0.1'}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-slate-400" />
                          {[log.browser, log.os].filter(Boolean).join(' • ') || 'Desktop'}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex flex-col text-[10.5px]">
                        <span className="font-bold text-slate-800">
                          {new Date(log.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLog(log);
                          setModalTab(log.diff_values ? 'diff' : log.new_values ? 'new' : 'client');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer border border-indigo-200/80"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* ── JSON DIFF & CLIENT METADATA INSPECTION MODAL ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Audit Log #{selectedLog.id}
                    </h3>
                    {renderActionBadge(selectedLog.action)}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Module: <strong className="text-slate-800 uppercase">{selectedLog.module}</strong> • Admin: <strong className="text-slate-800">{selectedLog.user_name || 'System'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-white">
              <button
                type="button"
                onClick={() => setModalTab('diff')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'diff'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Property Diff ({selectedLog.diff_values ? Object.keys(selectedLog.diff_values).length : 0} Changes)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('new')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'new'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                New State Payload
              </button>
              <button
                type="button"
                onClick={() => setModalTab('old')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'old'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Old State Snapshot
              </button>
              <button
                type="button"
                onClick={() => setModalTab('client')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'client'
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Client & Session Info
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-900 text-slate-100 font-mono text-xs">
              {modalTab === 'diff' && (
                <div className="space-y-4">
                  {selectedLog.diff_values && Object.keys(selectedLog.diff_values).length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
                        <span>Field Name</span>
                        <div className="flex items-center gap-6">
                          <span className="text-rose-400">Old Value (- )</span>
                          <span className="text-emerald-400">New Value (+ )</span>
                        </div>
                      </div>
                      {Object.entries(selectedLog.diff_values).map(([field, diff]) => (
                        <div key={field} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-300">{field}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px]">
                            <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-200 overflow-x-auto">
                              <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Old:</span>
                              <pre className="whitespace-pre-wrap">{JSON.stringify(diff.old, null, 2)}</pre>
                            </div>
                            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 overflow-x-auto">
                              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">New:</span>
                              <pre className="whitespace-pre-wrap">{JSON.stringify(diff.new, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      <p>No property diff computed for this record (e.g. newly created snapshot or view action).</p>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'new' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.new_values, null, 2), 'new')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'new' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'new' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <pre className="p-4 bg-slate-950 rounded-2xl overflow-x-auto text-[11.5px] leading-relaxed text-emerald-300">
                    {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '// No new values recorded'}
                  </pre>
                </div>
              )}

              {modalTab === 'old' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.old_values, null, 2), 'old')}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'old' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'old' ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <pre className="p-4 bg-slate-950 rounded-2xl overflow-x-auto text-[11.5px] leading-relaxed text-rose-300">
                    {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '// No previous snapshot recorded'}
                  </pre>
                </div>
              )}

              {modalTab === 'client' && (
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Network & IP</span>
                      <div className="flex items-center justify-between text-slate-200">
                        <span>IP Address:</span>
                        <strong className="font-mono text-indigo-300">{selectedLog.ip_address || '127.0.0.1'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-200">
                        <span>Status:</span>
                        <strong className="text-emerald-400 uppercase font-bold">{selectedLog.status || 'success'}</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Environment</span>
                      <div className="flex items-center justify-between text-slate-200">
                        <span>Browser:</span>
                        <strong className="text-slate-100">{selectedLog.browser || 'Unknown'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-200">
                        <span>Operating System:</span>
                        <strong className="text-slate-100">{selectedLog.os || 'Unknown'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-200">
                        <span>Device:</span>
                        <strong className="text-slate-100">{selectedLog.device || 'Desktop'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Raw User Agent:</span>
                    <p className="text-slate-300 break-all leading-relaxed">{selectedLog.user_agent || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Recorded: {new Date(selectedLog.created_at).toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
