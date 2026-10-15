import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Award, Sparkles, RefreshCw, PlusCircle, Building2, Globe, ShieldCheck, Printer, LayoutDashboard } from 'lucide-react';
import { getRandomQuote } from '../config/quotes';

export function SuccessStep({ summary, onSubmitMore, onGoToDashboard }) {
  const [quoteData, setQuoteData] = useState(() => getRandomQuote());
  const [isRefreshingQuote, setIsRefreshingQuote] = useState(false);

  // Trigger celebratory confetti burst on mount
  useEffect(() => {
    // School colors confetti: blue, purple, gold, emerald
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#2f7bff', '#7c3aed', '#10b981', '#f59e0b', '#ec4899']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  const handleNewQuote = () => {
    setIsRefreshingQuote(true);
    setTimeout(() => {
      setQuoteData(getRandomQuote());
      setIsRefreshingQuote(false);
    }, 200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto space-y-8 pb-16"
    >
      {/* Top Celebration Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-emerald-500/10 text-center relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-gradient-to-b from-emerald-500/15 via-piet-500/10 to-transparent blur-2xl -z-0 pointer-events-none" />

        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30"
        >
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </motion.div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Upload Verified & Saved</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Submission Successful!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
          Your certificates have been securely archived in your student dossier at PIET for internal marks credit evaluation.
        </p>

        {/* Dynamic Motivational Quote Card */}
        <motion.div
          key={quoteData.quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-50 via-piet-50/40 to-purple-50/40 dark:from-slate-800/60 dark:via-piet-950/30 dark:to-purple-950/30 border border-slate-200 dark:border-slate-700/80 text-left relative group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-piet-600 dark:text-piet-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspiring Thought</span>
            </span>
            <button
              onClick={handleNewQuote}
              title="Get another quote"
              className="text-xs text-slate-400 hover:text-piet-500 flex items-center gap-1 transition-colors p-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQuote ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">New Quote</span>
            </button>
          </div>
          
          <blockquote className="text-sm sm:text-base font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed">
            "{quoteData.quote}"
          </blockquote>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 text-right">
            — {quoteData.author}
          </p>
        </motion.div>

        {/* Submission Summary Box */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 text-left">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 text-center sm:text-left">
            Submission Receipt Summary
          </h4>

          {/* Student Identifiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 mb-4">
            <div>
              <span className="text-[11px] text-slate-400">Registration No.</span>
              <p className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                {summary?.regNo || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Student Name</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {summary?.name || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Department</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                {summary?.department || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Section</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Section {summary?.section || 'N/A'}
              </p>
            </div>
          </div>

          {/* Certificate Category Count Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300">Within College</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {summary?.totalWithinCount ?? summary?.newWithinCount ?? 0}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300">Outside College</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {summary?.totalOutsideCount ?? summary?.newOutsideCount ?? 0}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Total Portfolio</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {summary?.totalCertificates ?? summary?.newBatchCount ?? 0}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Receipt</span>
          </button>

          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              type="button"
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-piet-200 dark:border-piet-800 bg-piet-50 dark:bg-piet-950/60 text-xs sm:text-sm font-semibold text-piet-700 dark:text-piet-300 hover:bg-piet-100 dark:hover:bg-piet-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </button>
          )}

          <button
            onClick={onSubmitMore}
            type="button"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-piet-600 via-piet-700 to-purpleBrand-600 text-white shadow-lg shadow-piet-500/25 hover:shadow-piet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit More Certificates</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
