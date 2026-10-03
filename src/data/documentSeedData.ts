import { DocumentFolder, CompanyDocument } from '../types/documents';

export const INITIAL_DOCUMENT_FOLDERS: DocumentFolder[] = [
  {
    id: '01',
    number: '01',
    name: '01 Management',
    subtitle: 'Board & Strategic Policies',
    iconType: 'management',
    fileCount: 0,
    colorScheme: {
      bg: 'bg-white',
      border: 'border-blue-100/90',
      iconBg: 'bg-blue-50/90',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-600',
    },
  },
  {
    id: '02',
    number: '02',
    name: '02 HR & Employee Records',
    subtitle: 'KYC, Dossiers & Staff Files',
    iconType: 'hr',
    fileCount: 0,
    colorScheme: {
      bg: 'bg-white',
      border: 'border-blue-100/90',
      iconBg: 'bg-blue-50/90',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-600',
    },
  },
  {
    id: '03',
    number: '03',
    name: '03 Payroll, Attendance & Leave',
    subtitle: 'Wages, Slips & Time Logs',
    iconType: 'payroll',
    fileCount: 0,
    colorScheme: {
      bg: 'bg-white',
      border: 'border-blue-100/90',
      iconBg: 'bg-blue-50/90',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-600',
    },
  },
  {
    id: '04',
    number: '04',
    name: '04 Company Policies',
    subtitle: 'Standing Orders & Governance',
    iconType: 'policies',
    fileCount: 0,
    colorScheme: {
      bg: 'bg-white',
      border: 'border-blue-100/90',
      iconBg: 'bg-blue-50/90',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-600',
    },
  },
];

// Clean empty documents repository - demo documents removed per user instruction
export const INITIAL_DOCUMENTS: CompanyDocument[] = [];
