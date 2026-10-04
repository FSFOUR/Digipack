import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  LogIn,
  ShieldAlert,
  ArrowLeft,
  Boxes,
  ClipboardList,
  Truck,
  FolderArchive,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const GUEST_LOCKED_MODULES = [
  'stock',
  'jobcards',
  'dispatch',
  'finishedgoods',
  'documents',
  'profitability',
  'reports',
] as const;

export type GuestLockedModuleId = typeof GUEST_LOCKED_MODULES[number];

interface LockedPageGuardProps {
  moduleId: GuestLockedModuleId;
  moduleTitle: string;
  moduleDescription: string;
  onNavigate: (module: string) => void;
  onOpenAuthModal: () => void;
  children: React.ReactNode;
}

const MODULE_DETAILS: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    features: string[];
    roleRequired: string;
  }
> = {
  stock: {
    icon: Boxes,
    features: [
      'Duplex board master inventory and stock valuation',
      'Opening balance, Inward (IN), and Outward (OUT) stock tracking',
      'Stock allocation to job cards & reorder level alerts',
    ],
    roleRequired: 'Storekeeper, Production, Manager or Admin',
  },
  jobcards: {
    icon: ClipboardList,
    features: [
      'Official factory job cards & manufacturing work orders',
      'Stereo identification, ply construction, printing colors & creasing dimensions',
      'Damage tracking, stage completion & manager sign-off logs',
    ],
    roleRequired: 'Supervisor, Operator, Manager or Admin',
  },
  dispatch: {
    icon: Truck,
    features: [
      'Customer delivery challan creation and lorry transport assignments',
      'Real-time box dispatch statuses (Pending, Packed, Dispatched, Delivered)',
      'Proof of delivery verification & invoice reconciliation',
    ],
    roleRequired: 'Dispatch Officer, Storekeeper, Manager or Admin',
  },
  finishedgoods: {
    icon: Truck,
    features: [
      'Customer delivery challan creation and lorry transport assignments',
      'Real-time box dispatch statuses (Pending, Packed, Dispatched, Delivered)',
      'Proof of delivery verification & invoice reconciliation',
    ],
    roleRequired: 'Dispatch Officer, Storekeeper, Manager or Admin',
  },
  documents: {
    icon: FolderArchive,
    features: [
      'Factory DMS archive for ISO compliance certificates & GST filings',
      'Customer purchase orders, quotation signatures & equipment manuals',
      'Encrypted document viewing, downloads & audit attachments',
    ],
    roleRequired: 'Authorized Staff, Accounts, Manager or Admin',
  },
  profitability: {
    icon: TrendingUp,
    features: [
      'Per-box gross profit margin & cost breakdown analysis',
      'Direct paper material cost, machine power & labour overheads',
      'Order-by-order profit margin ranking & customer profitability',
    ],
    roleRequired: 'Accounts, Owner / Admin or General Manager',
  },
  reports: {
    icon: BarChart3,
    features: [
      'Executive MIS reports, Excel exports & business intelligence summaries',
      'Raw material consumption vs output yield ratios',
      'GST tax summaries, sales turnover & ledger data exports',
    ],
    roleRequired: 'Accounts, Owner / Admin or General Manager',
  },
};

export const LockedPageGuard: React.FC<LockedPageGuardProps> = ({
  moduleId,
  moduleTitle,
  moduleDescription,
  onNavigate,
  onOpenAuthModal,
  children,
}) => {
  const { role } = useAuth();
  const isLockedForGuest = role === 'VIEW ONLY' && GUEST_LOCKED_MODULES.includes(moduleId);

  if (!isLockedForGuest) {
    return <>{children}</>;
  }

  const info = MODULE_DETAILS[moduleId] || {
    icon: Lock,
    features: ['Sensitive production and operational factory records'],
    roleRequired: 'Authorized Staff or Admin',
  };
  const ModuleIcon = info.icon;

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-3">
      <div className="bg-white rounded-3xl border border-amber-200/90 shadow-xl overflow-hidden">
        {/* Top Warning Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 p-6 text-white text-center relative">
          <div className="inline-flex p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-3 shadow-inner">
            <Lock className="w-8 h-8 text-amber-100" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-black/20 text-amber-100 text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/10">
            Guest User · Locked Module
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {moduleTitle} is Locked
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl mx-auto mt-1 leading-relaxed">
            {moduleDescription}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200">
            <div className="flex items-center gap-2 mb-3 text-neutral-900 font-bold text-xs uppercase tracking-wider">
              <ModuleIcon className="w-4 h-4 text-red-600" />
              <span>Protected Operational Content in this Module:</span>
            </div>
            <ul className="space-y-2.5">
              {info.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-900">
                Authorized Access Role: <span className="text-amber-700">{info.roleRequired}</span>
              </p>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Guests can freely browse open tabs such as MIS Dashboard, Customer Directory, Customer Enquiries, Quotations, and 2D Cutting Stock Visualizer. To unlock this module, please sign in.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl border border-neutral-300 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Unlock {moduleTitle}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
