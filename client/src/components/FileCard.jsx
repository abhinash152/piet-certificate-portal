import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileText, Image as ImageIcon, Calendar, Tag, FileType, AlertCircle } from 'lucide-react';

export function FileCard({ item, onUpdate, onRemove }) {
  const { file, title, issueDate, description, previewUrl, error } = item;

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const isDoc = /\.docx?$/i.test(file.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
        error 
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800' 
          : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-piet-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        
        {/* Preview Thumbnail / Icon */}
        <div className="w-full sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center relative group">
          {isImage && previewUrl ? (
            <img
              src={previewUrl}
              alt={title || file.name}
              className="w-full h-full object-cover"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center justify-center text-rose-500 gap-1 p-2">
              <FileType className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded text-rose-700 dark:text-rose-300">
                PDF
              </span>
            </div>
          ) : isDoc ? (
            <div className="flex flex-col items-center justify-center text-blue-500 gap-1 p-2">
              <FileText className="w-8 h-8" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
                DOC
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <FileText className="w-8 h-8" />
              <span className="text-[10px] font-bold uppercase">{file.name.split('.').pop()}</span>
            </div>
          )}
        </div>

        {/* File Metadata Form */}
        <div className="flex-1 space-y-3">
          
          {/* Header Row: Filename, Size, and Remove Button */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {formatSize(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={onRemove}
              title="Remove file"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Certificate Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-piet-500" />
              Certificate Title / Event Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="e.g., Python Bootcamp 2024 or SIH Hackathon 1st Runner Up"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 focus:ring-2 focus:ring-piet-500/20 text-slate-900 dark:text-white"
            />
          </div>

          {/* Issue Date & Description Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-piet-500" />
                Issue Date / Event Date
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={issueDate || ''}
                onChange={(e) => onUpdate({ issueDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 focus:ring-2 focus:ring-piet-500/20 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Optional Description / Organizing Body
              </label>
              <input
                type="text"
                value={description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="e.g., Conducted by NPTEL / IIT Madras"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs sm:text-sm focus:outline-none focus:border-piet-500 focus:ring-2 focus:ring-piet-500/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

        </div>

      </div>
    </motion.div>
  );
}
