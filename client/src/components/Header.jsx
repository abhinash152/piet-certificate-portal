import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, ShieldCheck, LogOut, BookOpen, User, PlusCircle, LayoutDashboard } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function Header({ currentView, setCurrentView, studentSubView, setStudentSubView }) {
  const { theme, toggleTheme } = useTheme();
  const { mentor, isAuthenticated: isMentorAuth, logout: mentorLogout, student, isStudentAuthenticated, studentLogout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 glass-panel shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & College Identity */}
          <div 
            onClick={() => {
              setCurrentView('student');
              if (isStudentAuthenticated && setStudentSubView) setStudentSubView('dashboard');
            }}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Official Poornima Crest Emblem */}
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shadow-md shadow-piet-500/10 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
              <img
                src={COLLEGE_CONFIG.logos.crest}
                alt="PIET Official Emblem"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-piet-100 text-piet-800 dark:bg-piet-900/60 dark:text-piet-300">
                  {COLLEGE_CONFIG.collegeShortName}
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden lg:inline">
                  {COLLEGE_CONFIG.collegeTagline}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {COLLEGE_CONFIG.collegeName}
              </h1>
              <p className="text-xs font-semibold bg-gradient-to-r from-piet-600 to-purpleBrand-500 bg-clip-text text-transparent">
                {COLLEGE_CONFIG.portalName}
              </p>
            </div>
          </div>

          {/* Right Controls: Navigation, Student / Mentor Badges, Dark/Light Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Student View Navigation Controls */}
            {currentView === 'student' && isStudentAuthenticated && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStudentSubView(studentSubView === 'dashboard' ? 'upload' : 'dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-piet-50 dark:bg-piet-950/60 text-piet-700 dark:text-piet-300 border border-piet-200 dark:border-piet-800 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {studentSubView === 'dashboard' ? (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Upload Certificates</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>My Dashboard</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-2">
                  <div className="text-right hidden md:block">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">
                      {student?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {student?.reg_no}
                    </span>
                  </div>
                  <button
                    onClick={studentLogout}
                    title="Sign out of student account"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-purpleBrand-600 dark:hover:text-purpleBrand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-purpleBrand-500" />
                <span>{isMentorAuth ? 'Mentor Dashboard' : 'Mentor Login'}</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('student')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-piet-600 dark:hover:text-piet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/60 dark:border-slate-700/60 shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-piet-500" />
                <span>Student Portal</span>
              </button>
            )}

            {/* Mentor Profile / Logout when authenticated in Mentor view */}
            {isMentorAuth && currentView === 'mentor' && (
              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 sm:pl-3">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline">
                  {mentor?.full_name?.split(' ')[0] || 'Mentor'}
                </span>
                <button
                  onClick={mentorLogout}
                  title="Logout Mentor"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-piet-600 dark:hover:text-piet-400 transition-all shadow-sm"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
