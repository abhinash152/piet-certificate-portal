import React, { useRef, useState } from 'react';
import { UploadCloud, FolderPlus, FileCheck2, AlertCircle } from 'lucide-react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

export function FileDropzone({ onFilesSelected, categoryTitle, categoryBadge, badgeColor, addToast }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const allowedExts = COLLEGE_CONFIG.uploads.allowedExtensions;
  const maxBytes = COLLEGE_CONFIG.uploads.maxSizeBytes;
  const maxMB = COLLEGE_CONFIG.uploads.maxSizeMB;

  const validateAndProcessFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      // Check extension
      if (!allowedExts.includes(ext)) {
        addToast(
          `'${file.name}' was skipped: Unsupported file format. Please upload JPG, PNG, WEBP, GIF, PDF, or DOC/DOCX.`,
          'error'
        );
        continue;
      }

      // Check size
      if (file.size > maxBytes) {
        addToast(
          `'${file.name}' was skipped: File size exceeds ${maxMB} MB limit.`,
          'error'
        );
        continue;
      }

      // Derive initial title from filename (clean underscores, remove extension)
      const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const initialTitle = rawName
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Generate preview URL if image
      let previewUrl = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      validFiles.push({
        id: Math.random().toString(36).substring(2, 10),
        file,
        title: initialTitle,
        issueDate: '',
        description: '',
        previewUrl
      });
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      addToast(`Added ${validFiles.length} file(s) to ${categoryBadge}.`, 'success');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer ${
        isDragOver
          ? 'border-piet-500 bg-piet-50/70 dark:bg-piet-950/40 scale-[1.01]'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40 hover:border-piet-400 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          validateAndProcessFiles(e.target.files);
          e.target.value = ''; // allow re-selecting same file
        }}
        multiple
        accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx"
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-3">
        
        {/* Upload Icon Circle */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform ${
          isDragOver ? 'scale-110 bg-piet-500 text-white' : 'bg-piet-100 dark:bg-piet-900/50 text-piet-600 dark:text-piet-400'
        }`}>
          <UploadCloud className="w-7 h-7" />
        </div>

        {/* Text Guidelines */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
              {categoryBadge}
            </span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
            Drag and drop your certificates here, or{' '}
            <span className="text-piet-600 dark:text-piet-400 underline decoration-2 underline-offset-2">
              browse files
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accepts JPG, PNG, WEBP, GIF, PDF, DOC, DOCX • Up to 10 MB per file
          </p>
        </div>

        {/* Browse Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4 text-piet-500" />
          <span>Browse from computer</span>
        </button>

      </div>
    </div>
  );
}
