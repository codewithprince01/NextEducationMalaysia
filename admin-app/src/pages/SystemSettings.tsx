import React, { useEffect, useState } from 'react';
import {
  Settings,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  SlidersHorizontal,
  ShieldCheck,
  Zap,
  Check,
  AtSign,
  User,
  HardDrive,
  Server,
  Eye,
  EyeOff,
  Globe,
  FolderOpen
} from 'lucide-react';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [submittingMode, setSubmittingMode] = useState(false);
  const [submittingMain, setSubmittingMain] = useState(false);
  const [submittingTesting, setSubmittingTesting] = useState(false);
  const [submittingStorage, setSubmittingStorage] = useState(false);
  const [testingStorage, setTestingStorage] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<'mode' | 'main' | 'testing' | 'storage'>('mode');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [emailMode, setEmailMode] = useState<'main' | 'testing'>('main');

  const [storageSettings, setStorageSettings] = useState({
    sftp_host: '103.212.121.117',
    sftp_port: 21,
    sftp_username: 'ftpimages@images.britannicaoverseas.com',
    sftp_password: 'GZHAV=#3e~lS49i%',
    sftp_root: '/em/',
    remote_storage_cdn_url: 'https://www.images.britannicaoverseas.com/em',
  });

  const [mainSettings, setMainSettings] = useState({
    main_to_email: 'studytutelage@gmail.com',
    main_to_name: 'Team tutelage Study',
    main_cc_email: 'amanahlawat1918@gmail.com',
    main_cc_name: 'Aman Ahlawat',
    main_bcc_email: 'farazahmad280@gmail.com',
    main_bcc_name: 'Mohd Faraz',
  });

  const [testingSettings, setTestingSettings] = useState({
    testing_to_email: 'test@example.com',
    testing_to_name: 'Test Email',
    testing_cc_email: 'test@example.com',
    testing_cc_name: 'Test CC',
    testing_bcc_email: 'test@example.com',
    testing_bcc_name: 'Test BCC',
  });

  const [totalKeys, setTotalKeys] = useState<number>(13);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [res, storageRes] = await Promise.all([
        fetch('/api/v1/admin/system-settings'),
        fetch('/api/v1/admin/storage-settings'),
      ]);

      if (res.ok) {
        const json = await res.json();
        if (json.emailMode) setEmailMode(json.emailMode);
        if (json.mainSettings) setMainSettings(json.mainSettings);
        if (json.testingSettings) setTestingSettings(json.testingSettings);
        if (json.totalCount !== undefined) setTotalKeys(json.totalCount);
      }

      if (storageRes.ok) {
        const storageJson = await storageRes.json();
        if (storageJson.config) {
          setStorageSettings(storageJson.config);
        }
      }
    } catch {
      // Keep fallback state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateMode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingMode(true);
    try {
      const res = await fetch('/api/v1/admin/system-settings/email-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_mode: emailMode }),
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', `Email dispatch mode switched to ${emailMode.toUpperCase()} successfully.`);
      } else {
        showToast('error', json.message || 'Failed to update email mode');
      }
    } catch {
      showToast('error', 'Network error while updating email mode');
    } finally {
      setSubmittingMode(false);
    }
  };

  const handleUpdateMain = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingMain(true);
    try {
      const res = await fetch('/api/v1/admin/system-settings/main-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mainSettings),
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Production email recipient configuration saved successfully.');
      } else {
        showToast('error', json.message || 'Failed to save main email settings');
      }
    } catch {
      showToast('error', 'Network error while saving main email settings');
    } finally {
      setSubmittingMain(false);
    }
  };

  const handleUpdateTesting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTesting(true);
    try {
      const res = await fetch('/api/v1/admin/system-settings/testing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testingSettings),
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', 'Testing email recipient configuration saved successfully.');
      } else {
        showToast('error', json.message || 'Failed to save testing email settings');
      }
    } catch {
      showToast('error', 'Network error while saving testing email settings');
    } finally {
      setSubmittingTesting(false);
    }
  };

  const handleUpdateStorage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStorage(true);
    try {
      const res = await fetch('/api/v1/admin/storage-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageSettings),
      });
      const json = await res.json();
      if (res.ok && (json.status || json.success)) {
        showToast('success', json.message || 'Storage settings updated successfully!');
        if (json.config) setStorageSettings(json.config);
      } else {
        showToast('error', json.message || 'Failed to update storage settings');
      }
    } catch {
      showToast('error', 'Network error while updating storage settings');
    } finally {
      setSubmittingStorage(false);
    }
  };

  const handleTestStorage = async () => {
    setTestingStorage(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/admin/storage-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storageSettings),
      });
      const json = await res.json();
      setTestResult({
        success: Boolean(res.ok && (json.status || json.success)),
        message: json.message || (res.ok ? 'Connection successful!' : 'Connection failed!'),
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Network error while attempting to connect to FTP server',
      });
    } finally {
      setTestingStorage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium transition-all duration-300 border ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 border-emerald-700/50 backdrop-blur-md'
              : 'bg-rose-900/95 border-rose-700/50 backdrop-blur-md'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Classic Editorial Header Card */}
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl border border-stone-200/80 p-6 md:p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 via-stone-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-semibold tracking-wide uppercase">
              <Settings className="w-3.5 h-3.5" />
              Institutional Core Settings
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-stone-900 tracking-tight">
              System &amp; Email Settings
            </h1>
            <p className="text-stone-600 text-sm max-w-2xl font-light leading-relaxed">
              Configure SMTP dispatch routing modes, lead notification recipients, CC/BCC targets, and system defaults across Next Education Malaysia.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchSettings}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
              title="Refresh Settings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── COMPACT METRIC STAT PILLS ── */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5 pt-4 border-t border-stone-100 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#faf8f4] border border-stone-200/90 text-stone-700">
            <span className="text-stone-500 text-[11px] font-medium uppercase tracking-wider">Mode:</span>
            <span className={`font-extrabold capitalize ${emailMode === 'main' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {emailMode === 'main' ? 'Production' : 'Sandbox Testing'}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50/70 border border-blue-200/80 text-blue-900">
            <span className="text-blue-700 text-[11px] font-medium uppercase tracking-wider">Main TO:</span>
            <span className="font-extrabold font-mono text-[11px] text-blue-900">{mainSettings.main_to_email || 'None'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50/70 border border-purple-200/80 text-purple-900">
            <span className="text-purple-700 text-[11px] font-medium uppercase tracking-wider">Testing TO:</span>
            <span className="font-extrabold font-mono text-[11px] text-purple-900">{testingSettings.testing_to_email || 'None'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
            <span className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">FTP Host:</span>
            <span className="font-extrabold font-mono text-[11px] text-emerald-900">{storageSettings.sftp_host || 'None'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100/70 border border-stone-200 text-stone-800">
            <span className="text-stone-600 text-[11px] font-medium uppercase tracking-wider">Parameters:</span>
            <span className="font-extrabold text-stone-900">{totalKeys} Keys</span>
          </div>
        </div>
      </div>

      {/* Main Settings Tabs & Forms Container */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mode')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'mode'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Email Mode Switcher</span>
          </button>
          <button
            onClick={() => setActiveTab('main')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'main'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Main Recipients (Production)</span>
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'testing'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Testing Recipients (Sandbox)</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'storage'
                ? 'bg-[#14532d] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>SFTP / FTP Storage</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 md:p-8">
          {/* TAB 1: Mode Switcher */}
          {activeTab === 'mode' && (
            <form onSubmit={handleUpdateMode} className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
                  Active Dispatch Mode Routing
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Select which destination mailbox group receives inbound student applications, brochure downloads, document submissions, and contact inquiries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Option 1: Main Mode */}
                  <div
                    onClick={() => setEmailMode('main')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      emailMode === 'main'
                        ? 'border-stone-900 bg-stone-50/90 shadow-md ring-1 ring-stone-900/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-800 mb-3">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          emailMode === 'main'
                            ? 'border-stone-900 bg-stone-900 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {emailMode === 'main' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">Main Production Mode</h4>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                      Sends student leads directly to official admissions counselors and verified staff mailboxes.
                    </p>
                  </div>

                  {/* Option 2: Testing Mode */}
                  <div
                    onClick={() => setEmailMode('testing')}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      emailMode === 'testing'
                        ? 'border-amber-600 bg-amber-50/50 shadow-md ring-1 ring-amber-600/10'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-800 mb-3">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          emailMode === 'testing'
                            ? 'border-amber-600 bg-amber-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {emailMode === 'testing' && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900">Testing Sandbox Mode</h4>
                    <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                      Intercepts outbound emails and forwards them strictly to developer/QA test addresses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingMode}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingMode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Mode Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Main Production Recipients */}
          {activeTab === 'main' && (
            <form onSubmit={handleUpdateMain} className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
                  Main Production Email Configuration
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Set the primary destination, CC monitoring, and BCC archiving email addresses for live production student leads.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary Recipient Group */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <AtSign className="w-4 h-4 text-emerald-700" />
                      <span>Primary Destination (TO)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Main To Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={mainSettings.main_to_email}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_to_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                        placeholder="admissions@tutelage.edu.my"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Main To Display Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={mainSettings.main_to_name}
                          onChange={(e) => setMainSettings({ ...mainSettings, main_to_name: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="Admissions Office"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Carbon Copy (CC) Group */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Carbon Copy (CC)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Main CC Email
                      </label>
                      <input
                        type="email"
                        value={mainSettings.main_cc_email}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_cc_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                        placeholder="counselor@tutelage.edu.my"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Main CC Display Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={mainSettings.main_cc_name}
                          onChange={(e) => setMainSettings({ ...mainSettings, main_cc_name: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="Lead Counselor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Blind Carbon Copy (BCC) Group */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Blind Carbon Copy (BCC Archiving)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Main BCC Email
                        </label>
                        <input
                          type="email"
                          value={mainSettings.main_bcc_email}
                          onChange={(e) => setMainSettings({ ...mainSettings, main_bcc_email: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="archive@tutelage.edu.my"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Main BCC Display Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={mainSettings.main_bcc_name}
                            onChange={(e) => setMainSettings({ ...mainSettings, main_bcc_name: e.target.value })}
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                            placeholder="Compliance Archive"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingMain}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingMain ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Production Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Testing Recipients */}
          {activeTab === 'testing' && (
            <form onSubmit={handleUpdateTesting} className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 mb-1">
                  Testing Sandbox Email Configuration
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mb-6">
                  Recipients designated to receive trial form submissions when the system is in Sandbox/Testing mode.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Testing Primary */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <AtSign className="w-4 h-4 text-emerald-700" />
                      <span>Testing Primary Target (TO)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Testing To Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={testingSettings.testing_to_email}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_to_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                        placeholder="test@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Testing To Display Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={testingSettings.testing_to_name}
                          onChange={(e) => setTestingSettings({ ...testingSettings, testing_to_name: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="QA Engineer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testing CC */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Testing Carbon Copy (CC)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Testing CC Email
                      </label>
                      <input
                        type="email"
                        value={testingSettings.testing_cc_email}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_cc_email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                        placeholder="test-cc@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                        Testing CC Display Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={testingSettings.testing_cc_name}
                          onChange={(e) => setTestingSettings({ ...testingSettings, testing_cc_name: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="Dev QA Team"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Testing BCC */}
                  <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 pb-2 border-b border-stone-200/60">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Testing Blind Carbon Copy (BCC)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Testing BCC Email
                        </label>
                        <input
                          type="email"
                          value={testingSettings.testing_bcc_email}
                          onChange={(e) => setTestingSettings({ ...testingSettings, testing_bcc_email: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                          placeholder="test-bcc@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                          Testing BCC Display Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={testingSettings.testing_bcc_name}
                            onChange={(e) => setTestingSettings({ ...testingSettings, testing_bcc_name: e.target.value })}
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                            placeholder="Audit Logger"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingTesting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Testing Settings
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SFTP / FTP Storage Settings */}
          {activeTab === 'storage' && (
            <form onSubmit={handleUpdateStorage} className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
                <div>
                  <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-700" />
                    <span>Remote SFTP / FTP Storage Configuration</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                    Configure the remote FTP server and CDN domain for university brochures, fee sheets, and media. Changes take effect immediately without needing server restarts or .env edits.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleTestStorage}
                    disabled={testingStorage}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold uppercase tracking-wider shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {testingStorage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{testingStorage ? 'Testing Connection...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Live Connection Test Banner */}
              {testResult && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">{testResult.success ? 'FTP Connection Successful' : 'FTP Connection Failed'}</p>
                    <p className="mt-0.5 opacity-90">{testResult.message}</p>
                  </div>
                </div>
              )}

              {/* Grid of Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Host */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2 md:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    SFTP / FTP Host (IP or Domain) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Server className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={storageSettings.sftp_host}
                      onChange={(e) => setStorageSettings({ ...storageSettings, sftp_host: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                      placeholder="e.g. 103.212.121.117 or ftp.domain.com"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">IP address or domain of the remote server hosting the files.</p>
                </div>

                {/* Port */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Port <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={storageSettings.sftp_port}
                    onChange={(e) => setStorageSettings({ ...storageSettings, sftp_port: parseInt(e.target.value, 10) || 21 })}
                    className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                    placeholder="21"
                  />
                  <p className="text-[11px] text-stone-400">Default standard port is 21.</p>
                </div>

                {/* Username */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    FTP Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={storageSettings.sftp_username}
                      onChange={(e) => setStorageSettings({ ...storageSettings, sftp_username: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                      placeholder="e.g. ftpimages@images.britannicaoverseas.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    FTP Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={storageSettings.sftp_password}
                      onChange={(e) => setStorageSettings({ ...storageSettings, sftp_password: e.target.value })}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Root Directory */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Remote Root Folder <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FolderOpen className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={storageSettings.sftp_root}
                      onChange={(e) => setStorageSettings({ ...storageSettings, sftp_root: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                      placeholder="/em/"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">Target root folder on the server (e.g. /em/).</p>
                </div>

                {/* CDN Base URL */}
                <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/70 space-y-2 md:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Public CDN / Remote URL Base <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="url"
                      required
                      value={storageSettings.remote_storage_cdn_url}
                      onChange={(e) => setStorageSettings({ ...storageSettings, remote_storage_cdn_url: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-2xs"
                      placeholder="https://www.images.britannicaoverseas.com/em"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400">Public CDN prefix used to serve uploaded documents to students and counsellors.</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-stone-500">
                  Settings are stored in the database and applied dynamically across all upload queues.
                </p>
                <button
                  type="submit"
                  disabled={submittingStorage}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#0f3e21] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingStorage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Save Storage Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
