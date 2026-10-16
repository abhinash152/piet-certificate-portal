import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  GraduationCap,
  Trophy,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Edit3,
  Trash2,
  PlusCircle,
  ExternalLink,
  Printer,
  Calendar,
  X,
  Sparkles,
  FileText,
  Search,
  Filter,
  Users,
  BookOpen,
  ShieldCheck,
  FileCheck,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { CertificateViewerModal } from './CertificateViewerModal';
import { getFileUrl } from '../utils/urlUtils';
import axios from 'axios';

export function StudentDashboard({ onStartUpload, addToast }) {
  const { student, studentToken, studentLogout } = useAuth();

  // Active Main View: 'my_portfolio' or 'peer_showcase'
  const [mainViewMode, setMainViewMode] = useState('my_portfolio');

  // --- MY PORTFOLIO STATE ---
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'academic', 'non_academic'

  // Quick Upload Box 1: Academic Box State
  const [academicEvent, setAcademicEvent] = useState('');
  const [academicCustomName, setAcademicCustomName] = useState('');
  const [academicDate, setAcademicDate] = useState('');
  const [academicFile, setAcademicFile] = useState(null);
  const [academicUploading, setAcademicUploading] = useState(false);
  const academicFileInputRef = useRef(null);

  // Quick Upload Box 2: Non-Academic Box State
  const [nonAcademicEvent, setNonAcademicEvent] = useState('');
  const [nonAcademicCustomName, setNonAcademicCustomName] = useState('');
  const [nonAcademicDate, setNonAcademicDate] = useState('');
  const [nonAcademicFile, setNonAcademicFile] = useState(null);
  const [nonAcademicUploading, setNonAcademicUploading] = useState(false);
  const nonAcademicFileInputRef = useRef(null);

  // Preview Modal State
  const [previewCert, setPreviewCert] = useState(null);
  const [isPeerPreview, setIsPeerPreview] = useState(false);

  // Edit Certificate Modal State
  const [editingCert, setEditingCert] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // --- PEER SHOWCASE STATE (READ-ONLY) ---
  const [peerCertificates, setPeerCertificates] = useState([]);
  const [peerLoading, setPeerLoading] = useState(false);
  const [peerSearch, setPeerSearch] = useState('');
  const [peerDept, setPeerDept] = useState('ALL');
  const [peerSection, setPeerSection] = useState('ALL');
  const [peerYear, setPeerYear] = useState('ALL');
  const [peerCategory, setPeerCategory] = useState('ALL');

  // Fetch Student Profile & Own Certificates
  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/students/me', {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.data.success) {
        setStudentData(res.data.student);
        setCertificates(res.data.certificates || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
      addToast('Could not load student data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Peer Certificates (Read-Only)
  const fetchPeerCertificates = async () => {
    setPeerLoading(true);
    try {
      const params = {};
      if (peerDept !== 'ALL') params.department = peerDept;
      if (peerSection !== 'ALL') params.section = peerSection;
      if (peerYear !== 'ALL') params.currentYear = peerYear;
      if (peerCategory !== 'ALL') params.category = peerCategory;
      if (peerSearch.trim()) params.search = peerSearch.trim();

      const res = await axios.get('/api/students/peers/showcase', {
        params,
        headers: { Authorization: `Bearer ${studentToken}` }
      });

      if (res.data.success) {
        setPeerCertificates(res.data.certificates || []);
      }
    } catch (err) {
      console.error('Error fetching peer certificates:', err);
      addToast('Could not load peer certificates.', 'error');
    } finally {
      setPeerLoading(false);
    }
  };

  useEffect(() => {
    if (studentToken) {
      fetchStudentData();
    }
  }, [studentToken]);

  useEffect(() => {
    if (mainViewMode === 'peer_showcase') {
      fetchPeerCertificates();
    }
  }, [mainViewMode, peerDept, peerSection, peerYear, peerCategory, peerSearch]);

  // Handle Quick Upload from Academic Box
  const handleUploadAcademic = async () => {
    if (!academicEvent) {
      addToast('Please select an event name from the dropdown.', 'warning');
      return;
    }
    const finalTitle = academicEvent === 'Others' ? academicCustomName.trim() : academicEvent;
    if (!finalTitle) {
      addToast('Please write your event name.', 'warning');
      return;
    }
    if (!academicFile) {
      addToast('Please select a certificate file to upload.', 'warning');
      return;
    }

    setAcademicUploading(true);
    try {
      const formData = new FormData();
      formData.append('regNo', studentData?.reg_no || student?.reg_no);
      formData.append('name', studentData?.name || student?.name);
      formData.append('department', studentData?.department || student?.department);
      formData.append('section', studentData?.section || student?.section);
      formData.append('currentYear', studentData?.current_year || student?.current_year || 'I st Year');
      formData.append('passingYear', studentData?.passing_year || student?.passing_year || '2026');
      formData.append('email', studentData?.email || student?.email || '');

      formData.append('files', academicFile);
      formData.append(
        'certificatesMeta',
        JSON.stringify([
          {
            category: 'academic',
            title: finalTitle,
            issueDate: academicDate || null,
            description: null
          }
        ])
      );

      const res = await axios.post('/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${studentToken}`
        }
      });

      if (res.data.success) {
        addToast('Academic certificate uploaded successfully!', 'success');
        setAcademicEvent('');
        setAcademicCustomName('');
        setAcademicDate('');
        setAcademicFile(null);
        if (academicFileInputRef.current) academicFileInputRef.current.value = '';
        fetchStudentData();
      }
    } catch (err) {
      console.error('Academic upload failed:', err);
      addToast(err.response?.data?.message || 'Failed to upload certificate.', 'error');
    } finally {
      setAcademicUploading(false);
    }
  };

  // Handle Quick Upload from Non-Academic Box
  const handleUploadNonAcademic = async () => {
    if (!nonAcademicEvent) {
      addToast('Please select an event name from the dropdown.', 'warning');
      return;
    }
    const finalTitle = nonAcademicEvent === 'Others' ? nonAcademicCustomName.trim() : nonAcademicEvent;
    if (!finalTitle) {
      addToast('Please write your event name.', 'warning');
      return;
    }
    if (!nonAcademicFile) {
      addToast('Please select a certificate file to upload.', 'warning');
      return;
    }

    setNonAcademicUploading(true);
    try {
      const formData = new FormData();
      formData.append('regNo', studentData?.reg_no || student?.reg_no);
      formData.append('name', studentData?.name || student?.name);
      formData.append('department', studentData?.department || student?.department);
      formData.append('section', studentData?.section || student?.section);
      formData.append('currentYear', studentData?.current_year || student?.current_year || 'I st Year');
      formData.append('passingYear', studentData?.passing_year || student?.passing_year || '2026');
      formData.append('email', studentData?.email || student?.email || '');

      formData.append('files', nonAcademicFile);
      formData.append(
        'certificatesMeta',
        JSON.stringify([
          {
            category: 'non_academic',
            title: finalTitle,
            issueDate: nonAcademicDate || null,
            description: null
          }
        ])
      );

      const res = await axios.post('/api/certificates/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${studentToken}`
        }
      });

      if (res.data.success) {
        addToast('Non-academic certificate uploaded successfully!', 'success');
        setNonAcademicEvent('');
        setNonAcademicCustomName('');
        setNonAcademicDate('');
        setNonAcademicFile(null);
        if (nonAcademicFileInputRef.current) nonAcademicFileInputRef.current.value = '';
        fetchStudentData();
      }
    } catch (err) {
      console.error('Non-academic upload failed:', err);
      addToast(err.response?.data?.message || 'Failed to upload certificate.', 'error');
    } finally {
      setNonAcademicUploading(false);
    }
  };

  // Open Edit Modal (My Certificates only)
  const handleOpenEdit = (cert) => {
    setEditingCert(cert);
    setEditTitle(cert.title);
    setEditDate(cert.issue_date || '');
    setEditDescription(cert.description || '');
  };

  // Save Edit (My Certificates only)
  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      addToast('Certificate title is required.', 'warning');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await axios.patch(
        `/api/students/certificates/${editingCert.id}`,
        {
          title: editTitle.trim(),
          issueDate: editDate || null,
          description: editDescription.trim() || null
        },
        { headers: { Authorization: `Bearer ${studentToken}` } }
      );

      if (res.data.success) {
        addToast('Certificate updated successfully!', 'success');
        setEditingCert(null);
        fetchStudentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update certificate.', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Certificate (My Certificates only)
  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate from your records?')) return;

    try {
      const res = await axios.delete(`/api/students/certificates/${certId}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      if (res.data.success) {
        addToast(res.data.message || 'Certificate deleted.', 'success');
        fetchStudentData();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not delete certificate.', 'error');
    }
  };

  const academicCount = summary?.academicCount ?? summary?.withinCount ?? 0;
  const nonAcademicCount = summary?.nonAcademicCount ?? summary?.outsideCount ?? 0;

  const filteredMyCerts = certificates.filter((c) => {
    if (activeTab === 'academic') return c.category === 'academic' || c.category === 'within';
    if (activeTab === 'non_academic') return c.category === 'non_academic' || c.category === 'outside';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Student Profile Overview Banner */}
      <div className="bg-gradient-to-r from-piet-900 via-piet-800 to-purpleBrand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20">
                {studentData?.reg_no || student?.reg_no}
              </span>
              <span className="text-xs text-white/80">
                Branch: {studentData?.department || student?.department} • Section{' '}
                {studentData?.section || student?.section} •{' '}
                {studentData?.current_year || student?.current_year || 'I st Year'}
              </span>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Passing Year: {studentData?.passing_year || student?.passing_year || '2026'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {studentData?.name || student?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              College Email: <span className="font-mono">{studentData?.email || student?.email}</span>
            </p>
          </div>

          {/* Action: Print & Full Dossier */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dossier</span>
            </button>

            <button
              onClick={onStartUpload}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-piet-500 to-purpleBrand-500 hover:from-piet-400 hover:to-purpleBrand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Batch Upload (Wizard)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO PROMINENT UPLOAD BOXES (IN PLACE OF SCORE FEATURE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BOX 1: ACADEMIC CERTIFICATES BOX */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-200 dark:border-blue-900/50 rounded-3xl p-4 sm:p-7 shadow-xl shadow-blue-500/5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Box Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Academic Certificates
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload your technical & academic achievements
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {academicCount} Uploaded
              </span>
            </div>

            {/* Required NPTEL Alert Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>Note: You are not allowed to enter NPTEL certificate here.</span>
            </div>

            {/* Event Name Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={academicEvent}
                onChange={(e) => setAcademicEvent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Select Academic Event --</option>
                {COLLEGE_CONFIG.events.academic.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            {/* If 'Others' is selected, show custom event name input */}
            {academicEvent === 'Others' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Write Your Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={academicCustomName}
                  onChange={(e) => setAcademicCustomName(e.target.value)}
                  placeholder="e.g., Smart India Hackathon 2024 or Robotics Workshop"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Optional Event Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={academicDate}
                onChange={(e) => setAcademicDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* File Chooser Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Certificate File <span className="text-rose-500">*</span>
              </label>
              <div
                onClick={() => academicFileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  academicFile
                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  ref={academicFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAcademicFile(e.target.files[0]);
                    }
                  }}
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
                  className="hidden"
                />
                {academicFile ? (
                  <div className="flex items-center justify-between text-xs text-left">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {academicFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(academicFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAcademicFile(null);
                        if (academicFileInputRef.current) academicFileInputRef.current.value = '';
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                    <UploadCloud className="w-6 h-6 text-blue-500" />
                    <span className="text-xs font-semibold">Click to choose PDF or Image</span>
                    <span className="text-[10px] text-slate-400">Up to 10 MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Big Upload Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleUploadAcademic}
              disabled={academicUploading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {academicUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading Academic Certificate...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload Academic Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOX 2: NON-ACADEMIC CERTIFICATES BOX */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-purple-200 dark:border-purple-900/50 rounded-3xl p-4 sm:p-7 shadow-xl shadow-purple-500/5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Box Header */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-sm">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Non-Academic Certificates
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload co-curricular, sports & cultural events
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {nonAcademicCount} Uploaded
              </span>
            </div>

            {/* Event Name Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={nonAcademicEvent}
                onChange={(e) => setNonAcademicEvent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Select Non-Academic Event --</option>
                {COLLEGE_CONFIG.events.nonAcademic.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt}
                  </option>
                ))}
              </select>
            </div>

            {/* If 'Others' is selected, show custom event name input */}
            {nonAcademicEvent === 'Others' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Write Your Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nonAcademicCustomName}
                  onChange={(e) => setNonAcademicCustomName(e.target.value)}
                  placeholder="e.g., Annual Sports Meet, Blood Donation Camp, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Optional Event Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Event Date <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={nonAcademicDate}
                onChange={(e) => setNonAcademicDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* File Chooser Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Certificate File <span className="text-rose-500">*</span>
              </label>
              <div
                onClick={() => nonAcademicFileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  nonAcademicFile
                    ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 bg-slate-50/50 dark:bg-slate-800/40'
                }`}
              >
                <input
                  type="file"
                  ref={nonAcademicFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNonAcademicFile(e.target.files[0]);
                    }
                  }}
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
                  className="hidden"
                />
                {nonAcademicFile ? (
                  <div className="flex items-center justify-between text-xs text-left">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {nonAcademicFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(nonAcademicFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNonAcademicFile(null);
                        if (nonAcademicFileInputRef.current) nonAcademicFileInputRef.current.value = '';
                      }}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                    <UploadCloud className="w-6 h-6 text-purple-500" />
                    <span className="text-xs font-semibold">Click to choose PDF or Image</span>
                    <span className="text-[10px] text-slate-400">Up to 10 MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Big Upload Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleUploadNonAcademic}
              disabled={nonAcademicUploading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purpleBrand-600 via-purple-700 to-indigo-700 hover:from-purpleBrand-500 hover:to-indigo-600 text-white font-black text-sm sm:text-base shadow-xl shadow-purpleBrand-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {nonAcademicUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading Non-Academic Certificate...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload Non-Academic Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* TOP NAVIGATION TABS: MY PORTFOLIO vs PEER SHOWCASE */}
      <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setMainViewMode('my_portfolio')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mainViewMode === 'my_portfolio'
              ? 'bg-gradient-to-r from-piet-600 to-purpleBrand-600 text-white shadow-lg shadow-piet-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>My Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setMainViewMode('peer_showcase')}
          className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            mainViewMode === 'peer_showcase'
              ? 'bg-gradient-to-r from-piet-600 to-purpleBrand-600 text-white shadow-lg shadow-piet-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Explore Peer Certificates (Read-Only)</span>
        </button>
      </div>

      {/* VIEW 1: MY CERTIFICATES */}
      {mainViewMode === 'my_portfolio' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Header & Category Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                My Uploaded Achievements & Certificates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your credentials, update details, or preview your uploaded certificates.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All ({certificates.length})
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'academic'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Academic ({academicCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('non_academic')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'non_academic'
                    ? 'bg-purpleBrand-600 text-white shadow-sm'
                    : 'text-purpleBrand-600 dark:text-purpleBrand-400'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Non-Academic ({nonAcademicCount})</span>
              </button>
            </div>
          </div>

          {/* Certificate Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-piet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading your certificates...</span>
            </div>
          ) : filteredMyCerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No certificates in this category yet.
              </p>
              <button
                onClick={onStartUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-piet-600 text-white text-xs font-bold hover:bg-piet-700 cursor-pointer shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload First Certificate</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {filteredMyCerts.map((cert) => {
                const isImage =
                  cert.mime_type?.startsWith('image/') ||
                  /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cert.stored_filename);
                const fileUrl = getFileUrl(cert.file_path);
                const isAcademic = cert.category === 'academic' || cert.category === 'within';

                return (
                  <div
                    key={cert.id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between transition-all bg-white dark:bg-slate-900 ${
                      cert.status === 'flagged'
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-piet-400 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Thumbnail Preview */}
                      <div
                        onClick={() => {
                          setPreviewCert(cert);
                          setIsPeerPreview(false);
                        }}
                        className="w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer relative group mb-3"
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                            <FileText className="w-8 h-8 text-piet-500" />
                            <span className="text-[11px] font-bold uppercase">
                              {cert.original_filename?.split('.').pop() || 'DOC'}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </div>
                      </div>

                      {/* Category & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isAcademic
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {isAcademic ? 'Academic' : 'Non-Academic'}
                        </span>

                        {cert.status === 'flagged' ? (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Invalid</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={cert.title}>
                        {cert.title}
                      </h4>

                      {cert.issue_date && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{cert.issue_date}</span>
                        </p>
                      )}

                      {cert.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {cert.description}
                        </p>
                      )}

                      {cert.status === 'flagged' && cert.flag_reason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-300">
                          <strong>Mentor note:</strong> {cert.flag_reason}
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-3">
                      <button
                        onClick={() => {
                          setPreviewCert(cert);
                          setIsPeerPreview(false);
                        }}
                        className="text-xs font-semibold text-piet-600 dark:text-piet-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cert)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-piet-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          title="Edit certificate details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCert(cert.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                          title="Delete certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PEER SHOWCASE (STRICTLY READ-ONLY) */}
      {mainViewMode === 'peer_showcase' && (
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Showcase Info Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>PIET Student Peer Showcase</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>View Only</span>
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Browse achievements, hackathons, and certifications completed by your fellow students across all sections.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {peerCertificates.length} approved certificate{peerCertificates.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={peerSearch}
                onChange={(e) => setPeerSearch(e.target.value)}
                placeholder="Search by student name, PIET25ADxxx, or event..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={peerDept}
                onChange={(e) => setPeerDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Branches</option>
                {COLLEGE_CONFIG.branches.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.short}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <select
                value={peerSection}
                onChange={(e) => setPeerSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Sections</option>
                {COLLEGE_CONFIG.sections.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={peerCategory}
                onChange={(e) => setPeerCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Categories</option>
                <option value="academic">Academic Certificates</option>
                <option value="non_academic">Non-Academic Certificates</option>
              </select>
            </div>
          </div>

          {/* Peer Certificates Grid */}
          {peerLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-piet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Fetching peer certificates...</span>
            </div>
          ) : peerCertificates.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="font-semibold text-slate-600 dark:text-slate-400">
                No peer certificates found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peerCertificates.map((cert) => {
                const isImage =
                  cert.mime_type?.startsWith('image/') ||
                  /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cert.stored_filename);
                const fileUrl = getFileUrl(cert.file_path);
                const isAcademic = cert.category === 'academic' || cert.category === 'within';

                return (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 hover:border-piet-400 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Peer Thumbnail */}
                      <div
                        onClick={() => {
                          setPreviewCert(cert);
                          setIsPeerPreview(true);
                        }}
                        className="w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer relative group mb-3"
                      >
                        {isImage ? (
                          <img
                            src={fileUrl}
                            alt={cert.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                            <FileText className="w-8 h-8 text-piet-500" />
                            <span className="text-[10px] font-bold uppercase">
                              {cert.original_filename?.split('.').pop() || 'DOC'}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                          <Eye className="w-4 h-4" />
                          <span>View Preview</span>
                        </div>
                      </div>

                      {/* Peer Student Info */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isAcademic
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {isAcademic ? 'Academic' : 'Non-Academic'}
                        </span>

                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          Sec {cert.student_section} • {cert.student_dept}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={cert.title}>
                        {cert.title}
                      </h4>

                      <p className="text-xs text-piet-600 dark:text-piet-400 font-medium mt-1">
                        By: {cert.student_name}
                      </p>

                      {cert.issue_date && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{cert.issue_date}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setPreviewCert(cert);
                          setIsPeerPreview(true);
                        }}
                        className="text-xs font-semibold text-piet-600 dark:text-piet-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL (My Certificates) */}
      <AnimatePresence>
        {editingCert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCert(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-piet-600" />
                  <span>Update Certificate Record</span>
                </h3>
                <button onClick={() => setEditingCert(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Name / Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Date (Optional)
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Organizing Body (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-piet-600 text-white text-xs font-bold hover:bg-piet-700 cursor-pointer"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN CERTIFICATE VIEWER MODAL */}
      {previewCert && (
        <CertificateViewerModal
          certificate={previewCert}
          student={studentData || student}
          token={studentToken}
          readOnly={isPeerPreview}
          onClose={() => setPreviewCert(null)}
          onRefresh={fetchStudentData}
          addToast={addToast}
        />
      )}
    </div>
  );
}
