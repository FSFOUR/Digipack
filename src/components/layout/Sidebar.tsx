import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/erp';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  ClipboardList,
  Cpu,
  Truck,
  FolderArchive,
  TrendingUp,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

const USERS_STORAGE_KEY = 'digipack_admin_users_list_v2';

const DEFAULT_APPROVED_STAFF: UserProfile[] = [
  {
    uid: 'admin-user-shafi',
    staffId: 'DP-STAFF-001',
    fullName: 'Shafi (Admin & Manager)',
    email: 'shafi3396@gmail.com',
    mobileNumber: '+91 8590 046 637',
    department: 'Management',
    designation: 'Managing Director & Operations Head',
    role: 'OWNER / ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-09-01T00:00:00Z',
    approvedBy: 'System Root',
    approvedAt: '2026-09-01T00:00:00Z',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onToggle,
  onClose,
}) => {
  const { role, profile, switchActiveProfile, isAdminOrManager } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Load ONLY Admin-Approved Staff Accounts (status === 'ACTIVE')
  const [approvedStaff, setApprovedStaff] = useState<UserProfile[]>(() => {
    try {
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed: UserProfile[] = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const activeOnly = parsed.filter((u) => u.status === 'ACTIVE');
          if (activeOnly.length > 0) return activeOnly;
        }
      }
    } catch (e) {
      console.warn('Failed to load approved staff', e);
    }
    return DEFAULT_APPROVED_STAFF;
  });

  useEffect(() => {
    const reloadApprovedStaff = () => {
      try {
        const cached = localStorage.getItem(USERS_STORAGE_KEY);
        if (cached) {
          const parsed: UserProfile[] = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const activeOnly = parsed.filter((u) => u.status === 'ACTIVE');
            if (activeOnly.length > 0) {
              setApprovedStaff(activeOnly);
              return;
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    };
    reloadApprovedStaff();
    window.addEventListener('storage', reloadApprovedStaff);
    return () => window.removeEventListener('storage', reloadApprovedStaff);
  }, [roleMenuOpen]);

  // Navigation Items (configured per user specifications)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'quotations', label: 'Quotation', icon: FileText, category: 'Sales' },
    { id: 'visualizer', label: '2D Cutting Visualizer', icon: Sparkles, category: 'Stock' },
    { id: 'stock', label: 'Board Stock', icon: Boxes, category: 'Stock' },
    { id: 'jobcards', label: 'Job Cards', icon: ClipboardList, category: 'Production' },
    { id: 'production', label: 'Production Line', icon: Cpu, category: 'Production' },
    { id: 'dispatch', label: 'Despatch & Delivery', icon: Truck, category: 'Production' },
    { id: 'documents', label: 'Documents', icon: FolderArchive, category: 'Compliance' },
    { id: 'profitability', label: 'Profitability Analysis', icon: TrendingUp, category: 'Finance' },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3, category: 'Admin' },
  ];

  // Role visibility filtering
  const visibleItems = navItems.filter((item) => {
    // If the staff member has custom allowed pages customized by the Admin, honor them directly:
    if (profile?.allowedPages && Array.isArray(profile.allowedPages) && profile.allowedPages.length > 0) {
      return profile.allowedPages.includes(item.id);
    }

    if (isAdminOrManager) return true;
    if (role === 'SUPERVISOR') {
      return ['dashboard', 'jobcards', 'production', 'qc', 'material', 'visualizer', 'dispatch', 'documents'].includes(item.id);
    }
    if (role === 'SALES') {
      return ['dashboard', 'customers', 'enquiries', 'quotations', 'orders', 'visualizer', 'documents'].includes(item.id);
    }
    if (role === 'STOREKEEPER') {
      return ['dashboard', 'stock', 'material', 'visualizer', 'purchasing', 'documents'].includes(item.id);
    }
    if (role === 'PURCHASE') {
      return ['dashboard', 'purchasing', 'stock', 'material', 'documents'].includes(item.id);
    }
    if (role === 'PRODUCTION OPERATOR') {
      return ['dashboard', 'jobcards', 'production', 'documents'].includes(item.id);
    }
    if (role === 'QC') {
      return ['dashboard', 'qc', 'production', 'finishedgoods', 'documents'].includes(item.id);
    }
    if (role === 'DISPATCH') {
      return ['dashboard', 'finishedgoods', 'dispatch', 'documents'].includes(item.id);
    }
    if (role === 'ACCOUNTS') {
      return ['dashboard', 'invoices', 'payments', 'customers', 'reports', 'documents'].includes(item.id);
    }
    if (role === 'HR') {
      return ['dashboard', 'hr', 'reports', 'documents'].includes(item.id);
    }
    return true; // VIEW ONLY
  });

  return (
    <aside
      onMouseLeave={() => {
        // Only auto-close on mobile screens when acting as a temporary drawer; keep stable on laptop/tablet!
        if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
          onClose();
        }
      }}
      className={`fixed md:relative z-40 md:z-10 my-3 ml-3 h-[calc(100vh-1.5rem)] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl md:shadow-md transition-all duration-200 ease-out flex flex-col justify-between overflow-hidden select-none shrink-0 ${
        isOpen
          ? 'translate-x-0 w-64 opacity-100 pointer-events-auto'
          : '-translate-x-[calc(100%+2.5rem)] md:translate-x-0 w-0 md:w-0 opacity-0 pointer-events-none ml-0 border-0'
      }`}
    >
      {/* Top Header of Main Menu Bar */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between shrink-0 h-12">
        <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider px-2">
          Main Menu
        </span>
        <button
          onClick={onToggle}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 active:scale-95 transition-all duration-150 ease-out shrink-0"
          title="Collapse / Close menu bar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Menu Tabs Navigation */}
      <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto overflow-x-hidden min-h-0">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectModule(item.id);
                if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide active:scale-[0.98] transition-all duration-150 ease-out ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform duration-150" />
              <span className="whitespace-nowrap overflow-hidden text-left">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pinned Bottom Controls: User Profile, Password Reset & Admin Dashboard */}
      <div className="p-2 border-t border-neutral-800 shrink-0 relative bg-neutral-900/95 space-y-1.5">
        {/* 1. Name & Role Button (Above the password reset and admin buttons) */}
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className={`w-full flex items-center gap-2 p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 active:scale-[0.98] transition-all duration-150 ease-out ${
            isOpen ? 'justify-between' : 'justify-center'
          }`}
          title={`${profile?.fullName || 'Shafi (Admin & Manager)'} (${role}) - Click to view approved roles`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/50"></span>
            <div
              className={`transition-all duration-200 ease-out overflow-hidden text-left ${
                isOpen
                  ? 'opacity-100 max-w-[170px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <span className="font-bold text-white truncate block leading-tight text-xs whitespace-nowrap">
                {profile?.fullName || 'Shafi (Admin & Manager)'}
              </span>
              <span className="text-[10px] text-neutral-400 truncate block leading-none mt-0.5 whitespace-nowrap font-medium">
                {role}
              </span>
            </div>
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-all duration-200 ease-out ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'
            } ${roleMenuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* 2. Password Change / Reset Button (Above Admin Dashboard button) */}
        <button
          onClick={() => {
            onSelectModule('password-reset');
            if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
              onClose();
            }
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all duration-150 ease-out ${
            isOpen ? 'justify-start' : 'justify-center'
          } ${
            activeModule === 'password-reset'
              ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950/40'
              : 'bg-neutral-950/80 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800/80'
          }`}
          title="Password Reset & Forgot Password Options"
        >
          <KeyRound
            className={`w-4 h-4 shrink-0 transition-colors ${
              activeModule === 'password-reset' ? 'text-white' : 'text-amber-500'
            }`}
          />
          <span
            className={`transition-all duration-200 ease-out overflow-hidden text-left whitespace-nowrap text-xs ${
              isOpen
                ? 'opacity-100 max-w-[170px] translate-x-0'
                : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
            }`}
          >
            Password & Security
          </span>
        </button>

        {/* 3. Admin Dashboard Button (Below Name/Role & Password Reset) */}
        {isAdminOrManager && (
          <button
            onClick={() => {
              onSelectModule('admin');
              if (typeof window !== 'undefined' && window.innerWidth < 768 && onClose) {
                onClose();
              }
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide active:scale-[0.98] transition-all duration-150 ease-out ${
              isOpen ? 'justify-start' : 'justify-center'
            } ${
              activeModule === 'admin'
                ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40'
                : 'bg-neutral-950/90 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
            }`}
            title="Admin Dashboard"
          >
            <ShieldCheck
              className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                activeModule === 'admin' ? 'text-white' : 'text-red-500'
              }`}
            />
            <span
              className={`whitespace-nowrap overflow-hidden text-left transition-all duration-200 ${
                isOpen
                  ? 'opacity-100 max-w-[170px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
              }`}
            >
              Admin Dashboard
            </span>
          </button>
        )}

        {/* Admin Approved Roles Selection Popup */}
        {roleMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2 py-1.5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Admin Approved Roles
                </span>
                <p className="text-[10px] text-neutral-400">
                  Verified staff profiles authorized by admin
                </p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-mono font-bold">
                {approvedStaff.length}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 space-y-1">
              {approvedStaff.map((staff) => {
                const isCurrent =
                  (profile?.uid && profile.uid === staff.uid) ||
                  (!profile?.uid && staff.role === role);
                return (
                  <button
                    key={staff.uid}
                    onClick={() => {
                      switchActiveProfile(staff);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all duration-150 flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate font-bold">{staff.fullName}</span>
                        <span
                          className={`text-[9px] px-1 rounded font-mono ${
                            isCurrent ? 'bg-red-700 text-white' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {staff.staffId}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] flex items-center gap-1 truncate mt-0.5 ${
                          isCurrent ? 'text-red-100' : 'text-neutral-400'
                        }`}
                      >
                        <span className="font-semibold">{staff.role}</span>
                        <span>•</span>
                        <span className="truncate">{staff.department}</span>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="text-[9px] bg-white text-red-700 px-1.5 py-0.5 rounded font-bold shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Approved
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {approvedStaff.length <= 1 && (
              <div className="mt-1 pt-1.5 border-t border-neutral-800/80 px-2 text-[10px] text-neutral-500">
                Only verified admin-approved roles appear here.
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
