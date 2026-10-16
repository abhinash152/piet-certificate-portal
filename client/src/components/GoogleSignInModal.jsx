import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ArrowLeft, ArrowRight, MinusCircle, User, UserPlus, Globe } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

// Official multi-color Google "G" SVG icon
export function GoogleIcon({ className = "w-6 h-6" }) {
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

// Google User Circle Icon for "Use another account"
function GoogleUserCircleIcon() {
  return (
    <div className="w-8 h-8 rounded-full border border-[#747775] dark:border-[#8e918f] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5]">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

// Google Remove Account Icon for "Remove an account"
function GoogleRemoveAccountIcon() {
  return (
    <div className="w-8 h-8 rounded-full border border-[#747775] dark:border-[#8e918f] flex items-center justify-center text-[#444746] dark:text-[#c4c7c5]">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export function GoogleSignInModal({ isOpen, onClose, role = 'student', onSelectAccount }) {
  // Views: 'chooser' (the exact view in screenshot) | 'signin' | 'complete_profile'
  const [viewState, setViewState] = useState('chooser');
  const [isRemovingAccounts, setIsRemovingAccounts] = useState(false);

  // Form Fields for "Use another account"
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile completion state for new student
  const [completionData, setCompletionData] = useState({
    regNo: '',
    department: 'AI&DS',
    section: 'A',
    currentYear: 'I st Year',
    passingYear: '2028'
  });

  // Stored accounts in localStorage (no dummy accounts)
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('piet_google_accounts_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(false);
      setViewState(accounts.length > 0 ? 'chooser' : 'signin');
      setIsRemovingAccounts(false);
      setEmailInput('');
      setNameInput('');
    }
  }, [isOpen, accounts.length]);

  if (!isOpen) return null;

  const saveAccountsToStorage = (updated) => {
    setAccounts(updated);
    try {
      localStorage.setItem('piet_google_accounts_list', JSON.stringify(updated));
    } catch {}
  };

  const removeAccount = (e, emailToRemove) => {
    e.stopPropagation();
    const updated = accounts.filter(a => a.email !== emailToRemove);
    saveAccountsToStorage(updated);
  };

  const handleSelectAccount = async (account) => {
    const cleanEmail = account.email.trim().toLowerCase();

    // Check college domain
    if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail)) {
      setError('Selected account is not a Poornima Google Workspace account. You must sign in using your official @poornima.org ID.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      email: cleanEmail,
      name: account.name || cleanEmail.split('@')[0],
      ...(role === 'student' && viewState === 'complete_profile' ? completionData : {})
    };

    // Add/Update to accounts list
    const existingIdx = accounts.findIndex(a => a.email === cleanEmail);
    let updated;
    if (existingIdx >= 0) {
      updated = [...accounts];
      updated[existingIdx] = { ...updated[existingIdx], name: payload.name };
    } else {
      updated = [
        {
          name: payload.name,
          email: cleanEmail,
          initial: (payload.name[0] || cleanEmail[0] || 'P').toUpperCase(),
          bg: 'bg-[#0288d1]'
        },
        ...accounts
      ];
    }
    saveAccountsToStorage(updated);

    const result = await onSelectAccount(payload);
    setLoading(false);

    if (result && result.needsProfileCompletion) {
      setEmailInput(cleanEmail);
      setNameInput(payload.name);
      setViewState('complete_profile');
      setError('');
    } else if (result && !result.success) {
      setError(result.message || 'Google authentication failed.');
    } else {
      onClose();
    }
  };

  const handleManualNext = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Enter an email address');
      return;
    }

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail)) {
      setError('Couldn\'t find your Poornima Google Account. PIET Portal requires an official @poornima.org college ID.');
      return;
    }

    handleSelectAccount({
      email: cleanEmail,
      name: nameInput.trim() || cleanEmail.split('@')[0]
    });
  };

  const handleCompleteProfile = (e) => {
    e.preventDefault();
    if (!completionData.regNo.trim()) {
      setError('Please enter your Registration Number.');
      return;
    }

    handleSelectAccount({
      email: emailInput.trim().toLowerCase(),
      name: nameInput.trim() || emailInput.split('@')[0]
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#1e1f20] border border-[#dadce0] dark:border-[#444746] rounded-[28px] shadow-2xl w-full max-w-2xl overflow-hidden relative my-auto text-[#1f1f1f] dark:text-[#e3e3e3]"
        >
          {/* Close Modal button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 p-2 text-[#444746] dark:text-[#c4c7c5] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2f31] rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* VIEW 1: EXACT GOOGLE "CHOOSE AN ACCOUNT" LAYOUT (MATCHING USER SCREENSHOT) */}
          {viewState === 'chooser' && (
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                
                {/* Left Column: Google G Logo & "Choose an account" Title */}
                <div className="md:col-span-5 flex flex-col justify-start">
                  <div className="mb-4">
                    <GoogleIcon className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug">
                    Choose an account
                  </h2>
                  <p className="text-sm text-[#444746] dark:text-[#c4c7c5] mt-2">
                    to continue to <span className="font-medium text-[#1f1f1f] dark:text-white">Poornima Certificate Portal</span>
                  </p>
                  <div className="mt-4 hidden md:block">
                    <span className="text-[11px] font-medium text-[#0b57d0] dark:text-[#a8c7fa] bg-[#ecf3fe] dark:bg-[#004a77]/30 px-2.5 py-1 rounded-full border border-[#c2e7ff] dark:border-[#004a77]">
                      @poornima.org verified
                    </span>
                  </div>
                </div>

                {/* Right Column: Account List (Exact match to screenshot) */}
                <div className="md:col-span-7 flex flex-col justify-center">
                  
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-[#fdeded] dark:bg-[#3c1e1e] border border-[#f5c2c7] dark:border-[#842029] text-[#b3261e] dark:text-[#f2b8b5] text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="border-t border-[#dadce0] dark:border-[#444746]">
                    
                    {/* Render saved accounts */}
                    {accounts.map((acc, index) => (
                      <div
                        key={index}
                        onClick={() => !isRemovingAccounts && handleSelectAccount(acc)}
                        className={`flex items-center justify-between py-3.5 px-3 border-b border-[#dadce0] dark:border-[#444746] transition-colors ${
                          isRemovingAccounts
                            ? 'bg-rose-50/40 dark:bg-rose-950/20'
                            : 'hover:bg-[#f8f9fa] dark:hover:bg-[#282a2c] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Circular avatar initial */}
                          <div className={`w-9 h-9 rounded-full ${acc.bg || 'bg-[#78909c]'} text-white font-medium text-sm flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            {acc.initial || acc.name?.[0] || 'C'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#1f1f1f] dark:text-[#e3e3e3] truncate">
                              {acc.name}
                            </p>
                            <p className="text-xs text-[#444746] dark:text-[#c4c7c5] font-normal truncate">
                              {acc.email}
                            </p>
                          </div>
                        </div>

                        {/* Status label: "Signed out" or Remove button */}
                        {isRemovingAccounts ? (
                          <button
                            type="button"
                            onClick={(e) => removeAccount(e, acc.email)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-100 rounded-full transition-colors"
                            title="Remove account from list"
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-xs text-[#5f6368] dark:text-[#8e918f] font-normal flex-shrink-0 pl-2">
                            Signed out
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Option: "Use another account" */}
                    <div
                      onClick={() => {
                        setError('');
                        setViewState('signin');
                      }}
                      className="flex items-center gap-3.5 py-3.5 px-3 border-b border-[#dadce0] dark:border-[#444746] hover:bg-[#f8f9fa] dark:hover:bg-[#282a2c] transition-colors cursor-pointer"
                    >
                      <GoogleUserCircleIcon />
                      <span className="text-sm font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">
                        Use another account
                      </span>
                    </div>

                    {/* Option: "Remove an account" */}
                    <div
                      onClick={() => {
                        if (accounts.length > 0) {
                          setIsRemovingAccounts(!isRemovingAccounts);
                        }
                      }}
                      className="flex items-center gap-3.5 py-3.5 px-3 border-b border-[#dadce0] dark:border-[#444746] hover:bg-[#f8f9fa] dark:hover:bg-[#282a2c] transition-colors cursor-pointer"
                    >
                      <GoogleRemoveAccountIcon />
                      <span className="text-sm font-medium text-[#1f1f1f] dark:text-[#e3e3e3]">
                        {isRemovingAccounts ? 'Done removing accounts' : 'Remove an account'}
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: GOOGLE "SIGN IN" INPUT VIEW (WHEN "USE ANOTHER ACCOUNT" IS CLICKED) */}
          {viewState === 'signin' && (
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                
                {/* Left Column */}
                <div className="md:col-span-5 flex flex-col justify-start">
                  <div className="mb-4">
                    <GoogleIcon className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug">
                    Sign in
                  </h2>
                  <p className="text-sm text-[#444746] dark:text-[#c4c7c5] mt-2">
                    with your Google College Account
                  </p>
                  <p className="text-xs text-[#0b57d0] dark:text-[#a8c7fa] mt-3 font-medium">
                    Only @poornima.org email addresses allowed
                  </p>
                </div>

                {/* Right Column: Email input field & Next button */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <form onSubmit={handleManualNext} className="space-y-4">
                    
                    {error && (
                      <div className="p-3 rounded-xl bg-[#fdeded] dark:bg-[#3c1e1e] border border-[#f5c2c7] dark:border-[#842029] text-[#b3261e] dark:text-[#f2b8b5] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1.5">
                        Your Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="w-full px-4 py-3 rounded-lg border border-[#747775] dark:border-[#8e918f] focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#0b57d0] bg-transparent text-sm outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1.5">
                        College Gmail ID
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. 2025pietad045@poornima.org"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-[#747775] dark:border-[#8e918f] focus:border-[#0b57d0] dark:focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#0b57d0] bg-transparent text-sm outline-none transition-all font-mono"
                      />
                      <p className="text-[11px] text-[#5f6368] dark:text-[#8e918f] mt-1.5">
                        Must end with @poornima.org
                      </p>
                    </div>

                    {/* Google Action Bar with "Create account" and "Next" blue pill */}
                    <div className="flex items-center justify-between pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setViewState('chooser');
                        }}
                        className="text-xs sm:text-sm font-medium text-[#0b57d0] dark:text-[#a8c7fa] hover:underline cursor-pointer"
                      >
                        Back to accounts
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#0b57d0] hover:bg-[#1a73e8] active:bg-[#0842a0] text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Next</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            </div>
          )}

          {/* VIEW 3: NEW STUDENT COMPLETION VIEW */}
          {viewState === 'complete_profile' && (
            <div className="p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                
                <div className="md:col-span-5 flex flex-col justify-start">
                  <div className="mb-4">
                    <GoogleIcon className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl sm:text-[28px] font-normal tracking-tight text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug">
                    Almost done!
                  </h2>
                  <p className="text-sm text-[#444746] dark:text-[#c4c7c5] mt-2">
                    Enter your PIET academic details to finish registering your account.
                  </p>
                  <p className="text-xs text-[#5f6368] dark:text-[#8e918f] mt-3 font-mono">
                    {emailInput}
                  </p>
                </div>

                <div className="md:col-span-7">
                  <form onSubmit={handleCompleteProfile} className="space-y-4">
                    
                    {error && (
                      <div className="p-3 rounded-xl bg-[#fdeded] dark:bg-[#3c1e1e] border border-[#f5c2c7] dark:border-[#842029] text-[#b3261e] dark:text-[#f2b8b5] text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        value={completionData.regNo}
                        onChange={(e) => setCompletionData({ ...completionData, regNo: e.target.value.toUpperCase() })}
                        placeholder="e.g. PIET25AD045"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-[#747775] dark:border-[#8e918f] focus:border-[#0b57d0] bg-transparent text-sm uppercase font-mono outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1">
                          Department
                        </label>
                        <select
                          value={completionData.department}
                          onChange={(e) => setCompletionData({ ...completionData, department: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[#747775] dark:border-[#8e918f] bg-transparent text-xs sm:text-sm outline-none"
                        >
                          {COLLEGE_CONFIG.departments.map(d => (
                            <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.short}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#444746] dark:text-[#c4c7c5] mb-1">
                          Section
                        </label>
                        <select
                          value={completionData.section}
                          onChange={(e) => setCompletionData({ ...completionData, section: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-[#747775] dark:border-[#8e918f] bg-transparent text-xs sm:text-sm outline-none"
                        >
                          {COLLEGE_CONFIG.sections.map(s => (
                            <option key={s} value={s} className="dark:bg-slate-900">Section {s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-full font-medium text-sm bg-[#0b57d0] hover:bg-[#1a73e8] text-white shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Complete Sign In</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>

              </div>
            </div>
          )}

          {/* Bottom Footer (Matching Google standard footer) */}
          <div className="px-6 sm:px-10 py-3.5 bg-[#f8f9fa] dark:bg-[#18191a] border-t border-[#dadce0] dark:border-[#444746] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5f6368] dark:text-[#8e918f]">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#1f1f1f] dark:hover:text-white transition-colors">
              <Globe className="w-3.5 h-3.5" />
              <span>English (United States)</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-[#1f1f1f] dark:hover:text-white cursor-pointer">Help</span>
              <span className="hover:text-[#1f1f1f] dark:hover:text-white cursor-pointer">Privacy</span>
              <span className="hover:text-[#1f1f1f] dark:hover:text-white cursor-pointer">Terms</span>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
