import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StepIndicator } from './components/StepIndicator';
import { StudentDetailsStep } from './components/StudentDetailsStep';
import { UploadCertificatesStep } from './components/UploadCertificatesStep';
import { SuccessStep } from './components/SuccessStep';
import { StudentAuth } from './components/StudentAuth';
import { StudentDashboard } from './components/StudentDashboard';
import { MentorLogin } from './components/MentorLogin';
import { MentorDashboard } from './components/MentorDashboard';
import { Toast } from './components/Toast';
import { GoogleSignInModal } from './components/GoogleSignInModal';
import { useAuth } from './context/AuthContext';
import { ShieldCheck, UploadCloud, Sparkles } from 'lucide-react';

export default function App() {
  const { 
    isAuthenticated: isMentorAuth, 
    student, 
    isStudentAuthenticated,
    studentGoogleAuth,
    mentorGoogleAuth
  } = useAuth();

  // Navigation: 'student' or 'mentor'
  const [currentView, setCurrentView] = useState(() => {
    return window.location.pathname.startsWith('/mentor') ? 'mentor' : 'student';
  });

  // Student SubView: 'dashboard' | 'upload' | 'auth'
  const [studentSubView, setStudentSubView] = useState(() => {
    return localStorage.getItem('piet_student_token') ? 'dashboard' : 'auth';
  });

  // Listen to popstate for browser back/forward URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(window.location.pathname.startsWith('/mentor') ? 'mentor' : 'student');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSetCurrentView = (view) => {
    setCurrentView(view);
    const newPath = view === 'mentor' ? '/mentor' : '/';
    window.history.pushState(null, '', newPath);
  };

  // Student Flow State (Steps 1, 2, 3)
  const [step, setStep] = useState(1);
  const [studentData, setStudentData] = useState({
    department: 'AI&DS',
    section: 'A',
    currentYear: 'I st Year',
    regNo: '',
    name: '',
    email: ''
  });

  // Pre-fill student data whenever student logs in or changes
  useEffect(() => {
    if (student) {
      setStudentData({
        department: student.department || 'AI&DS',
        section: student.section || 'A',
        currentYear: student.current_year || 'I st Year',
        regNo: student.reg_no || '',
        name: student.name || '',
        email: student.email || ''
      });
      setStudentSubView('dashboard');
    } else {
      setStudentSubView('auth');
    }
  }, [student]);

  const [withinFiles, setWithinFiles] = useState([]);
  const [outsideFiles, setOutsideFiles] = useState([]);
  const [submissionSummary, setSubmissionSummary] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Step transitions
  const handleContinueToUpload = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDetails = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalSuccess = (summary) => {
    setSubmissionSummary(summary);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('Certificates uploaded and verified successfully!', 'success');
  };

  const handleSubmitMore = () => {
    setWithinFiles([]);
    setOutsideFiles([]);
    setSubmissionSummary(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToDashboard = () => {
    setWithinFiles([]);
    setOutsideFiles([]);
    setSubmissionSummary(null);
    setStep(1);
    setStudentSubView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Google Modal State triggered from Header
  const [headerGoogleModalOpen, setHeaderGoogleModalOpen] = useState(false);
  const [headerGoogleRole, setHeaderGoogleRole] = useState('student');

  const handleHeaderGoogleSelect = async (payload) => {
    try {
      if (headerGoogleRole === 'mentor') {
        const res = await mentorGoogleAuth(payload);
        if (res.success) {
          addToast(res.message || 'Signed in to Mentor Dashboard via Google!', 'success');
          setCurrentView('mentor');
        }
        return res;
      } else {
        const res = await studentGoogleAuth(payload);
        if (res.success) {
          addToast(res.message || 'Signed in to Student Dashboard via Google!', 'success');
          setStudentSubView('dashboard');
        }
        return res;
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Global Header */}
      <Header
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        studentSubView={studentSubView}
        setStudentSubView={setStudentSubView}
        openGoogleSignIn={(role) => {
          setHeaderGoogleRole(role || (currentView === 'mentor' ? 'mentor' : 'student'));
          setHeaderGoogleModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          
          {/* STUDENT VIEW */}
          {currentView === 'student' && (
            <motion.div
              key={`student-view-${studentSubView}-${isStudentAuthenticated}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Scenario 1: Not authenticated -> Show College Email + Password Login / Register (No Guest bypass) */}
              {!isStudentAuthenticated ? (
                <div>
                  <StudentAuth
                    onAuthenticated={() => {
                      setStudentSubView('dashboard');
                      addToast('Welcome back to your PIET student dashboard!', 'success');
                    }}
                    addToast={addToast}
                  />
                </div>
              ) : studentSubView === 'dashboard' ? (
                /* Scenario 2: Authenticated Student viewing Dashboard & Peer Showcase */
                <StudentDashboard
                  onStartUpload={() => {
                    setStudentSubView('upload');
                    setStep(2); // Since details are already verified for this student
                  }}
                  addToast={addToast}
                />
              ) : (
                /* Scenario 3: Upload Certificate 3-Step Wizard */
                <div>
                  {/* Stepped Progress Bar */}
                  <StepIndicator currentStep={step} />

                  {/* Step 1: Student Details */}
                  {step === 1 && (
                    <StudentDetailsStep
                      studentData={studentData}
                      setStudentData={setStudentData}
                      onContinue={handleContinueToUpload}
                      addToast={addToast}
                    />
                  )}

                  {/* Step 2: Upload Certificates */}
                  {step === 2 && (
                    <UploadCertificatesStep
                      studentData={studentData}
                      withinFiles={withinFiles}
                      setWithinFiles={setWithinFiles}
                      outsideFiles={outsideFiles}
                      setOutsideFiles={setOutsideFiles}
                      onBack={handleBackToDetails}
                      onFinalSuccess={handleFinalSuccess}
                      addToast={addToast}
                    />
                  )}

                  {/* Step 3: Success Screen */}
                  {step === 3 && (
                    <SuccessStep
                      summary={submissionSummary}
                      onSubmitMore={handleSubmitMore}
                      onGoToDashboard={isStudentAuthenticated ? handleGoToDashboard : null}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* MENTOR VIEW */}
          {currentView === 'mentor' && (
            <motion.div
              key="mentor-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {!isMentorAuth ? (
                <MentorLogin
                  onSuccess={() => {}}
                  addToast={addToast}
                />
              ) : (
                <MentorDashboard addToast={addToast} />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Toast System */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Global Google Account Chooser Modal triggered from Header */}
      <GoogleSignInModal
        isOpen={headerGoogleModalOpen}
        onClose={() => setHeaderGoogleModalOpen(false)}
        role={headerGoogleRole}
        onSelectAccount={handleHeaderGoogleSelect}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
