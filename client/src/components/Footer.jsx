import React from 'react';
import { Heart, ShieldCheck, MapPin, ExternalLink, Award, Code, Sparkles } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

// Official LinkedIn Brand Icon
function LinkedInIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md mt-auto py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Grid: College Identity, Creators Credit, and Location */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          
          {/* Identity & Portal Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Award className="w-4 h-4 text-piet-600" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {COLLEGE_CONFIG.collegeName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
              <span>Official Student Achievement & Verification Dossier Portal</span>
            </p>
          </div>

          {/* CREATORS CREDITS: Abhinash Raj & Akshit R */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 px-4 py-2.5 rounded-2xl shadow-sm">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-piet-600 dark:text-piet-400" />
              <span>Developed with</span>
              <span className="text-rose-500 animate-pulse">❤️</span>
              <span>by:</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Abhinash Raj LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/abhinash-raj-78a68a392/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white dark:hover:text-white transition-all text-xs font-bold shadow-sm hover:scale-105 active:scale-95 group"
                title="Connect with Abhinash Raj on LinkedIn"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
                <span>Abhinash Raj</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Akshit R LinkedIn Link */}
              <a
                href="https://www.linkedin.com/in/akshit-r-9687b7388?utm_source=share_via&utm_content=profile&utm_medium=member_ios"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#0a66c2] hover:bg-[#0a66c2] hover:text-white dark:hover:text-white transition-all text-xs font-bold shadow-sm hover:scale-105 active:scale-95 group"
                title="Connect with Akshit R on LinkedIn"
              >
                <LinkedInIcon className="w-3.5 h-3.5" />
                <span>Akshit R</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Location & RTU Info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Sitapura, Jaipur, Rajasthan</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Autonomous • NBA Accredited</span>
            </div>
          </div>

        </div>

        {/* Bottom subtle copyright */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Poornima Institute of Engineering & Technology (PIET). All rights reserved.
        </div>

      </div>
    </footer>
  );
}
