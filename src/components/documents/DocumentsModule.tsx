import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  UploadCloud,
  Search,
  Filter,
  Folder,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Download,
  Eye,
  Trash2,
  Tag,
  ShieldCheck,
  CheckCircle,
  HardDrive,
  Plus,
  Lock,
} from 'lucide-react';
import { CompanyDocument, DocumentFolder, DocumentType } from '../../types/documents';
import { INITIAL_DOCUMENT_FOLDERS } from '../../data/documentSeedData';
import { DocumentFolderCard } from './DocumentFolderCard';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DocumentViewerModal } from './DocumentViewerModal';

const STORAGE_KEY = 'digipack_documents_records_v2';
const LEGACY_STORAGE_KEY = 'digipack_documents_records_v1';

export const DocumentsModule: React.FC = () => {
  const { role } = useAuth();
  const isGuest = role === 'VIEW ONLY';
  // Folders state
  const [folders] = useState<DocumentFolder[]>(INITIAL_DOCUMENT_FOLDERS);

  // Documents state - starts completely clean/empty (no demo documents)
  const [documents, setDocuments] = useState<CompanyDocument[]>(() => {
    try {
      // Clear legacy demo storage if present
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load documents from local storage', e);
    }
    return [];
  });

  // Filter & Search states
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'size-desc'>('date-desc');

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CompanyDocument | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Save to localStorage whenever documents change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to persist documents to localStorage', e);
    }
  }, [documents]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Add document handler
  const handleAddDocument = (newDoc: CompanyDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    showToast(`Document "${newDoc.title}" uploaded successfully to ${newDoc.folderName}`);
  };

  // Delete document handler
  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    showToast('Document removed from archive.');
  };

  // Calculate actual file counts per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      '01': 0,
      '02': 0,
      '03': 0,
      '04': 0,
    };
    documents.forEach((doc) => {
      if (counts[doc.folderId] !== undefined) {
        counts[doc.folderId]++;
      } else {
        counts[doc.folderId] = (counts[doc.folderId] || 0) + 1;
      }
    });
    return counts;
  }, [documents]);

  // Total storage size calculation
  const totalSizeBytes = useMemo(() => {
    return documents.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);
  }, [documents]);

  const formattedTotalSize = useMemo(() => {
    if (totalSizeBytes === 0) return '0.0 MB';
    const mb = totalSizeBytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }, [totalSizeBytes]);

  // Filtered & Sorted documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Folder filter
        if (selectedFolderId && doc.folderId !== selectedFolderId) {
          return false;
        }

        // Type filter
        if (selectedType !== 'ALL' && doc.fileType !== selectedType) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = doc.title.toLowerCase().includes(q);
          const matchesDocNo = doc.docNumber.toLowerCase().includes(q);
          const matchesFolder = doc.folderName.toLowerCase().includes(q);
          const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
          const matchesDesc = (doc.description || '').toLowerCase().includes(q);
          return matchesTitle || matchesDocNo || matchesFolder || matchesTags || matchesDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        if (sortBy === 'date-asc') return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'size-desc') return (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
        return 0;
      });
  }, [documents, selectedFolderId, selectedType, searchQuery, sortBy]);

  // Format icon helper
  const getFormatIcon = (type: DocumentType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'XLSX':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'DOCX':
        return <FileCode className="w-4 h-4 text-blue-600" />;
      case 'IMAGE':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const getFormatBadge = (type: DocumentType) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-50 text-red-700 border-red-200/60';
      case 'XLSX':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'DOCX':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'IMAGE':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-5">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner & Upload Action Button */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 font-bold text-[10px] uppercase tracking-wider">
              Records & Compliance
            </span>
            <span className="text-xs text-neutral-400">DIGI PACK ERP DMS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-1">
            Company Documents
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Centralized repository for corporate governance, staff records, wage sheets and factory standing orders.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="font-semibold">{documents.length}</span> Total Documents
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{folders.length}</span> Categories
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
              <span>{formattedTotalSize}</span> Storage
            </div>
          </div>
        </div>

        {/* Primary Action Button: "Upload Document" */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              if (isGuest) {
                alert('Action locked: Document upload is disabled in Guest (View Only) mode.');
                return;
              }
              setUploadModalOpen(true);
            }}
            disabled={isGuest}
            className={`px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 select-none ${
              isGuest
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-red-950/20'
            }`}
            title={isGuest ? 'Locked in Guest Mode' : 'Upload Document'}
          >
            {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <UploadCloud className="w-4 h-4" />}
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Snap Folders Section (Exact 4 Folders as in Attached Image) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Document Folders
            </h2>
            <span className="text-xs text-neutral-400 font-normal">
              (Select a folder to filter records)
            </span>
          </div>

          {selectedFolderId && (
            <button
              onClick={() => setSelectedFolderId(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Show All Folders
            </button>
          )}
        </div>

        {/* 4 Cards Grid - Matches Snap Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            const actualCount = folderCounts[folder.id] ?? 0;

            return (
              <DocumentFolderCard
                key={folder.id}
                folder={folder}
                isSelected={isSelected}
                actualFileCount={actualCount}
                onClick={() => {
                  if (selectedFolderId === folder.id) {
                    setSelectedFolderId(null);
                  } else {
                    setSelectedFolderId(folder.id);
                  }
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Document Explorer / Table Area - Fully Responsive without bottom scroll bar */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden w-full max-w-full">
        {/* Search, Filter & Controls Toolbar */}
        <div className="p-4 border-b border-neutral-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/50">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, reference code, tags, or folder..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Right: Format filters & sort */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Format Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
              {['ALL', 'PDF', 'XLSX', 'DOCX', 'IMAGE'].map((ft) => (
                <button
                  key={ft}
                  onClick={() => setSelectedType(ft)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                    selectedType === ft
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-2.5 pr-7 py-1.5 bg-white border border-neutral-200 rounded-xl text-[11px] font-semibold text-neutral-700 focus:outline-none cursor-pointer"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="size-desc">Largest File</option>
              </select>
            </div>
          </div>
        </div>

        {/* Current Active Filter Indicator */}
        {(selectedFolderId || searchQuery || selectedType !== 'ALL') && (
          <div className="px-4 py-2 bg-blue-50/40 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Filtered by:{' '}
                {selectedFolderId
                  ? folders.find((f) => f.id === selectedFolderId)?.name
                  : 'All Folders'}
                {selectedType !== 'ALL' ? ` • ${selectedType}` : ''}
                {searchQuery ? ` • Search: "${searchQuery}"` : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedFolderId(null);
                setSelectedType('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-blue-700 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Content: Empty State or Document Rows */}
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-200">
              <Folder className="w-7 h-7 text-neutral-400" />
            </div>
            <h3 className="font-bold text-neutral-800 text-sm">No documents in repository</h3>
            <p className="text-xs text-neutral-400 max-w-md mt-1">
              {documents.length === 0
                ? 'Your company documents archive is currently empty. Click "Upload Document" above to upload files to Management, HR, Payroll, or Company Policies.'
                : 'No documents match your active search or folder filter. Try clearing filters.'}
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mt-4 px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          /* Table View - Guaranteed NO horizontal scrollbar with action buttons fully visible inside */
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left text-xs border-collapse">
              <thead className="bg-neutral-50/80 text-neutral-500 font-semibold uppercase tracking-wider text-[10px] border-b border-neutral-200 select-none">
                <tr>
                  <th className="px-4 py-3 text-left w-auto min-w-[180px]">Document Title & Code</th>
                  <th className="px-3 py-3 text-left hidden sm:table-cell sm:w-36 lg:w-48">Folder</th>
                  <th className="px-2 py-3 text-center w-14 sm:w-16">Format</th>
                  <th className="px-3 py-3 text-left hidden lg:table-cell lg:w-32">Access</th>
                  <th className="px-3 py-3 text-left hidden md:table-cell md:w-36">Uploaded</th>
                  <th className="px-3 py-3 text-right hidden sm:table-cell sm:w-20">Size</th>
                  <th className="px-4 py-3 text-right w-24 shrink-0">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setViewerModalOpen(true);
                    }}
                  >
                    {/* Title & Ref Code - Fluid Column */}
                    <td className="px-4 py-3 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-neutral-100 border border-neutral-200/80 shrink-0">
                          {getFormatIcon(doc.fileType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-neutral-900 truncate group-hover:text-blue-700 transition-colors">
                            {doc.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-neutral-400 font-semibold truncate">
                              {doc.docNumber}
                            </span>
                            {doc.isImportant && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold shrink-0">
                                Priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Folder Badge - Hidden on xs mobile */}
                    <td className="px-3 py-3 hidden sm:table-cell truncate">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 truncate max-w-full">
                        <Folder className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{doc.folderName}</span>
                      </span>
                    </td>

                    {/* Format Badge */}
                    <td className="px-2 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${getFormatBadge(
                          doc.fileType
                        )}`}
                      >
                        {doc.fileType}
                      </span>
                    </td>

                    {/* Access Level - Hidden on <lg */}
                    <td className="px-3 py-3 hidden lg:table-cell truncate text-neutral-600">
                      <span className="inline-flex items-center gap-1 text-[11px] truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{doc.accessLevel}</span>
                      </span>
                    </td>

                    {/* Uploaded By & Date - Hidden on <md */}
                    <td className="px-3 py-3 hidden md:table-cell truncate">
                      <p className="font-medium text-neutral-800 text-xs truncate">
                        {doc.uploadedBy}
                      </p>
                      <p className="text-[10px] text-neutral-400">{doc.uploadedAt}</p>
                    </td>

                    {/* Size - Hidden on <sm */}
                    <td className="px-3 py-3 hidden sm:table-cell text-right font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                      {doc.fileSize}
                    </td>

                    {/* Action buttons - Always visible inside row, no horizontal scrolling needed! */}
                    <td
                      className="px-4 py-3 text-right shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setViewerModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Preview details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setViewerModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (isGuest) {
                              alert('Action locked: Deleting documents is disabled in Guest (View Only) mode.');
                              return;
                            }
                            if (window.confirm(`Delete document "${doc.title}"?`)) {
                              handleDeleteDocument(doc.id);
                            }
                          }}
                          disabled={isGuest}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isGuest
                              ? 'text-neutral-300 cursor-not-allowed'
                              : 'text-neutral-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title={isGuest ? 'Locked in Guest Mode' : 'Delete record'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        folders={folders}
        defaultFolderId={selectedFolderId || '01'}
        onUploadSuccess={handleAddDocument}
      />

      {/* Document Details & Viewer Modal */}
      <DocumentViewerModal
        document={selectedDoc}
        isOpen={viewerModalOpen}
        onClose={() => {
          setViewerModalOpen(false);
          setSelectedDoc(null);
        }}
        onDeleteDocument={handleDeleteDocument}
      />
    </div>
  );
};
