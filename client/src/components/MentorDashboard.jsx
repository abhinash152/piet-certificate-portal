import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Award,
  Building2,
  Globe,
  Filter,
  Search,
  Download,
  FileSpreadsheet,
  Archive,
  RefreshCw,
  Eye,
  AlertTriangle,
  FolderArchive,
  CheckCircle2,
  Calendar,
  X,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { CertificateViewerModal } from './CertificateViewerModal';
import { getFileUrl, getCertificateDownloadUrl, downloadCertificateFile } from '../utils/urlUtils';
import axios from 'axios';

export function MentorDashboard({ addToast }) {
  const { token, mentor } = useAuth();

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Student list & Filters
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected student for detail drawer/modal
  const [selectedStudentRegNo, setSelectedStudentRegNo] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all'); // 'all', 'within', 'outside'

  // Certificate Modal Preview
  const [activePreviewCert, setActivePreviewCert] = useState(null);

  // Raw Database Inspector Modal State
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [activeDbTab, setActiveDbTab] = useState('students'); // 'students', 'certificates', 'mentors'

  const fetchDatabaseTables = async () => {
    setDbLoading(true);
    setDbModalOpen(true);
    try {
      const res = await axios.get('/api/mentor/database/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setDbData(res.data);
      }
    } catch (err) {
      addToast('Failed to load database records.', 'error');
    } finally {
      setDbLoading(false);
    }
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/mentor/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Students with current filters
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = {};
      if (selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedSection !== 'ALL') params.section = selectedSection;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await axios.get('/api/mentor/students', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      addToast('Failed to load student records.', 'error');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, [token]);

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedDept, selectedSection, selectedCategory, searchQuery, startDate, endDate]);

  // Load selected student detail
  const loadStudentDetails = async (regNo) => {
    setSelectedStudentRegNo(regNo);
    setStudentDetailsLoading(true);
    try {
      const res = await axios.get(`/api/mentor/students/${regNo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      addToast('Failed to load student certificates.', 'error');
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDept('ALL');
    setSelectedSection('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    addToast('Filters reset to default.', 'info');
  };

  // Export CSV
  const handleExportCsv = () => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const params = new URLSearchParams();
    if (selectedDept !== 'ALL') params.append('department', selectedDept);
    if (selectedSection !== 'ALL') params.append('section', selectedSection);

    const url = `${baseUrl}/api/mentor/export-csv?${params.toString()}`;
    addToast('Generating CSV report...', 'info');

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to export CSV.');
        }
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `PIET_Internal_Marks_Summary_${selectedDept}_${selectedSection}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000);
        addToast('CSV Internal Marks Summary downloaded!', 'success');
      })
      .catch((err) => addToast(err.message || 'Failed to export CSV.', 'error'));
  };

  // Download Student ZIP
  const handleDownloadStudentZip = (regNo) => {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}/api/mentor/download/student/${regNo}`;

    addToast(`Preparing certificate ZIP for ${regNo}...`, 'info');

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Download failed. No certificates or server error.');
        }
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error('Server returned invalid archive. Please check server connection.');
        }
        return res.blob();
      })
      .then((blob) => {
        if (blob.size < 100) {
          throw new Error('Downloaded archive is empty or invalid.');
        }
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `PIET_${regNo}_All_Certificates.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000);
        addToast(`Downloaded certificate archive for ${regNo}!`, 'success');
      })
      .catch((err) => addToast(err.message || 'No files to download or failed to generate ZIP.', 'error'));
  };

  // Download Section ZIP
  const handleDownloadSectionZip = () => {
    if (selectedDept === 'ALL' || selectedSection === 'ALL') {
      addToast('Please choose a specific Department and Section to download a section ZIP.', 'warning');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = `${baseUrl}/api/mentor/download/section?department=${selectedDept}&section=${selectedSection}`;

    addToast(`Generating batch archive for ${selectedDept} Sec ${selectedSection}...`, 'info');

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Download failed for this section.');
        }
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          throw new Error('Server returned invalid archive. Please check server connection.');
        }
        return res.blob();
      })
      .then((blob) => {
        if (blob.size < 100) {
          throw new Error('Section archive is empty or invalid.');
        }
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `PIET_${selectedDept}_Section_${selectedSection}_Archive.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 10000);
        addToast(`Downloaded batch archive for ${selectedDept} Section ${selectedSection}!`, 'success');
      })
      .catch((err) => addToast(err.message || 'Failed to generate Section ZIP.', 'error'));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-piet-900 via-piet-800 to-purpleBrand-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Faculty Portal
              </span>
              <span className="text-white/60 text-xs">PIET Academic Session 2024–2025</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {mentor?.full_name || 'Academic Mentor Assessment Dashboard'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect student achievements, evaluate co-curricular and extra-curricular credentials for internal marks, and export batch summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDatabaseTables}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Inspect Raw SQLite Database Tables (Students, Certificates, Mentors)"
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>Database Records</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="Export filtered records to CSV for grading"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadSectionZip}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-piet-500 to-purpleBrand-500 hover:from-piet-400 hover:to-purpleBrand-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Download entire section files as ZIP"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Download Section ZIP</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Total Students */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {statsLoading ? '...' : stats?.totalStudents ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Registered in portal</span>
        </div>

        {/* Total Certificates */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Uploads</span>
            <div className="w-10 h-10 rounded-xl bg-piet-50 dark:bg-piet-950 text-piet-600 dark:text-piet-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {statsLoading ? '...' : stats?.totalCertificates ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Archived certificates</span>
        </div>

        {/* Within College */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-blue-200/80 dark:border-blue-900/40 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Within College</span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {statsLoading ? '...' : stats?.totalWithin ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Workshops & fests</span>
        </div>

        {/* Outside College */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-purple-200/80 dark:border-purple-900/40 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Outside College</span>
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {statsLoading ? '...' : stats?.totalOutside ?? 0}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Hackathons & MOOCs</span>
        </div>

      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-piet-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Filter Records & Internal Marks Evaluation
            </h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-piet-600 dark:hover:text-piet-400 flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search Box (2 cols on large) */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Reg No or Student Name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 focus:ring-2 focus:ring-piet-500/20 text-slate-900 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Departments</option>
              {COLLEGE_CONFIG.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short}
                </option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              <option value="within">Within College</option>
              <option value="outside">Outside College</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              title="Submissions from date"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs focus:outline-none focus:border-piet-500 text-slate-900 dark:text-white"
            />
          </div>

        </div>

      </div>

      {/* STUDENT RECORDS TABLE */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Student Assessment Callset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {students.length} student record{students.length === 1 ? '' : 's'} matching your criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Click a row to inspect certificates</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-4 px-4 sm:px-6">Reg Number</th>
                <th className="py-4 px-4 sm:px-6">Student Name</th>
                <th className="py-4 px-4 sm:px-6">Dept & Sec</th>
                <th className="py-4 px-4 sm:px-6 text-center">Within College</th>
                <th className="py-4 px-4 sm:px-6 text-center">Outside College</th>
                <th className="py-4 px-4 sm:px-6 text-center">Total Valid</th>
                <th className="py-4 px-4 sm:px-6 text-center">Internal Marks (Max 50)</th>
                <th className="py-4 px-4 sm:px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {studentsLoading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-piet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading student records...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <Award className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">No students found matching filters.</p>
                    <p className="text-xs mt-1">Try resetting the department or section filters.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const validTotal = Math.max(0, student.total_certificates - student.flagged_count);
                  const isSelected = selectedStudentRegNo === student.reg_no;
                  const marksInfo = COLLEGE_CONFIG.internalMarks.calculate(student.within_count || 0, student.outside_count || 0);

                  return (
                    <tr
                      key={student.reg_no}
                      onClick={() => loadStudentDetails(student.reg_no)}
                      className={`hover:bg-piet-50/50 dark:hover:bg-piet-950/20 cursor-pointer transition-colors ${
                        isSelected ? 'bg-piet-50 dark:bg-piet-950/40' : ''
                      }`}
                    >
                      {/* Reg Number */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-piet-600 dark:text-piet-400">
                        {student.reg_no}
                      </td>

                      {/* Student Name */}
                      <td className="py-4 px-4 sm:px-6 font-semibold text-slate-900 dark:text-white">
                        {student.name}
                        {student.email && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {student.email}
                          </span>
                        )}
                      </td>

                      {/* Dept & Section */}
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {student.department}
                        </span>
                        <span className="ml-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          Sec {student.section}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {student.semester || 'Semester 5'}
                        </span>
                      </td>

                      {/* Within Count */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {student.within_count || 0}
                        </span>
                      </td>

                      {/* Outside Count */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {student.outside_count || 0}
                        </span>
                      </td>

                      {/* Total Valid Count */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {validTotal}
                        </span>
                        {student.flagged_count > 0 && (
                          <span className="block text-[10px] text-rose-500 font-bold" title="Flagged certificates">
                            ({student.flagged_count} flagged)
                          </span>
                        )}
                      </td>

                      {/* Calculated Internal / SODECA Marks */}
                      <td className="py-4 px-4 sm:px-6 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {marksInfo.score} <span className="text-[11px] font-normal text-slate-400">/ 50</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${marksInfo.gradeColor}`}>
                            Grade {marksInfo.grade.split(' ')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => loadStudentDetails(student.reg_no)}
                            className="p-2 rounded-xl text-piet-600 dark:text-piet-400 hover:bg-piet-100 dark:hover:bg-piet-900/40 transition-colors"
                            title="View student portfolio"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDownloadStudentZip(student.reg_no)}
                            className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Download student certificates ZIP"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* STUDENT PORTFOLIO POP-UP MODAL */}
      <AnimatePresence>
        {selectedStudentRegNo && studentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedStudentRegNo(null);
                setStudentDetails(null);
              }}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md -z-0"
            />

            {/* Modal Dialog Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-piet-300/80 dark:border-piet-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4"
            >
              {/* Close button */}
              <button
                onClick={() => {
                  setSelectedStudentRegNo(null);
                  setStudentDetails(null);
                }}
                className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer"
                title="Close Portfolio Popup"
              >
                <X className="w-5 h-5" />
              </button>

          {/* Student Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-piet-600 dark:text-piet-400 bg-piet-50 dark:bg-piet-950 px-2 py-0.5 rounded border border-piet-200 dark:border-piet-800">
                  {studentDetails.student.reg_no}
                </span>
                <span className="text-xs text-slate-500">
                  {studentDetails.student.department} • Section {studentDetails.student.section}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {studentDetails.student.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {studentDetails.student.email || 'No email registered'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownloadStudentZip(studentDetails.student.reg_no)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-piet-600 to-purpleBrand-600 text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>Download All Certificates (.ZIP)</span>
              </button>
            </div>
          </div>

          {/* SODECA Evaluation Summary Card */}
          {(() => {
            const dossierMarks = COLLEGE_CONFIG.internalMarks.calculate(studentDetails.summary.withinCount, studentDetails.summary.outsideCount);
            return (
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-slate-800/80 dark:via-blue-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-piet-600 dark:text-piet-400">
                    RTU / PIET Activity & SODECA Evaluation
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {dossierMarks.score} / {dossierMarks.maxMarks} Marks
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${dossierMarks.gradeColor}`}>
                      Grade {dossierMarks.grade}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  <p>• Within College: <strong>{studentDetails.summary.withinCount}</strong> × 5 pts = {studentDetails.summary.withinCount * 5} pts</p>
                  <p>• Outside College: <strong>{studentDetails.summary.outsideCount}</strong> × 10 pts = {studentDetails.summary.outsideCount * 10} pts</p>
                  <p className="text-[11px] text-slate-400">(Capped at maximum {dossierMarks.maxMarks} internal activity marks)</p>
                </div>
              </div>
            );
          })()}

          {/* Portfolio Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategoryTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Certificates ({studentDetails.certificates.length})
            </button>

            <button
              onClick={() => setActiveCategoryTab('within')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeCategoryTab === 'within'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Within College ({studentDetails.summary.withinCount})</span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('outside')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeCategoryTab === 'outside'
                  ? 'bg-purpleBrand-600 text-white shadow'
                  : 'text-purpleBrand-600 dark:text-purpleBrand-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Outside College ({studentDetails.summary.outsideCount})</span>
            </button>
          </div>

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {studentDetails.certificates
              .filter((c) => activeCategoryTab === 'all' || c.category === activeCategoryTab)
              .map((cert) => {
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
                      {/* Image Thumbnail or File Icon */}
                      <div
                        onClick={() => setActivePreviewCert(cert)}
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
                            <Award className="w-8 h-8 text-piet-500" />
                            <span className="text-[11px] font-bold uppercase">{cert.original_filename.split('.').pop()}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-xs font-bold">
                          <Eye className="w-4 h-4" />
                          <span>Click to Preview</span>
                        </div>
                      </div>

                      {/* Header Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          cert.category === 'within'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {cert.category === 'within' ? 'Within College' : 'Outside'}
                        </span>

                        {cert.status === 'flagged' && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" title={cert.title}>
                        {cert.title}
                      </h4>

                      {cert.issue_date && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>Date: {cert.issue_date}</span>
                        </p>
                      )}

                      {cert.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {cert.description}
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-3">
                      <button
                        onClick={() => setActivePreviewCert(cert)}
                        className="text-xs font-semibold text-piet-600 dark:text-piet-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <a
                        href={getCertificateDownloadUrl(cert.id) || fileUrl}
                        download={cert.original_filename}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Download file directly"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN CERTIFICATE VIEWER MODAL */}
      {activePreviewCert && (
        <CertificateViewerModal
          certificate={activePreviewCert}
          student={studentDetails?.student}
          token={token}
          onClose={() => setActivePreviewCert(null)}
          onRefresh={() => {
            fetchStats();
            fetchStudents();
            if (selectedStudentRegNo) {
              loadStudentDetails(selectedStudentRegNo);
            }
          }}
          addToast={addToast}
        />
      )}

      {/* RAW DATABASE EXPLORER POP-UP MODAL */}
      <AnimatePresence>
        {dbModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDbModalOpen(false)}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md -z-0"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-amber-300/80 dark:border-amber-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>PIET SQLite Database Explorer</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        piet_portal.db
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Live SQLite tables, columns & stored database records.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDbModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table Switcher Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => setActiveDbTab('students')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeDbTab === 'students'
                        ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    students ({dbData?.stats?.totalStudents || 0})
                  </button>

                  <button
                    onClick={() => setActiveDbTab('certificates')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeDbTab === 'certificates'
                        ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    certificates ({dbData?.stats?.totalCertificates || 0})
                  </button>

                  <button
                    onClick={() => setActiveDbTab('mentors')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      activeDbTab === 'mentors'
                        ? 'bg-white dark:bg-slate-900 text-piet-600 dark:text-piet-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    mentors ({dbData?.stats?.totalMentors || 0})
                  </button>
                </div>

                <button
                  onClick={fetchDatabaseTables}
                  className="text-xs font-semibold text-slate-500 hover:text-piet-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh DB</span>
                </button>
              </div>

              {/* Table Records View */}
              {dbLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Querying SQLite database...</span>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider sticky top-0">
                      {activeDbTab === 'students' && (
                        <tr>
                          <th className="py-2.5 px-3">reg_no</th>
                          <th className="py-2.5 px-3">name</th>
                          <th className="py-2.5 px-3">department</th>
                          <th className="py-2.5 px-3">section</th>
                          <th className="py-2.5 px-3">current_year</th>
                          <th className="py-2.5 px-3">email</th>
                          <th className="py-2.5 px-3">created_at</th>
                        </tr>
                      )}

                      {activeDbTab === 'certificates' && (
                        <tr>
                          <th className="py-2.5 px-3">id</th>
                          <th className="py-2.5 px-3">student_reg_no</th>
                          <th className="py-2.5 px-3">category</th>
                          <th className="py-2.5 px-3">title</th>
                          <th className="py-2.5 px-3">issue_date</th>
                          <th className="py-2.5 px-3">status</th>
                          <th className="py-2.5 px-3">created_at</th>
                        </tr>
                      )}

                      {activeDbTab === 'mentors' && (
                        <tr>
                          <th className="py-2.5 px-3">id</th>
                          <th className="py-2.5 px-3">username</th>
                          <th className="py-2.5 px-3">email</th>
                          <th className="py-2.5 px-3">full_name</th>
                          <th className="py-2.5 px-3">department</th>
                          <th className="py-2.5 px-3">role</th>
                        </tr>
                      )}
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeDbTab === 'students' && dbData?.tables?.students?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-bold text-piet-600 dark:text-piet-400">{row.reg_no}</td>
                          <td className="py-2 px-3">{row.name}</td>
                          <td className="py-2 px-3">{row.department}</td>
                          <td className="py-2 px-3 font-bold">{row.section}</td>
                          <td className="py-2 px-3">{row.current_year}</td>
                          <td className="py-2 px-3 text-slate-500">{row.email}</td>
                          <td className="py-2 px-3 text-slate-400">{row.created_at?.slice(0, 10)}</td>
                        </tr>
                      ))}

                      {activeDbTab === 'certificates' && dbData?.tables?.certificates?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400">{row.id?.slice(0, 8)}...</td>
                          <td className="py-2 px-3 font-bold text-piet-600 dark:text-piet-400">{row.student_reg_no}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.category === 'within' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {row.category}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium truncate max-w-[200px]">{row.title}</td>
                          <td className="py-2 px-3 text-slate-500">{row.issue_date || 'N/A'}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === 'valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-400">{row.created_at?.slice(0, 10)}</td>
                        </tr>
                      ))}

                      {activeDbTab === 'mentors' && dbData?.tables?.mentors?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 text-slate-400">{row.id?.slice(0, 8)}...</td>
                          <td className="py-2 px-3 font-bold">{row.username}</td>
                          <td className="py-2 px-3 text-piet-600 dark:text-piet-400">{row.email}</td>
                          <td className="py-2 px-3">{row.full_name}</td>
                          <td className="py-2 px-3">{row.department}</td>
                          <td className="py-2 px-3 font-bold">{row.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
