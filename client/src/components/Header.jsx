import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, ShieldCheck, LogOut, BookOpen, PlusCircle, LayoutDashboard } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function Header({ currentView, setCurrentView, studentSubView, setStudentSubView, openGoogleSignIn }) {
  const { theme, toggleTheme } = useTheme();
  const { mentor, isAuthenticated: isMentorAuth, logout: mentorLogout, student, isStudentAuthenticated, studentLogout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 glass-panel shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & College Identity */}
          <div 
            onClick={() => {
              setCurrentView('student');
              if (isStudentAuthenticated && setStudentSubView) setStudentSubView('dashboard');
            }}
            className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
          >
            {/* Official Poornima Crest Emblem */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-md shadow-piet-500/10 group-hover:scale-105 transition-transform duration-200 overflow-hidden flex-shrink-0">
              <img
                src={COLLEGE_CONFIG.logos.crest}
                alt="PIET Official Emblem"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-piet-100 text-piet-800 dark:bg-piet-900/60 dark:text-piet-300">
                  {COLLEGE_CONFIG.collegeShortName}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
                  {COLLEGE_CONFIG.collegeTagline}
                </span>
              </div>
              <h1 className="text-xs sm:text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate max-w-[140px] sm:max-w-none">
                {COLLEGE_CONFIG.collegeName}
              </h1>
              <p className="text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-piet-600 to-purpleBrand-500 bg-clip-text text-transparent truncate">
                {COLLEGE_CONFIG.portalName}
              </p>
            </div>
          </div>

          {/* Right Controls: Navigation, Badges, Dark/Light Mode */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            
            {/* Student View Navigation Controls (Desktop & Mobile) */}
            {currentView === 'student' && isStudentAuthenticated && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStudentSubView(studentSubView === 'dashboard' ? 'upload' : 'dashboard')}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-piet-50 dark:bg-piet-950/60 text-piet-700 dark:text-piet-300 border border-piet-200 dark:border-piet-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={studentSubView === 'dashboard' ? 'Upload new certificates' : 'View your dashboard'}
                >
                  {studentSubView === 'dashboard' ? (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Upload Certificates</span>
                      <span className="sm:hidden">Upload</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">My Dashboard</span>
                      <span className="sm:hidden">Dashboard</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-1.5">
                  <div className="text-right hidden lg:block">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[100px]">
                      {student?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {student?.reg_no}
                    </span>
                  </div>
                  <button
                    onClick={studentLogout}
                    title="Sign out of student account"
                    className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Portal Switchers */}
            {currentView === 'student' ? (
              <button
                onClick={() => setCurrentView('mentor')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-purpleBrand-600 dark:hover:text-purpleBrand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-purpleBrand-500 flex-shrink-0" />
                <span className="hidden sm:inline">{isMentorAuth ? 'Mentor Dashboard' : 'Mentor Login'}</span>
                <span className="sm:hidden">Mentor</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('student')}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-piet-600 dark:hover:text-piet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-piet-500 flex-shrink-0" />
                <span className="hidden sm:inline">Student Portal</span>
                <span className="sm:hidden">Student</span>
              </button>
            )}

            {/* Mentor Profile / Logout when authenticated in Mentor view */}
            {isMentorAuth && currentView === 'mentor' && (
              <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-1.5 sm:pl-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden lg:inline">
                  {mentor?.full_name?.split(' ')[0] || 'Mentor'}
                </span>
                <button
                  onClick={mentorLogout}
                  title="Logout Mentor"
                  className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-piet-600 dark:hover:text-piet-400 transition-all shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-slate-700" />
              )}
            </button>

            {/* Google "Sign in" Blue Pill Button (matching user screenshot) */}
            {!isStudentAuthenticated && !isMentorAuth && (
              <button
                type="button"
                onClick={() => {
                  if (openGoogleSignIn) {
                    openGoogleSignIn(currentView === 'mentor' ? 'mentor' : 'student');
                  }
                }}
                className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm bg-[#0b57d0] hover:bg-[#1a73e8] active:bg-[#0842a0] text-white shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                title="Sign in with your Google College Account"
              >
                <span>Sign in</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
