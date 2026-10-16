import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Hash, Building, Users, Calendar, ArrowRight, Eye, EyeOff, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function StudentAuth({ onAuthenticated, addToast }) {
  const { studentLogin, studentRegister } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('AI&DS');
  const [section, setSection] = useState('A');
  const [currentYear, setCurrentYear] = useState('I st Year');
  const [passingYear, setPassingYear] = useState('2028');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please enter both your College Gmail ID and Password.');
        return;
      }

      if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(email.trim())) {
        setError('Only official college Gmail IDs (@poornima.org) are permitted to sign in.');
        return;
      }

      setLoading(true);
      const res = await studentLogin(email.trim(), password);
      setLoading(false);

      if (res.success) {
        addToast(res.message || 'Signed in successfully!', 'success');
        if (onAuthenticated) onAuthenticated();
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
        addToast(res.message || 'Invalid credentials.', 'error');
      }
    } else {
      // Registration validation
      if (!email.trim() || !password || !regNo.trim() || !name.trim()) {
        setError('Please fill in all required fields.');
        return;
      }

      if (!COLLEGE_CONFIG.emailValidation.isCollegeEmail(email.trim())) {
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
      const res = await studentRegister({
        email: email.trim(),
        password,
        regNo: regNo.trim().toUpperCase(),
        name: name.trim(),
        department,
        section,
        currentYear,
        passingYear
      });
      setLoading(false);

      if (res.success) {
        addToast('Student account created! Welcome to PIET Portal.', 'success');
        if (onAuthenticated) onAuthenticated();
      } else {
        setError(res.message || 'Registration failed.');
        addToast(res.message || 'Could not register student.', 'error');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto my-4 sm:my-8 px-2 sm:px-0"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-10 shadow-2xl shadow-piet-500/10">
        
        {/* College Crest & Header */}
        <div className="text-center mb-6">
          <img
            src={COLLEGE_CONFIG.logos.crest}
            alt="PIET Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 object-contain drop-shadow-md"
          />
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PIET Student Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Poornima Institute of Engineering & Technology • Autonomous
          </p>
        </div>

        {/* Toggle Mode: Sign In vs Register */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            New Student Signup
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* College Email ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-piet-500" />
              College Email ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., 2025pietad045@poornima.org"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 focus:ring-4 focus:ring-piet-500/20 text-slate-900 dark:text-white font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Restricted to official college domain (@poornima.org)
            </span>
          </div>

          {/* Registration Fields (Only in Register mode) */}
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Registration Number & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-piet-500" />
                    Reg No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g., PIET25ADxxx"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm uppercase font-mono tracking-wider focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-piet-500" />
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Branch, Current Year, Passing Year, Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Branch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Branch <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  >
                    {COLLEGE_CONFIG.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.short}</option>
                    ))}
                  </select>
                </div>

                {/* Current Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  >
                    {COLLEGE_CONFIG.currentYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                {/* Passing Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Yr <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  >
                    {COLLEGE_CONFIG.passingYears.map(pyr => (
                      <option key={pyr} value={pyr}>{pyr}</option>
                    ))}
                  </select>
                </div>

                {/* 8 Sections */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Section <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                  >
                    {COLLEGE_CONFIG.sections.map(sec => (
                      <option key={sec} value={sec}>Sec {sec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-piet-500" />
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
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-piet-500 focus:ring-4 focus:ring-piet-500/20 text-slate-900 dark:text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only in register mode) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-piet-500" />
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:border-piet-500 focus:ring-4 focus:ring-piet-500/20 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-piet-600 via-piet-700 to-purpleBrand-600 text-white shadow-lg shadow-piet-500/25 hover:shadow-piet-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Student Dashboard' : 'Create Account & Access Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

      </div>
    </motion.div>
  );
}
