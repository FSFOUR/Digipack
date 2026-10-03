import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Folder,
} from 'lucide-react';
import { CompanyDocument, DocumentType, AccessLevel } from '../../types/documents';
import { DocumentFolder } from '../../types/documents';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: DocumentFolder[];
  defaultFolderId?: string;
  onUploadSuccess: (newDoc: CompanyDocument) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  folders,
  defaultFolderId,
  onUploadSuccess,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultFolderId || (folders.length > 0 ? folders[0].id : '01')
  );
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState(`DP-DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [fileType, setFileType] = useState<DocumentType>('PDF');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('Management');
  const [tagsInput, setTagsInput] = useState('Compliance, 2026');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [isImportant, setIsImportant] = useState(false);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg('');

    // If title is empty, infer from file name
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }

    // Infer file type
    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.pdf')) setFileType('PDF');
    else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.csv')) setFileType('XLSX');
    else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) setFileType('DOCX');
    else if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) setFileType('IMAGE');
    else setFileType('OTHER');

    // Read as Data URL for preview/download capability
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFileDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }

    const folder = folders.find((f) => f.id === selectedFolderId) || folders[0];

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsUploading(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];

      const newDoc: CompanyDocument = {
        id: `doc-${Date.now()}`,
        docNumber: docNumber.trim() || `DP-DOC-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        folderId: folder.id,
        folderName: folder.name,
        fileType,
        fileName: selectedFile ? selectedFile.name : `${title.trim().replace(/\s+/g, '_')}.${fileType.toLowerCase()}`,
        fileSize: selectedFile ? formatFileSize(selectedFile.size) : '2.1 MB',
        fileSizeBytes: selectedFile ? selectedFile.size : 2200000,
        uploadedAt: dateStr,
        uploadedBy: 'Shafi (Staff / Operations)',
        accessLevel,
        tags: tags.length > 0 ? tags : ['General'],
        description: description.trim() || 'Uploaded to DigiPack document archive.',
        version: version.trim() || 'v1.0',
        isImportant,
        fileDataUrl: fileDataUrl || undefined,
      };

      onUploadSuccess(newDoc);
      setIsUploading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Upload New Document</h2>
              <p className="text-xs text-neutral-500">
                Add strategic records, staff files, wage sheets or policies to the repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1.5">
              Select or Drop File <span className="text-neutral-400 font-normal">(PDF, Excel, Word, Scans)</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/50'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-neutral-300 hover:border-blue-400 bg-neutral-50/60 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg"
              />

              {selectedFile ? (
                <div className="flex items-center gap-3 text-emerald-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm text-neutral-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-neutral-500 text-[11px]">
                      {formatFileSize(selectedFile.size)} • Click or drop to replace
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-blue-600 hover:underline">Click to upload</span> or drag and drop files here
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Supported: PDF, DOCX, XLSX, CSV, JPG, PNG (up to 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Target Folder Selector */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1.5 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              Target Folder <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {folders.map((folder) => {
                const isCurrent = selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 text-blue-900 font-bold'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-600">
                      {folder.number}
                    </span>
                    <div className="truncate">
                      <p className="font-bold text-xs truncate">{folder.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{folder.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Document Title & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-800 mb-1">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Board Resolution Q1-2026 or Health Certificate"
                required
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Doc Number / Code</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="DP-DOC-001"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* File Format, Access Level, and Version */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">File Format Type</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as DocumentType)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="PDF">PDF Document (.pdf)</option>
                <option value="DOCX">Word Document (.docx)</option>
                <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
                <option value="IMAGE">Image / Scan (.jpg, .png)</option>
                <option value="OTHER">Other Format</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Access Level</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="All Staff">All Staff (General)</option>
                <option value="Management">Management Only</option>
                <option value="HR">HR Department</option>
                <option value="Accounts">Accounts & Finance</option>
                <option value="Strictly Confidential">Strictly Confidential (Board)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-800 mb-1">Document Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Tags <span className="text-neutral-400 font-normal">(Comma separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Board, Capex, Audit, ISO"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                />
                <span className="font-bold text-neutral-800">Pin as Critical / Priority Record</span>
              </label>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-neutral-800 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document content, approval context, or reference instructions..."
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm shadow-red-950/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Save & Upload Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
