import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, ExternalLink } from 'lucide-react';
import { uploadLecturePdf } from '../firebase/config';

interface PdfUploadFieldProps {
  pdfNotesUrl?: string;
  pdfStoragePath?: string;
  pdfFileName?: string;
  pdfFileSize?: number | null;
  lessonId?: string;
  onChange: (meta: {
    pdfNotesUrl: string;
    pdfStoragePath?: string;
    pdfFileName?: string;
    pdfFileSize?: number | null;
  }) => void;
}

export const PdfUploadField: React.FC<PdfUploadFieldProps> = ({
  pdfNotesUrl,
  pdfStoragePath,
  pdfFileName,
  pdfFileSize,
  lessonId,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);

    // Validate type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document (.pdf format only).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 25MB)
    const maxBytes = 25 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File size (${formatFileSize(file.size)}) exceeds the maximum limit of 25 MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadLecturePdf(file, lessonId || 'lecture', (pct) => {
        setUploadProgress(pct);
      });

      onChange({
        pdfNotesUrl: result.downloadUrl,
        pdfStoragePath: result.storagePath,
        pdfFileName: result.fileName,
        pdfFileSize: result.fileSize,
      });
    } catch (err) {
      console.error('PDF upload error:', err);
      const msg = err instanceof Error ? err.message : 'Upload failed. Please check network connection.';
      setErrorMsg(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange({
      pdfNotesUrl: '',
      pdfStoragePath: '',
      pdfFileName: '',
      pdfFileSize: null,
    });
    setErrorMsg(null);
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold text-slate-300 text-xs">
        Lecture PDF Notes & Formulas Handout
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploading Progress Bar */}
      {uploading && (
        <div className="p-3 bg-slate-950 border border-cyan-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Uploading PDF to Firebase Storage...</span>
            </span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMsg && (
        <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attached PDF State */}
      {pdfNotesUrl ? (
        <div className="p-3 bg-slate-950 border border-cyan-800/60 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {pdfFileName || 'Attached Lecture Notes.pdf'}
              </p>
              <p className="text-[10px] text-slate-400">
                {pdfFileSize ? `${formatFileSize(pdfFileSize)} • ` : ''}
                Stored in Firebase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={pdfNotesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs transition"
              title="Preview PDF"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-xs transition cursor-pointer"
              title="Remove PDF"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty State: Upload Button */
        !uploading && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-cyan-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm group"
            >
              <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Upload PDF Notes</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Accepts .pdf files up to 25 MB
            </span>
          </div>
        )
      )}
    </div>
  );
};
