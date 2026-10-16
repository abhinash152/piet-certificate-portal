import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, User, Building, AlertCircle, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function MentorLogin({ onSuccess, addToast }) {
  const { login, mentorRegister } = useAuth();
  
  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('AI&DS');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please provide both your College Gmail ID and password.');
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      // Allow the dev/fallback mentor accounts or any college email ending with @poornima.org
      if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail) && cleanEmail !== 'pietmentor' && cleanEmail !== 'mentor') {
        setError('Only official College Gmail IDs (@poornima.org) are permitted to sign in.');
        return;
      }

      setLoading(true);
      const res = await login(cleanEmail, password);
      setLoading(false);

      if (res.success) {
        if (addToast) addToast('Welcome to the PIET Mentor Assessment Dashboard!', 'success');
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
        if (addToast) addToast(res.message || 'Authentication failed', 'error');
      }
    } else {
      // Mentor Registration mode
      if (!fullName.trim() || !email.trim() || !password) {
        setError('Please fill in your Full Name, College Gmail ID, and Password.');
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(cleanEmail)) {
        setError('Registration restricted: You must register with an official College Gmail ID (@poornima.org).');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await mentorRegister({
        fullName: fullName.trim(),
        email: cleanEmail,
        department,
        password
      });
      setLoading(false);

      if (res.success) {
        if (addToast) addToast('Mentor account registered! Welcome to PIET Assessment Dashboard.', 'success');
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'Registration failed.');
        if (addToast) addToast(res.message || 'Could not register mentor account.', 'error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto my-4 sm:my-8 px-2 sm:px-0"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purpleBrand-500/10">
        
        {/* Mentor Header */}
        <div className="text-center mb-6">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purpleBrand-600 via-piet-600 to-piet-700 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purpleBrand-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-purpleBrand-600 dark:text-purpleBrand-400">
            Certificate Verification & Administration
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Mentor & Admin Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access for PIET faculty mentors to review, verify and export student achievement portfolios.
          </p>
        </div>

        {/* Mode Switcher: Sign In vs Sign Up */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-purpleBrand-600 dark:text-purpleBrand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Mentor Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-purpleBrand-600 dark:text-purpleBrand-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Mentor Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purpleBrand-500" />
                Faculty Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Dr. Sunita Sharma"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-purpleBrand-500 focus:ring-4 focus:ring-purpleBrand-500/20 text-slate-900 dark:text-white"
              />
            </motion.div>
          )}

          {/* College Gmail ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-purpleBrand-500" />
              College Gmail ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., mentor@piet.poornima.org"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-purpleBrand-500 focus:ring-4 focus:ring-purpleBrand-500/20 text-slate-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Restricted to official college domain (@poornima.org)
            </span>
          </div>

          {/* Branch (Sign Up only) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-purpleBrand-500" />
                Branch <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-purpleBrand-500 text-slate-900 dark:text-white"
              >
                {COLLEGE_CONFIG.branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name} ({b.short})</option>
                ))}
                <option value="All Branches">All Branches (Dean/HOD)</option>
              </select>
            </motion.div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purpleBrand-500" />
                Password <span className="text-rose-500">*</span>
              </span>
              <span className="text-[10px] text-slate-400">Min. 6 characters</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-purpleBrand-500 focus:ring-4 focus:ring-purpleBrand-500/20 text-slate-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purpleBrand-500" />
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-purpleBrand-500 focus:ring-4 focus:ring-purpleBrand-500/20 text-slate-900 dark:text-white"
              />
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-purpleBrand-600 via-piet-600 to-piet-700 text-white shadow-lg shadow-purpleBrand-500/25 hover:shadow-purpleBrand-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Register Mentor Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </motion.div>
  );
}
