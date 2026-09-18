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
  LogIn,
  RotateCcw
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

  const [availableModules, setAvailableModules] = useState<string[]>([]);

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
          if (json.availableModules && Array.isArray(json.availableModules)) {
            setAvailableModules(json.availableModules);
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
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] font-bold tracking-wider uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Security & Compliance</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200/80 uppercase tracking-wider">
                Live Audit Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-serif">
              System Audit Trail & Activity Logs
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-medium leading-relaxed">
              Complete chronological ledger of administrative modifications, creates, deletes, JSON property diffs, IP locations, and client browser sessions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => fetchLogs(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Refresh audit stream"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* ── COMPACT METRIC STAT PILLS ── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
            <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Total Logs:</span>
            <span className="font-extrabold text-stone-900">{stats.total.toLocaleString()}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
            <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">Created:</span>
            <span className="font-extrabold text-emerald-800">{stats.create.toLocaleString()}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900">
            <span className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Updated:</span>
            <span className="font-extrabold text-amber-900">{stats.update.toLocaleString()}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50/70 border border-rose-200/80 text-rose-900">
            <span className="text-rose-700 text-[11px] font-medium uppercase tracking-wider">Deleted:</span>
            <span className="font-extrabold text-rose-800">{stats.delete.toLocaleString()}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50/70 border border-indigo-200/80 text-indigo-900">
            <span className="text-indigo-700 text-[11px] font-medium uppercase tracking-wider">Staff Admins:</span>
            <span className="font-extrabold text-indigo-900">{stats.activeAdmins.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── ADVANCED SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff, email, action, IP..."
              className="w-full pl-10 pr-3 py-2 text-xs font-medium bg-stone-50/70 border border-stone-200/90 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
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
              className="w-full px-3 py-2 text-xs font-bold bg-stone-50/70 border border-stone-200/90 rounded-xl text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
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
              className="w-full px-3 py-2 text-xs font-bold bg-stone-50/70 border border-stone-200/90 rounded-xl text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all capitalize cursor-pointer"
            >
              <option value="">All Modules</option>
              {availableModules.length > 0 ? (
                availableModules.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod.replace(/-/g, ' ')}
                  </option>
                ))
              ) : (
                <>
                  <option value="auth">Auth & Login</option>
                  <option value="system-settings">System Settings</option>
                  <option value="users">Users</option>
                  <option value="page-banners">Page Banners</option>
                  <option value="universities">Universities</option>
                  <option value="programs">Programs</option>
                  <option value="blogs">Blogs</option>
                </>
              )}
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
              className="w-full px-3 py-2 text-xs font-medium bg-stone-50/70 border border-stone-200/90 rounded-xl text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
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
              className="w-full px-3 py-2 text-xs font-medium bg-stone-50/70 border border-stone-200/90 rounded-xl text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 focus:bg-white transition-all"
              title="End Date"
            />
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── AUDIT LOGS TABLE ── */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead>
              <tr className="bg-[#effaf2] border-b-2 border-[#c8ebd2] text-[#14532d] font-extrabold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center text-emerald-700">#</th>
                <th className="py-3.5 px-4 text-[#14532d]">Admin User</th>
                <th className="py-3.5 px-4 text-[#14532d]">Action</th>
                <th className="py-3.5 px-4 text-[#14532d]">Module & Target</th>
                <th className="py-3.5 px-4 text-[#14532d]">Description</th>
                <th className="py-3.5 px-4 text-[#14532d]">Client Info (IP & OS)</th>
                <th className="py-3.5 px-4 text-[#14532d]">Timestamp (MYT)</th>
                <th className="py-3.5 px-4 text-right text-[#14532d]">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#14532d]" />
                    <span className="text-xs font-bold">Loading audit trail entries...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-stone-400">
                    <ShieldCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-bold text-stone-700">No audit logs found</p>
                    <p className="text-[11px] text-stone-400 mt-1">Try adjusting your search criteria or date filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-[#fbfaf7] transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-center font-bold text-emerald-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Admin User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#14532d] text-white font-black text-xs flex items-center justify-center shrink-0 font-serif shadow-2xs">
                          {log.user_name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-stone-900 block truncate group-hover:text-[#14532d] transition-colors">
                            {log.user_name || 'System / Staff'}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono block truncate">
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
                        <span className="font-bold text-stone-900 uppercase tracking-wide text-[10.5px]">
                          {log.module}
                        </span>
                        {log.record_id && (
                          <span className="text-[10px] font-mono text-stone-400">
                            ID: #{log.record_id}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <span className="font-medium text-stone-800 line-clamp-2" title={log.description || ''}>
                        {log.description || 'Action performed'}
                      </span>
                    </td>

                    {/* Client Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[10.5px]">
                        <span className="font-mono text-stone-700 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3 text-stone-400" />
                          {log.ip_address || '127.0.0.1'}
                        </span>
                        <span className="text-stone-400 flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-stone-400" />
                          {[log.browser, log.os].filter(Boolean).join(' • ') || 'Desktop'}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-stone-600">
                      <div className="flex flex-col text-[10.5px]">
                        <span className="font-bold text-stone-800">
                          {new Date(log.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-stone-400 font-mono">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#effaf2] hover:bg-[#dcfce7] text-[#14532d] text-xs font-bold transition-all cursor-pointer border border-[#c8ebd2]/60 shadow-2xs"
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
          <div className="p-4 border-t border-stone-200/80 bg-[#faf8f4]">
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
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#faf8f4]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#14532d] text-white flex items-center justify-center shadow-xs">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-stone-900">
                      Audit Log #{selectedLog.id}
                    </h3>
                    {renderActionBadge(selectedLog.action)}
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    Module: <strong className="text-stone-800 uppercase">{selectedLog.module}</strong> • Admin: <strong className="text-stone-800">{selectedLog.user_name || 'System'}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-5 pt-3 border-b border-stone-100 flex items-center gap-2 overflow-x-auto bg-white">
              <button
                type="button"
                onClick={() => setModalTab('diff')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'diff'
                    ? 'border-[#14532d] text-[#14532d] bg-[#effaf2]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Property Diff ({selectedLog.diff_values ? Object.keys(selectedLog.diff_values).length : 0} Changes)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('new')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'new'
                    ? 'border-[#14532d] text-[#14532d] bg-[#effaf2]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                New State Payload
              </button>
              <button
                type="button"
                onClick={() => setModalTab('old')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'old'
                    ? 'border-[#14532d] text-[#14532d] bg-[#effaf2]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Old State Snapshot
              </button>
              <button
                type="button"
                onClick={() => setModalTab('client')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                  modalTab === 'client'
                    ? 'border-[#14532d] text-[#14532d] bg-[#effaf2]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
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
