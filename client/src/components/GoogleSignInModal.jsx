import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ArrowRight, CheckCircle2, User, Mail, Hash, Building } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

// Official multi-color Google SVG icon
export function GoogleIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function GoogleSignInModal({ isOpen, onClose, role = 'student', onSelectAccount }) {
  const [emailInput, setEmailInput] = useState('');
  const [fullNameInput, setFullNameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState('select'); // 'select' | 'manual' | 'complete_profile'

  // Profile completion state for new students
  const [completionData, setCompletionData] = useState({
    regNo: '',
    department: 'AI&DS',
    section: 'A',
    currentYear: 'I st Year',
    passingYear: '2028'
  });

  // Recent accounts saved in browser
  const [recentAccounts, setRecentAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('piet_recent_google_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed sensible defaults for quick testing
    return role === 'mentor'
      ? [
          { name: 'PIET Faculty Mentor', email: 'mentor@piet.poornima.org', avatarText: 'FM' }
        ]
      : [
          { name: 'PIET Student Account', email: '2025pietad045@poornima.org', avatarText: 'PS' }
        ];
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setViewState('select');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveRecentAccount = (name, email) => {
    try {
      const avatarText = name ? name.substring(0, 2).toUpperCase() : email.substring(0, 2).toUpperCase();
      const updated = [{ name, email, avatarText }, ...recentAccounts.filter(a => a.email !== email)].slice(0, 4);
      setRecentAccounts(updated);
      localStorage.setItem('piet_recent_google_accounts', JSON.stringify(updated));
    } catch {}
  };

  const handleAccountChosen = async (account) => {
    const cleanEmail = account.email.trim().toLowerCase();
    
    // Domain restriction check
    if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail)) {
      setError('Selected account is not a Poornima Google Workspace ID. Only official @poornima.org IDs are permitted.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      email: cleanEmail,
      name: account.name || cleanEmail.split('@')[0],
      ...(role === 'student' && viewState === 'complete_profile' ? completionData : {})
    };

    saveRecentAccount(payload.name, cleanEmail);

    const result = await onSelectAccount(payload);
    setLoading(false);

    if (result && result.needsProfileCompletion) {
      setEmailInput(cleanEmail);
      setFullNameInput(payload.name);
      setViewState('complete_profile');
      setError('');
    } else if (result && !result.success) {
      setError(result.message || 'Authentication with Google failed.');
    } else {
      onClose();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your College Gmail ID.');
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail)) {
      setError('Registration restricted: Only official College Gmail IDs (@poornima.org) are permitted.');
      return;
    }

    handleAccountChosen({
      email: cleanEmail,
      name: fullNameInput.trim() || cleanEmail.split('@')[0]
    });
  };

  const handleCompleteProfileSubmit = (e) => {
    e.preventDefault();
    if (!completionData.regNo.trim()) {
      setError('Please provide your Registration Number.');
      return;
    }

    handleAccountChosen({
      email: emailInput.trim().toLowerCase(),
      name: fullNameInput.trim() || emailInput.split('@')[0]
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header styled like Google OAuth picker */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <GoogleIcon className="w-6 h-6" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Sign in with Google
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {viewState === 'complete_profile'
                ? 'Complete Student Profile'
                : 'Choose a College Gmail Account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              to continue to <strong className="text-slate-700 dark:text-slate-300 font-semibold">{COLLEGE_CONFIG.portalName}</strong>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* VIEW 1: SELECT EXISTING OR RECENT COLLEGE ACCOUNT */}
            {viewState === 'select' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Select your College Gmail account:
                </div>

                {recentAccounts.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAccountChosen(acc)}
                    className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-piet-500 dark:hover:border-piet-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-3.5 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-piet-600 to-purpleBrand-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                      {acc.avatarText || 'PI'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-piet-600 dark:group-hover:text-piet-400 transition-colors">
                        {acc.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                        {acc.email}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-piet-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </button>
                ))}

                {/* Use Another Account Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError('');
                    setViewState('manual');
                  }}
                  className="w-full mt-2 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-piet-500 text-slate-700 dark:text-slate-300 hover:text-piet-600 dark:hover:text-piet-400 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Use another College Gmail account (@poornima.org)</span>
                </button>
              </div>
            )}

            {/* VIEW 2: MANUAL ENTRY OF COLLEGE GMAIL */}
            {viewState === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Legal Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-piet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-piet-500" />
                    College Gmail ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g., 2025pietad045@poornima.org"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-piet-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Must end with @poornima.org or @piet.poornima.org
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setViewState('select');
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-piet-600 hover:bg-piet-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: PROFILE COMPLETION (FOR NEW STUDENTS) */}
            {viewState === 'complete_profile' && (
              <form onSubmit={handleCompleteProfileSubmit} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
                  <p className="font-semibold">New student registration with Google account:</p>
                  <p className="font-mono mt-0.5">{emailInput}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-piet-500" />
                    Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={completionData.regNo}
                    onChange={(e) => setCompletionData({ ...completionData, regNo: e.target.value.toUpperCase() })}
                    placeholder="e.g., PIET25AD045"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={completionData.department}
                      onChange={(e) => setCompletionData({ ...completionData, department: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                    >
                      {COLLEGE_CONFIG.departments.map(d => (
                        <option key={d.id} value={d.id}>{d.short}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Section
                    </label>
                    <select
                      value={completionData.section}
                      onChange={(e) => setCompletionData({ ...completionData, section: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                    >
                      {COLLEGE_CONFIG.sections.map(s => (
                        <option key={s} value={s}>Section {s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-piet-600 to-purpleBrand-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Signup & Enter Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Poornima Trust & Privacy footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Poornima Institute of Engineering & Technology Authentication Gateway
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
