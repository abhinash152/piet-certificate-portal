import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, AlertCircle, Building, Users, Hash, UserCheck, Sparkles, BookOpen, Calendar } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import axios from 'axios';

export function StudentDetailsStep({ studentData, setStudentData, onContinue, addToast }) {
  const [touched, setTouched] = useState({
    department: false,
    section: false,
    regNo: false,
    name: false
  });

  const [existingStudentInfo, setExistingStudentInfo] = useState(null);
  const [checkingRegNo, setCheckingRegNo] = useState(false);

  // Validation rules
  const isDeptValid = Boolean(studentData.department);
  const isSectionValid = Boolean(studentData.section);
  const isRegNoValid = Boolean(
    studentData.regNo && COLLEGE_CONFIG.regNo.regex.test(studentData.regNo.trim())
  );
  const isNameValid = Boolean(studentData.name && studentData.name.trim().length >= 2);

  const isFormValid = isDeptValid && isSectionValid && isRegNoValid && isNameValid;

  // Auto-check if student exists in database when valid regNo is typed
  useEffect(() => {
    if (isRegNoValid) {
      const cleanReg = studentData.regNo.trim().toUpperCase();
      setCheckingRegNo(true);
      const timer = setTimeout(() => {
        axios.get(`/api/students/${cleanReg}`)
          .then(res => {
            if (res.data.exists && res.data.student) {
              setExistingStudentInfo(res.data.student);
              // Pre-fill name and department/section if not already chosen
              setStudentData(prev => ({
                ...prev,
                name: prev.name || res.data.student.name,
                department: prev.department || res.data.student.department,
                section: prev.section || res.data.student.section,
                email: prev.email || res.data.student.email || ''
              }));
            } else {
              setExistingStudentInfo(null);
            }
          })
          .catch(() => setExistingStudentInfo(null))
          .finally(() => setCheckingRegNo(false));
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setExistingStudentInfo(null);
    }
  }, [studentData.regNo]);

  const handleChange = (field, value) => {
    setStudentData(prev => ({
      ...prev,
      [field]: field === 'regNo' ? value.toUpperCase().replace(/\s/g, '') : value
    }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ department: true, section: true, regNo: true, name: true });

    if (!isFormValid) {
      addToast('Please complete all required fields correctly before continuing.', 'error');
      return;
    }

    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50">
        
        {/* Step Banner */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-piet-50 text-piet-700 dark:bg-piet-900/40 dark:text-piet-300 border border-piet-200 dark:border-piet-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 1 of 3 • Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Identification
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Provide your official PIET academic details to organize your certificate dossier for internal assessment.
          </p>
        </div>

        {/* Existing student alert pill */}
        {existingStudentInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3"
          >
            <UserCheck className="w-5 h-5 text-piet-600 dark:text-piet-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Welcome back, {existingStudentInfo.name}!
              </span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                We located your profile. You have already submitted{' '}
                <strong className="text-piet-600 dark:text-piet-400">
                  {existingStudentInfo.stats?.total_count || 0}
                </strong>{' '}
                certificate(s). Any new uploads will be appended to your record.
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Registration Number Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-piet-500" />
                Registration Number <span className="text-rose-500">*</span>
              </span>
              {checkingRegNo && (
                <span className="text-xs text-slate-400 animate-pulse">Checking records...</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentData.regNo}
                onChange={(e) => handleChange('regNo', e.target.value)}
                onBlur={() => handleBlur('regNo')}
                placeholder={COLLEGE_CONFIG.regNo.placeholder}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-mono tracking-wider transition-all uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-4 ${
                  touched.regNo && !isRegNoValid
                    ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                    : touched.regNo && isRegNoValid
                    ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-piet-500 focus:ring-piet-500/20 text-slate-900 dark:text-white'
                }`}
              />
              {touched.regNo && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  {isRegNoValid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
              )}
            </div>
            <p className={`text-xs mt-1.5 ${
              touched.regNo && !isRegNoValid ? 'text-rose-500 font-medium' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {touched.regNo && !isRegNoValid
                ? COLLEGE_CONFIG.regNo.errorMessage
                : COLLEGE_CONFIG.regNo.formatHelper}
            </p>
          </div>

          {/* Student Full Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-piet-500" />
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={studentData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g., Aarav Sharma"
              className={`w-full px-4 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-4 ${
                touched.name && !isNameValid
                  ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-piet-500 focus:ring-piet-500/20 text-slate-900 dark:text-white'
              }`}
            />
            {touched.name && !isNameValid && (
              <p className="text-xs text-rose-500 mt-1 font-medium">Please enter your legal name as on college ID.</p>
            )}
          </div>

          {/* Department & Section Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Department Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Building className="w-4 h-4 text-piet-500" />
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                onBlur={() => handleBlur('department')}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-4 appearance-none bg-no-repeat bg-[right_1rem_center] ${
                  touched.department && !isDeptValid
                    ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-piet-500 focus:ring-piet-500/20 text-slate-900 dark:text-white'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: '1.25rem'
                }}
              >
                <option value="">Select Department</option>
                {COLLEGE_CONFIG.departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.label} ({dept.short})
                  </option>
                ))}
              </select>
              {touched.department && !isDeptValid && (
                <p className="text-xs text-rose-500 mt-1 font-medium">Please select your enrolled department.</p>
              )}
            </div>

            {/* Section Dropdown (8 Sections: A to H) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Users className="w-4 h-4 text-piet-500" />
                Section (8 Sections: A to H) <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                onBlur={() => handleBlur('section')}
                className={`w-full px-4 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-4 appearance-none bg-no-repeat bg-[right_1rem_center] ${
                  touched.section && !isSectionValid
                    ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:border-piet-500 focus:ring-piet-500/20 text-slate-900 dark:text-white'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundSize: '1.25rem'
                }}
              >
                <option value="">Select Section</option>
                {COLLEGE_CONFIG.sections.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
              {touched.section && !isSectionValid && (
                <p className="text-xs text-rose-500 mt-1 font-medium">Please select your section.</p>
              )}
            </div>

          </div>

          {/* Current Year Selection (I st, II nd, III rd, IV th) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-piet-500" />
              Current Year <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {COLLEGE_CONFIG.currentYears.map((yr) => {
                const isSelected = (studentData.currentYear || 'I st Year') === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => handleChange('currentYear', yr)}
                    className={`py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all text-center ${
                      isSelected
                        ? 'border-piet-500 bg-piet-50 dark:bg-piet-950/60 text-piet-700 dark:text-piet-300 shadow-sm ring-2 ring-piet-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 ${
                isFormValid
                  ? 'bg-gradient-to-r from-piet-600 via-piet-700 to-purpleBrand-600 text-white shadow-piet-500/30 hover:shadow-piet-500/50 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Continue to Upload Certificates</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {!isFormValid && (
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                Fill in valid Department, Section, Name and Registration Number to enable Continue.
              </p>
            )}
          </div>

        </form>

      </div>
    </motion.div>
  );
}
