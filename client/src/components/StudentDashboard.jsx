import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Building2,
  Globe,
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
  ShieldCheck
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
  const [activeTab, setActiveTab] = useState('all');

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

  const withinCount = summary?.withinCount || 0;
  const outsideCount = summary?.outsideCount || 0;
  const marksInfo = COLLEGE_CONFIG.internalMarks.calculate(withinCount, outsideCount);

  const filteredMyCerts = certificates.filter(c => {
    if (activeTab === 'within') return c.category === 'within';
    if (activeTab === 'outside') return c.category === 'outside';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Student Profile & SODECA Overview Banner */}
      <div className="bg-gradient-to-r from-piet-900 via-piet-800 to-purpleBrand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
                {studentData?.reg_no || student?.reg_no}
              </span>
              <span className="text-xs text-white/80">
                Department of {studentData?.department || student?.department} • Section {studentData?.section || student?.section} • {studentData?.current_year || student?.current_year || 'I st Year'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {studentData?.name || student?.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              College Email: <span className="font-mono">{studentData?.email || student?.email}</span>
            </p>
          </div>

          {/* Action: Upload More & Print */}
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
              <span>Upload Certificates</span>
            </button>
          </div>
        </div>

        {/* Live SODECA Progress Card inside Banner */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">
              RTU / PIET SODECA Activity Marks Progress
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-black text-white">
                {marksInfo.score} <span className="text-sm font-normal text-white/60">/ {marksInfo.maxMarks} Marks</span>
              </span>
              <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${marksInfo.gradeColor}`}>
                Grade {marksInfo.grade.split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${marksInfo.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-white/70">
              <span>{withinCount} Within College ({withinCount * 5} pts)</span>
              <span>{outsideCount} Outside College ({outsideCount * 10} pts)</span>
              <span className="font-semibold text-white">{marksInfo.percentage}% Target Reached</span>
            </div>
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
                onClick={() => setActiveTab('within')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'within'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Within ({withinCount})</span>
              </button>
              <button
                onClick={() => setActiveTab('outside')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'outside'
                    ? 'bg-purpleBrand-600 text-white shadow-sm'
                    : 'text-purpleBrand-600 dark:text-purpleBrand-400'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Outside ({outsideCount})</span>
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-piet-600 text-white text-xs font-bold hover:bg-piet-700 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Your First Certificate</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {filteredMyCerts.map((cert) => {
                const isImage = cert.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cert.stored_filename);
                const fileUrl = getFileUrl(cert.file_path);

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
                            <span className="text-[11px] font-bold uppercase">{cert.original_filename.split('.').pop()}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </div>
                      </div>

                      {/* Category & Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          cert.category === 'within'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {cert.category === 'within' ? 'Within College' : 'Outside College'}
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

                    {/* Actions Row (Owner Can Edit/Delete) */}
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
                  Browse achievements, national hackathons, and certifications completed by your fellow students across all 8 sections and departments.
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

            {/* Department Filter */}
            <div>
              <select
                value={peerDept}
                onChange={(e) => setPeerDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Departments</option>
                {COLLEGE_CONFIG.departments.map(d => (
                  <option key={d.id} value={d.id}>{d.short}</option>
                ))}
              </select>
            </div>

            {/* Section Filter (8 sections) */}
            <div>
              <select
                value={peerSection}
                onChange={(e) => setPeerSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All 8 Sections</option>
                {COLLEGE_CONFIG.sections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <select
                value={peerYear}
                onChange={(e) => setPeerYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
              >
                <option value="ALL">All Years</option>
                {COLLEGE_CONFIG.currentYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Peer Certificates Grid */}
          {peerLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-piet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Fetching peer achievements...</span>
            </div>
          ) : peerCertificates.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                No peer certificates found matching your filters.
              </p>
              <button
                onClick={() => {
                  setPeerSearch('');
                  setPeerDept('ALL');
                  setPeerSection('ALL');
                  setPeerYear('ALL');
                  setPeerCategory('ALL');
                }}
                className="text-xs text-piet-600 hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {peerCertificates.map((cert) => {
                const isImage = cert.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(cert.stored_filename);
                const fileUrl = getFileUrl(cert.file_path);

                return (
                  <div
                    key={cert.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-piet-400 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between transition-all shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Student Identity Pill */}
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[170px]">
                            {cert.student_name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {cert.student_reg_no}
                          </span>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {cert.department} • Sec {cert.section}
                        </span>
                      </div>

                      {/* Thumbnail Preview */}
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
                            <span className="text-[11px] font-bold uppercase">{cert.original_filename.split('.').pop()}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                          <Eye className="w-4 h-4" />
                          <span>View Certificate</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          cert.category === 'within'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {cert.category === 'within' ? 'Within College' : 'Outside College'}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {cert.current_year || 'I st Year'}
                        </span>
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
                    </div>

                    {/* View Only Action Button */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-3">
                      <button
                        onClick={() => {
                          setPreviewCert(cert);
                          setIsPeerPreview(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-piet-50 dark:hover:bg-piet-950 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-piet-600 dark:hover:text-piet-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate (Read-Only)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* EDIT CERTIFICATE MODAL (MY CERTIFICATES ONLY) */}
      {editingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm -z-0" onClick={() => setEditingCert(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Certificate Details
              </h3>
              <button onClick={() => setEditingCert(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Certificate Title / Event
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-piet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event / Issue Date
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-piet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Organizing Body
              </label>
              <textarea
                rows="2"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-piet-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCert(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-piet-600 text-white font-bold text-xs hover:bg-piet-700 cursor-pointer"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN CERTIFICATE VIEWER MODAL (SUPPORTS BOTH MY CERTS AND READ-ONLY PEER CERTS) */}
      {previewCert && (
        <CertificateViewerModal
          certificate={previewCert}
          student={isPeerPreview ? {
            name: previewCert.student_name,
            reg_no: previewCert.student_reg_no,
            department: previewCert.department,
            section: previewCert.section,
            current_year: previewCert.current_year
          } : studentData}
          token={studentToken}
          readOnly={isPeerPreview}
          onClose={() => {
            setPreviewCert(null);
            setIsPeerPreview(false);
          }}
          onRefresh={fetchStudentData}
          addToast={addToast}
        />
      )}

    </div>
  );
}
