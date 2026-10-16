import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, Flag, CheckCircle, FileText, Calendar, User, Tag, AlertTriangle, ExternalLink } from 'lucide-react';
import { getFileUrl, getCertificateDownloadUrl } from '../utils/urlUtils';
import axios from 'axios';

export function CertificateViewerModal({ certificate, student, token, onClose, onRefresh, addToast, readOnly = false }) {
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState(certificate.flag_reason || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!certificate) return null;

  const isImage = certificate.mime_type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(certificate.stored_filename);
  const isPdf = certificate.mime_type === 'application/pdf' || /\.pdf$/i.test(certificate.stored_filename);
  const fileUrl = getFileUrl(certificate.file_path);

  // Flag or Unflag
  const handleToggleFlag = async () => {
    setActionLoading(true);
    try {
      const nextStatus = certificate.status === 'flagged' ? 'valid' : 'flagged';
      const res = await axios.patch(
        `/api/mentor/certificates/${certificate.id}/flag`,
        { status: nextStatus, flagReason: nextStatus === 'flagged' ? flagReason : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        addToast(res.data.message, 'success');
        setIsFlagging(false);
        onRefresh();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update certificate flag status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete certificate
  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await axios.delete(`/api/mentor/certificates/${certificate.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        addToast(res.data.message, 'success');
        onRefresh();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete certificate.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm -z-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                certificate.category === 'academic' || certificate.category === 'within'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                  : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
              }`}>
                {certificate.category === 'academic' || certificate.category === 'within' ? 'Academic Certificate' : 'Non-Academic Certificate'}
              </span>
              {certificate.status === 'flagged' && (
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Invalid / Flagged</span>
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Certificate Preview (8 cols on large) */}
            <div className="lg:col-span-7 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[280px] p-2 relative overflow-hidden">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={certificate.title}
                  className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-sm"
                />
              ) : isPdf ? (
                <iframe
                  src={fileUrl}
                  title={certificate.title}
                  className="w-full h-[450px] rounded-xl border-0"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {certificate.original_filename}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Document preview not directly embeddable.
                  </p>
                  <a
                    href={getCertificateDownloadUrl(certificate.id) || fileUrl}
                    download={certificate.original_filename}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-piet-600 text-white text-xs font-semibold shadow hover:bg-piet-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download to View</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right: Certificate Metadata & Assessment Panel (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400">Certificate Title</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {certificate.title}
                  </h3>
                </div>

                {/* Student Info */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student:</span>
                    <strong className="text-slate-900 dark:text-white">{student?.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reg No:</span>
                    <span className="font-mono font-bold text-piet-600 dark:text-piet-400">{student?.reg_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Department:</span>
                    <span className="text-slate-800 dark:text-slate-200">{student?.department} (Sec {student?.section})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Event:</span>
                    <span className="text-slate-800 dark:text-slate-200">{certificate.issue_date || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uploaded On:</span>
                    <span className="text-slate-800 dark:text-slate-200">{new Date(certificate.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {certificate.description && (
                  <div>
                    <span className="text-xs text-slate-400">Description / Organizing Body</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      {certificate.description}
                    </p>
                  </div>
                )}

                {/* Flag Warning Banner */}
                {certificate.status === 'flagged' && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Certificate Flagged as Invalid
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      Reason: {certificate.flag_reason || 'Marked as invalid by mentor'}
                    </p>
                  </div>
                )}

                {/* Flag Input Form if toggled */}
                {isFlagging && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2 text-xs"
                  >
                    <label className="font-bold text-amber-900 dark:text-amber-200 block">
                      Reason for Flagging as Invalid:
                    </label>
                    <input
                      type="text"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      placeholder="e.g., Unclear issuer, duplicate or incomplete name"
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsFlagging(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleToggleFlag}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                      >
                        Confirm Flag
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Delete Confirmation if toggled */}
                {isDeleting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2 text-xs"
                  >
                    <p className="font-bold text-rose-900 dark:text-rose-200">
                      Permanently delete this certificate?
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      This removes the record and the physical file from the PIET uploads folder.
                    </p>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setIsDeleting(false)}
                        className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                      >
                        Delete Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={getCertificateDownloadUrl(certificate.id) || fileUrl}
                  download={certificate.original_filename}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[120px] py-2.5 px-3 rounded-xl bg-piet-600 text-white text-xs font-bold shadow hover:bg-piet-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>

                {readOnly ? (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    Peer Achievement • View Only
                  </span>
                ) : (
                  <>
                    {certificate.status === 'flagged' ? (
                      <button
                        onClick={handleToggleFlag}
                        disabled={actionLoading}
                        className="py-2.5 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark as Valid</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsFlagging(true);
                          setIsDeleting(false);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-1.5 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Flag as Invalid</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDeleting(true);
                        setIsFlagging(false);
                      }}
                      className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
