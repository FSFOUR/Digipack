import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Calendar,
  User,
  Shield,
  Tag,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Folder,
} from 'lucide-react';
import { CompanyDocument } from '../../types/documents';

interface DocumentViewerModalProps {
  document: CompanyDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteDocument: (docId: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  onDeleteDocument,
}) => {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(
      `DIGI PACK ERP // Ref: ${document.docNumber} - ${document.title}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (document.fileDataUrl) {
      const a = window.document.createElement('a');
      a.href = document.fileDataUrl;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      return;
    }

    // Generate fallback text blob for demo documents
    const content = `DIGI PACK ERP - OFFICIAL DOCUMENT ARCHIVE
===================================================
Document Title : ${document.title}
Document Code  : ${document.docNumber}
Folder         : ${document.folderName}
File Format    : ${document.fileType}
File Size      : ${document.fileSize}
Access Level   : ${document.accessLevel}
Uploaded By    : ${document.uploadedBy}
Date Uploaded  : ${document.uploadedAt}
Tags           : ${document.tags.join(', ')}

SUMMARY / DESCRIPTION:
---------------------------------------------------
${document.description || 'No additional description provided.'}

===================================================
DIGI PACK ERP Packaging Management System
Automated Verification Signature: SHA-256-${Math.random().toString(36).substring(2, 15)}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = document.fileName.endsWith(`.${document.fileType.toLowerCase()}`)
      ? document.fileName
      : `${document.fileName}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFormatBadge = () => {
    switch (document.fileType) {
      case 'PDF':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[11px] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
        );
      case 'XLSX':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[11px] flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> EXCEL
          </span>
        );
      case 'DOCX':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5" /> WORD
          </span>
        );
      case 'IMAGE':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> IMAGE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {document.fileType}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
              {renderFormatBadge()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-neutral-400">
                  {document.docNumber}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/50">
                  <Folder className="w-3 h-3" />
                  {document.folderName}
                </span>
              </div>
              <h2 className="text-base font-bold text-neutral-900 mt-0.5 truncate max-w-md sm:max-w-xl">
                {document.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-700">
          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50/80 p-3.5 rounded-xl border border-neutral-200/80">
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Upload Date
              </p>
              <p className="font-bold text-neutral-800 text-xs mt-0.5">{document.uploadedAt}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                <User className="w-3 h-3" /> Uploaded By
              </p>
              <p className="font-bold text-neutral-800 text-xs mt-0.5 truncate">{document.uploadedBy}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Access Level
              </p>
              <p className="font-bold text-neutral-800 text-xs mt-0.5">{document.accessLevel}</p>
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 uppercase font-semibold">File Size & Ver</p>
              <p className="font-bold text-neutral-800 text-xs mt-0.5">
                {document.fileSize} {document.version ? `• ${document.version}` : ''}
              </p>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div className="bg-white p-3.5 rounded-xl border border-neutral-200">
              <h4 className="font-bold text-neutral-900 text-xs mb-1">Description & Scope</h4>
              <p className="text-neutral-600 leading-relaxed">{document.description}</p>
            </div>
          )}

          {/* Document Preview Canvas / Frame */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-100 flex flex-col items-center justify-center p-8 text-center min-h-[180px]">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-neutral-200 flex items-center justify-center mb-3">
              {document.fileType === 'PDF' && <FileText className="w-7 h-7 text-red-600" />}
              {document.fileType === 'XLSX' && <FileSpreadsheet className="w-7 h-7 text-emerald-600" />}
              {document.fileType === 'DOCX' && <FileCode className="w-7 h-7 text-blue-600" />}
              {document.fileType === 'IMAGE' && <ImageIcon className="w-7 h-7 text-purple-600" />}
              {document.fileType === 'OTHER' && <FileText className="w-7 h-7 text-slate-600" />}
            </div>
            <p className="font-bold text-neutral-900 text-sm">{document.fileName}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Secure enterprise file stored in DIGI PACK ERP repository ({document.fileSize})
            </p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download File
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="font-bold text-neutral-800 text-xs mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-neutral-400" /> Document Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {document.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 font-medium text-[11px]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-xs">Confirm delete?</span>
                <button
                  onClick={() => {
                    onDeleteDocument(document.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy Ref</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
