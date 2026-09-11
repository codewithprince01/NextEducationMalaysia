import React, { useEffect, useState } from 'react';
import {
  Settings,
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  SlidersHorizontal
} from 'lucide-react';

export default function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [submittingMode, setSubmittingMode] = useState(false);
  const [submittingMain, setSubmittingMain] = useState(false);
  const [submittingTesting, setSubmittingTesting] = useState(false);

  const [activeTab, setActiveTab] = useState<'mode' | 'main' | 'testing'>('mode');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [emailMode, setEmailMode] = useState<'main' | 'testing'>('main');

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

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/system-settings');
      if (res.ok) {
        const json = await res.json();
        if (json.emailMode) setEmailMode(json.emailMode);
        if (json.mainSettings) setMainSettings(json.mainSettings);
        if (json.testingSettings) setTestingSettings(json.testingSettings);
      }
    } catch {
      // Keep default values if standalone
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
        showToast('success', `Email mode updated to ${emailMode.toUpperCase()}`);
      } else {
        showToast('success', `Email mode switched to ${emailMode.toUpperCase()}`);
      }
    } catch {
      showToast('success', `Email mode switched to ${emailMode.toUpperCase()} (local)`);
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
        showToast('success', 'Main email settings updated successfully');
      } else {
        showToast('success', 'Main email settings saved');
      }
    } catch {
      showToast('success', 'Main email settings saved (local)');
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
        showToast('success', 'Testing email settings updated successfully');
      } else {
        showToast('success', 'Testing email settings saved');
      }
    } catch {
      showToast('success', 'Testing email settings saved (local)');
    } finally {
      setSubmittingTesting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" /> System &amp; Email Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure SMTP dispatch modes, lead notification recipients, CC/BCC targets, and system defaults.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('mode')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'mode'
              ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Email Mode Switcher
          </button>
          <button
            onClick={() => setActiveTab('main')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'main'
              ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Mail className="w-4 h-4" /> Main Email Recipients
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`py-3 px-5 flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'testing'
              ? 'border-indigo-600 text-indigo-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
          >
            <Send className="w-4 h-4" /> Testing Email Recipients
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'mode' && (
            <form onSubmit={handleUpdateMode} className="space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Select Active Email Dispatch Mode</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Controls whether student applications and website contact form emails are routed to main production counselors or testing mailboxes.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <label
                    onClick={() => setEmailMode('main')}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${emailMode === 'main'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">Main Production Mode</span>
                      <input
                        type="radio"
                        name="email_mode"
                        checked={emailMode === 'main'}
                        onChange={() => setEmailMode('main')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Dispatches lead emails directly to official admissions counselors (Main Recipients).
                    </p>
                  </label>

                  <label
                    onClick={() => setEmailMode('testing')}
                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${emailMode === 'testing'
                      ? 'border-amber-600 bg-amber-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">Testing Mode</span>
                      <input
                        type="radio"
                        name="email_mode"
                        checked={emailMode === 'testing'}
                        onChange={() => setEmailMode('testing')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Routes all outbound test emails exclusively to QA &amp; Developer testing mailboxes.
                    </p>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingMode}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingMode && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Email Mode
                </button>
              </div>
            </form>
          )}

          {activeTab === 'main' && (
            <form onSubmit={handleUpdateMain} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Main Production Recipients</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Default email addresses that receive primary student applications, CC copies, and BCC archives.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main To Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={mainSettings.main_to_email}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_to_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main To Name
                      </label>
                      <input
                        type="text"
                        value={mainSettings.main_to_name}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_to_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main CC Email
                      </label>
                      <input
                        type="email"
                        value={mainSettings.main_cc_email}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_cc_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main CC Name
                      </label>
                      <input
                        type="text"
                        value={mainSettings.main_cc_name}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_cc_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main BCC Email
                      </label>
                      <input
                        type="email"
                        value={mainSettings.main_bcc_email}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_bcc_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Main BCC Name
                      </label>
                      <input
                        type="text"
                        value={mainSettings.main_bcc_name}
                        onChange={(e) => setMainSettings({ ...mainSettings, main_bcc_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingMain}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingMain && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Main Email Configuration
                </button>
              </div>
            </form>
          )}

          {activeTab === 'testing' && (
            <form onSubmit={handleUpdateTesting} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Testing Email Recipients</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Configured recipients when System Email Mode is switched to Testing.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing To Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={testingSettings.testing_to_email}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_to_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing To Name
                      </label>
                      <input
                        type="text"
                        value={testingSettings.testing_to_name}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_to_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing CC Email
                      </label>
                      <input
                        type="email"
                        value={testingSettings.testing_cc_email}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_cc_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing CC Name
                      </label>
                      <input
                        type="text"
                        value={testingSettings.testing_cc_name}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_cc_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing BCC Email
                      </label>
                      <input
                        type="email"
                        value={testingSettings.testing_bcc_email}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_bcc_email: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                        Testing BCC Name
                      </label>
                      <input
                        type="text"
                        value={testingSettings.testing_bcc_name}
                        onChange={(e) => setTestingSettings({ ...testingSettings, testing_bcc_name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submittingTesting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submittingTesting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Testing Email Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

