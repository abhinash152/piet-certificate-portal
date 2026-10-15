import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Globe, ArrowLeft, ArrowUpRight, UploadCloud, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { FileDropzone } from './FileDropzone';
import { FileCard } from './FileCard';
import axios from 'axios';

export function UploadCertificatesStep({
  studentData,
  withinFiles,
  setWithinFiles,
  outsideFiles,
  setOutsideFiles,
  onBack,
  onFinalSuccess,
  addToast
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  const totalFilesCount = withinFiles.length + outsideFiles.length;

  // Handlers for Within College files
  const handleAddWithinFiles = (newItems) => {
    setWithinFiles((prev) => [...prev, ...newItems]);
  };

  const handleUpdateWithin = (id, updates) => {
    setWithinFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, error: null } : item))
    );
  };

  const handleRemoveWithin = (id) => {
    setWithinFiles((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Handlers for Outside College files
  const handleAddOutsideFiles = (newItems) => {
    setOutsideFiles((prev) => [...prev, ...newItems]);
  };

  const handleUpdateOutside = (id, updates) => {
    setOutsideFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, error: null } : item))
    );
  };

  const handleRemoveOutside = (id) => {
    setOutsideFiles((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  // Final Submit Handler
  const handleFinalSubmit = async () => {
    if (totalFilesCount === 0) {
      addToast('Please upload at least one certificate before submitting.', 'warning');
      return;
    }

    // Validate that all files have titles
    let hasTitleError = false;
    const validatedWithin = withinFiles.map((item) => {
      if (!item.title || !item.title.trim()) {
        hasTitleError = true;
        return { ...item, error: 'Title is required for this certificate.' };
      }
      return item;
    });

    const validatedOutside = outsideFiles.map((item) => {
      if (!item.title || !item.title.trim()) {
        hasTitleError = true;
        return { ...item, error: 'Title is required for this certificate.' };
      }
      return item;
    });

    if (hasTitleError) {
      setWithinFiles(validatedWithin);
      setOutsideFiles(validatedOutside);
      addToast('Please provide a title for all uploaded certificates.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);
    setUploadStage('Hashing files & verifying authenticity...');

    try {
      const formData = new FormData();
      formData.append('regNo', studentData.regNo);
      formData.append('name', studentData.name);
      formData.append('department', studentData.department);
      formData.append('section', studentData.section);
      formData.append('currentYear', studentData.currentYear || 'I st Year');
      formData.append('academicYear', studentData.currentYear || 'I st Year');
      formData.append('email', studentData.email || '');

      const certificatesMeta = [];

      // Append Within College files
      for (const item of withinFiles) {
        formData.append('files', item.file);
        certificatesMeta.push({
          category: 'within',
          title: item.title.trim(),
          issueDate: item.issueDate || null,
          description: item.description?.trim() || null
        });
      }

      // Append Outside College files
      for (const item of outsideFiles) {
        formData.append('files', item.file);
        certificatesMeta.push({
          category: 'outside',
          title: item.title.trim(),
          issueDate: item.issueDate || null,
          description: item.description?.trim() || null
        });
      }

      formData.append('certificatesMeta', JSON.stringify(certificatesMeta));

      setUploadStage('Uploading certificates to secure PIET archive...');

      const response = await axios.post('/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(Math.max(15, percent));
          }
        }
      });

      setUploadProgress(100);
      setUploadStage('Verified & saved successfully!');

      if (response.data.success) {
        setTimeout(() => {
          onFinalSuccess(response.data.summary);
        }, 500);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      const errorMsg =
        err.response?.data?.message || 'Failed to submit certificates. Please try again.';
      addToast(errorMsg, 'error');
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Student context summary banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-piet-600 to-purpleBrand-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-piet-500/20">
            {studentData.section}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {studentData.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300 font-mono tracking-wider">{studentData.regNo}</strong> • Department of {studentData.department} • Section {studentData.section}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400">Total Selected</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {totalFilesCount} certificate{totalFilesCount === 1 ? '' : 's'}
            </p>
          </div>
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Within College Certificates */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-200/70 dark:border-blue-900/40 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/5">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  1. Certificates Earned Within the College
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {withinFiles.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Workshops, fests (AURA, Poornima TechFest), department events, internal hackathons & club competitions.
              </p>
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <FileDropzone
          onFilesSelected={handleAddWithinFiles}
          categoryTitle="Within the College"
          categoryBadge="Within College"
          badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-300 dark:border-blue-800"
          addToast={addToast}
        />

        {/* File Cards List */}
        {withinFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Within College Certificates ({withinFiles.length})
            </p>
            <AnimatePresence>
              {withinFiles.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => handleUpdateWithin(item.id, updates)}
                  onRemove={() => handleRemoveWithin(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* SECTION 2: Outside College Certificates */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-purple-200/70 dark:border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5">
        
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  2. Certificates Earned Outside the College
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {outsideFiles.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                National hackathons (SIH), NPTEL, Coursera, industry internships, IEEE papers & external tech competitions.
              </p>
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <FileDropzone
          onFilesSelected={handleAddOutsideFiles}
          categoryTitle="Outside the College"
          categoryBadge="Outside College"
          badgeColor="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-300 dark:border-purple-800"
          addToast={addToast}
        />

        {/* File Cards List */}
        {outsideFiles.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outside College Certificates ({outsideFiles.length})
            </p>
            <AnimatePresence>
              {outsideFiles.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => handleUpdateOutside(item.id, updates)}
                  onRemove={() => handleRemoveOutside(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Progress Bar Modal/Bar (Shown during submission) */}
      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-piet-500 animate-ping inline-block" />
              {uploadStage}
            </span>
            <span className="font-mono font-bold text-piet-400">{uploadProgress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-piet-500 via-piet-400 to-purpleBrand-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center">
            Encrypting files and verifying duplicate SHA-256 signatures... Please do not close this window.
          </p>
        </motion.div>
      )}

      {/* Navigation Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-semibold text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 1</span>
        </button>

        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isSubmitting || totalFilesCount === 0}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg transition-all duration-200 ${
            totalFilesCount > 0 && !isSubmitting
              ? 'bg-gradient-to-r from-piet-600 via-piet-700 to-purpleBrand-600 text-white shadow-piet-500/30 hover:shadow-piet-500/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Certificates...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Final Submit ({totalFilesCount} Certificate{totalFilesCount === 1 ? '' : 's'})</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
