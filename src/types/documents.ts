export interface DocumentFolder {
  id: string; // '01', '02', '03', '04'
  number: string; // '01', '02', '03', '04'
  name: string; // '01 Management', '02 HR & Employee Records', etc.
  subtitle: string; // 'Board & Strategic Policies', 'KYC, Dossiers & Staff Files', etc.
  iconType: 'management' | 'hr' | 'payroll' | 'policies';
  fileCount: number;
  colorScheme: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
  };
}

export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'IMAGE' | 'SCAN' | 'OTHER';
export type AccessLevel = 'All Staff' | 'Management' | 'HR' | 'Accounts' | 'Strictly Confidential';

export interface CompanyDocument {
  id: string;
  docNumber: string; // e.g. DOC-MGT-2026-001
  title: string;
  folderId: string; // '01', '02', '03', '04'
  folderName: string;
  fileType: DocumentType;
  fileName: string;
  fileSize: string; // e.g. "3.4 MB"
  fileSizeBytes: number;
  uploadedAt: string; // e.g. "2026-03-28"
  uploadedBy: string; // e.g. "Admin / Board Secretariat"
  accessLevel: AccessLevel;
  tags: string[];
  description?: string;
  version?: string;
  isImportant?: boolean;
  fileDataUrl?: string; // Optional real file data URL if uploaded
}
