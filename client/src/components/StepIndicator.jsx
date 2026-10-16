import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, Upload, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { step: 1, title: 'Student Details', subtitle: 'Dept, Section & Reg No', icon: User },
  { step: 2, title: 'Upload Certificates', subtitle: 'Academic & Non-Academic', icon: Upload },
  { step: 3, title: 'Submission Success', subtitle: 'Summary & Motivation', icon: CheckCircle2 },
];

export function StepIndicator({ currentStep }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-2 sm:px-4">
      <div className="relative flex items-center justify-between">
        
        {/* Background connector track */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 -z-0 rounded-full" />
        
        {/* Active colored progress fill */}
        <motion.div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-piet-600 via-piet-500 to-purpleBrand-500 rounded-full -z-0"
          initial={{ width: '0%' }}
          animate={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {STEPS.map((s) => {
          const isCompleted = currentStep > s.step;
          const isActive = currentStep === s.step;
          const StepIcon = s.icon;

          return (
            <div key={s.step} className="flex flex-col items-center relative z-10">
              
              {/* Step Circle Badge */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.08 : 1,
                  boxShadow: isActive ? '0 0 0 6px rgba(47, 123, 255, 0.2)' : 'none'
                }}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : isActive
                    ? 'bg-gradient-to-tr from-piet-600 to-purpleBrand-600 border-transparent text-white shadow-lg shadow-piet-500/25'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </motion.div>

              {/* Step Title & Subtitle */}
              <div className="mt-2.5 text-center">
                <p className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  isActive
                    ? 'text-piet-600 dark:text-piet-400'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {s.subtitle}
                </p>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}
