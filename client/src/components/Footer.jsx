import React from 'react';
import { Heart, ShieldCheck, MapPin, ExternalLink, Award } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md mt-auto py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          
          {/* Identity & Made with love */}
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Award className="w-4 h-4 text-piet-600" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {COLLEGE_CONFIG.collegeName}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <span>Made for PIET students</span>
              <span className="text-rose-500 inline-block animate-pulse">❤️</span>
              <span>for streamlined certificate dossier verification</span>
            </p>
          </div>

          {/* Location & RTU info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Sitapura, Jaipur, Rajasthan</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>RTU Kota Affiliated & NBA Accredited</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
