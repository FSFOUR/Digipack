import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpDataContext';
import { UserProfile, UserRole, UserAccountStatus, AuditLog } from '../../types/erp';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Activity,
  Clock,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Lock,
  KeyRound,
  Building,
  Mail,
  Phone,
  Check,
  X,
  HardDrive,
  Trash2,
  FileSpreadsheet,
  Database,
  FileCheck,
  AlertOctagon,
  LayoutDashboard,
  FileText,
  Sparkles,
  Boxes,
  ClipboardList,
  Cpu,
  Truck,
  FolderArchive,
  TrendingUp,
  BarChart3,
  CheckSquare,
} from 'lucide-react';

export interface ErpPageOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_ERP_PAGES: ErpPageOption[] = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Overview MIS & KPI analytics', icon: LayoutDashboard },
  { id: 'quotations', label: 'Quotation', desc: 'Create & calculate box quotations', icon: FileText },
  { id: 'visualizer', label: '2D Cutting Visualizer', desc: 'Sheet cutting & layout visualizer', icon: Sparkles },
  { id: 'stock', label: 'Board Stock', desc: 'Master raw materials & inventory', icon: Boxes },
  { id: 'jobcards', label: 'Job Cards', desc: 'Job cards & technical work orders', icon: ClipboardList },
  { id: 'production', label: 'Production Line', desc: 'Corrugation, printing, slotting & pasting', icon: Cpu },
  { id: 'dispatch', label: 'Despatch & Delivery', desc: 'Finished goods dispatch & challans', icon: Truck },
  { id: 'documents', label: 'Documents', desc: 'DMS file repository & specs archive', icon: FolderArchive },
  { id: 'profitability', label: 'Profitability Analysis', desc: 'Cost analysis & margins', icon: TrendingUp },
  { id: 'reports', label: 'Reports & Export', desc: 'MIS reports, production sheets, Tally export', icon: BarChart3 },
];

export const DEFAULT_ROLE_PAGES: Record<UserRole, string[]> = {
  'OWNER / ADMIN': [
    'dashboard', 'quotations', 'visualizer', 'stock', 'jobcards',
    'production', 'dispatch', 'documents', 'profitability', 'reports'
  ],
  'MANAGER': [
    'dashboard', 'quotations', 'visualizer', 'stock', 'jobcards',
    'production', 'dispatch', 'documents', 'profitability', 'reports'
  ],
  'SUPERVISOR': [
    'dashboard', 'visualizer', 'stock', 'jobcards', 'production', 'dispatch', 'documents'
  ],
  'SALES': [
    'dashboard', 'quotations', 'visualizer', 'documents', 'reports'
  ],
  'STOREKEEPER': [
    'dashboard', 'stock', 'visualizer', 'documents'
  ],
  'PURCHASE': [
    'dashboard', 'stock', 'visualizer', 'documents', 'reports'
  ],
  'PRODUCTION OPERATOR': [
    'dashboard', 'jobcards', 'production', 'documents'
  ],
  'QC': [
    'dashboard', 'jobcards', 'production', 'documents', 'reports'
  ],
  'DISPATCH': [
    'dashboard', 'jobcards', 'dispatch', 'documents'
  ],
  'ACCOUNTS': [
    'dashboard', 'quotations', 'profitability', 'reports', 'documents'
  ],
  'HR': [
    'dashboard', 'reports', 'documents'
  ],
  'VIEW ONLY': [
    'dashboard', 'quotations', 'visualizer', 'stock', 'jobcards',
    'production', 'dispatch', 'documents', 'profitability', 'reports'
  ],
};

const USERS_STORAGE_KEY = 'digipack_admin_users_list_v2';
const ACTIVITIES_STORAGE_KEY = 'digipack_admin_activity_logs_v2';
const LEGACY_USERS_KEY = 'digipack_admin_users_list_v1';
const LEGACY_ACTIVITIES_KEY = 'digipack_admin_activity_logs_v1';

// Clean initial staff users - only the verified primary administrator, zero demo users
const INITIAL_STAFF_USERS: UserProfile[] = [
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

// Clean initial activities - starts completely empty, demo entries removed
const INITIAL_ACTIVITIES: AuditLog[] = [];

const ALL_ROLES: UserRole[] = [
  'OWNER / ADMIN',
  'MANAGER',
  'SUPERVISOR',
  'SALES',
  'PURCHASE',
  'STOREKEEPER',
  'PRODUCTION OPERATOR',
  'QC',
  'ACCOUNTS',
  'HR',
  'DISPATCH',
  'VIEW ONLY',
];

interface AdminDashboardProps {
  onNavigate?: (module: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { role, profile, updateUserStatus, switchRoleForDemo } = useAuth();
  const {
    customers,
    boardStocks,
    stockTransactions,
    enquiries,
    quotations,
    salesOrders,
    materialRequirements,
    suppliers,
    purchaseOrders,
    jobCards,
    productionLogs,
    qcRecords,
    finishedGoods,
    dispatches,
    invoices,
    payments,
    employees,
    attendance,
    machines,
    auditLogs,
    clearAllErpData,
    restoreFromBackup,
  } = useErp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'approvals' | 'activity' | 'all-users' | 'backup' | 'clear-data'>('approvals');

  // Users state with localStorage persistence - purge legacy demo data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      localStorage.removeItem(LEGACY_USERS_KEY);
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load users from local storage', e);
    }
    return INITIAL_STAFF_USERS;
  });

  // Activities state - purge legacy demo data
  const [activities, setActivities] = useState<AuditLog[]>(() => {
    try {
      localStorage.removeItem(LEGACY_ACTIVITIES_KEY);
      const cached = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load activities from local storage', e);
    }
    return INITIAL_ACTIVITIES;
  });

  // Filters & Search
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserAccountStatus>('ALL');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // New staff modal
  const [newStaffModalOpen, setNewStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    staffId: `DP-STF-${Math.floor(100 + Math.random() * 900)}`,
    fullName: '',
    email: '',
    mobileNumber: '+91 ',
    department: 'Production',
    designation: 'Machine Operator',
    role: 'PRODUCTION OPERATOR' as UserRole,
    allowedPages: DEFAULT_ROLE_PAGES['PRODUCTION OPERATOR'],
  });

  // Edit existing user permissions modal
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<UserProfile | null>(null);
  const [editingAllowedPages, setEditingAllowedPages] = useState<string[]>([]);

  // Clear data confirmation modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearWipeType, setClearWipeType] = useState<'transactions_only' | 'all' | 'audit_only'>('transactions_only');
  const [confirmInput, setConfirmInput] = useState('');

  // Restore file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to persist users', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
    } catch (e) {
      console.warn('Failed to persist activities', e);
    }
  }, [activities]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add activity log helper
  const logActivity = (action: string, entityType: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: profile?.uid || 'admin-user-shafi',
      userName: profile?.fullName || 'Shafi (Admin & Manager)',
      userRole: profile?.role || 'OWNER / ADMIN',
      action,
      entityType,
      recordId,
      details,
    };
    setActivities((prev) => [newLog, ...prev]);
  };

  // User status update handler
  const handleUpdateStatus = async (
    targetUid: string,
    newStatus: UserAccountStatus,
    newRole?: UserRole
  ) => {
    const targetUser = users.find((u) => u.uid === targetUid);
    const assignedRole = newRole || targetUser?.role || 'PRODUCTION OPERATOR';

    setUsers((prev) =>
      prev.map((u) =>
        u.uid === targetUid
          ? {
              ...u,
              status: newStatus,
              role: assignedRole,
              approvedBy: profile?.fullName || 'Shafi (Admin & Manager)',
              approvedAt: new Date().toISOString(),
            }
          : u
      )
    );

    try {
      await updateUserStatus(targetUid, newStatus, assignedRole);
    } catch {
      // Handled
    }

    const actionName =
      newStatus === 'ACTIVE'
        ? 'USER_APPROVED'
        : newStatus === 'REJECTED'
        ? 'USER_REJECTED'
        : 'USER_SUSPENDED';

    logActivity(
      actionName,
      'USER_ACCOUNT',
      targetUser?.staffId || targetUid,
      `${newStatus === 'ACTIVE' ? 'Approved' : newStatus} account for ${
        targetUser?.fullName || 'Staff'
      } with role [${assignedRole}].`
    );

    showToast(`Account for ${targetUser?.fullName || 'Staff'} set to ${newStatus} (${assignedRole})`);
  };

  // Approve all pending users
  const handleApproveAllPending = () => {
    const pending = users.filter((u) => u.status === 'PENDING');
    if (pending.length === 0) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.status === 'PENDING'
          ? {
              ...u,
              status: 'ACTIVE',
              approvedBy: profile?.fullName || 'Shafi (Admin & Manager)',
              approvedAt: new Date().toISOString(),
            }
          : u
      )
    );

    pending.forEach((u) => {
      logActivity(
        'USER_APPROVED',
        'USER_ACCOUNT',
        u.staffId,
        `Batch approved staff account for ${u.fullName} (${u.role}).`
      );
    });

    showToast(`Batch approved ${pending.length} pending account(s).`);
  };

  // Add new staff
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.fullName.trim() || !newStaffForm.email.trim()) {
      alert('Please provide staff name and email.');
      return;
    }

    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      staffId: newStaffForm.staffId.trim() || `DP-STF-${Date.now().toString().slice(-3)}`,
      fullName: newStaffForm.fullName.trim(),
      email: newStaffForm.email.trim(),
      mobileNumber: newStaffForm.mobileNumber.trim(),
      department: newStaffForm.department,
      designation: newStaffForm.designation,
      role: newStaffForm.role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      approvedBy: profile?.fullName || 'Shafi (Admin & Manager)',
      approvedAt: new Date().toISOString(),
      allowedPages: newStaffForm.allowedPages,
    };

    setUsers((prev) => [newUser, ...prev]);

    logActivity(
      'USER_CREATED',
      'USER_ACCOUNT',
      newUser.staffId,
      `Created and approved staff member ${newUser.fullName} (${newUser.role}) in ${newUser.department} with [${newUser.allowedPages?.length || 0}] authorized pages.`
    );

    setNewStaffForm({
      staffId: `DP-STF-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      email: '',
      mobileNumber: '+91 ',
      department: 'Production',
      designation: 'Machine Operator',
      role: 'PRODUCTION OPERATOR',
      allowedPages: DEFAULT_ROLE_PAGES['PRODUCTION OPERATOR'],
    });

    setNewStaffModalOpen(false);
    showToast(`Created & approved account for ${newUser.fullName}`);
  };

  const handleSaveUserPermissions = () => {
    if (!editingPermissionsUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.uid === editingPermissionsUser.uid
          ? { ...u, allowedPages: editingAllowedPages }
          : u
      )
    );

    logActivity(
      'PERMISSIONS_UPDATED',
      'USER_ACCOUNT',
      editingPermissionsUser.staffId,
      `Updated role-based page permissions for ${editingPermissionsUser.fullName} (${editingAllowedPages.length} pages authorized).`
    );

    showToast(`Updated page access permissions for ${editingPermissionsUser.fullName}`);
    setEditingPermissionsUser(null);
  };

  // ==========================================
  // BACKUP FUNCTIONALITY: SAVE TO COMPUTER
  // ==========================================
  const handleExportBackupToComputer = () => {
    const backupTimestamp = new Date().toISOString();
    const formattedDate = new Date().toISOString().split('T')[0];

    const backupPayload = {
      metadata: {
        application: 'DIGI PACK ERP',
        version: '1.0.0',
        backupCreatedAt: backupTimestamp,
        exportedBy: profile?.fullName || 'Shafi (Admin & Manager)',
        userRole: profile?.role || 'OWNER / ADMIN',
        recordCounts: {
          customers: customers.length,
          boardStocks: boardStocks.length,
          stockTransactions: stockTransactions.length,
          enquiries: enquiries.length,
          quotations: quotations.length,
          salesOrders: salesOrders.length,
          materialRequirements: materialRequirements.length,
          suppliers: suppliers.length,
          purchaseOrders: purchaseOrders.length,
          jobCards: jobCards.length,
          productionLogs: productionLogs.length,
          qcRecords: qcRecords.length,
          finishedGoods: finishedGoods.length,
          dispatches: dispatches.length,
          invoices: invoices.length,
          payments: payments.length,
          employees: employees.length,
          attendance: attendance.length,
          machines: machines.length,
          users: users.length,
          activities: activities.length,
        },
      },
      data: {
        customers,
        boardStocks,
        stockTransactions,
        enquiries,
        quotations,
        salesOrders,
        materialRequirements,
        suppliers,
        purchaseOrders,
        jobCards,
        productionLogs,
        qcRecords,
        finishedGoods,
        dispatches,
        invoices,
        payments,
        employees,
        attendance,
        machines,
        users,
        activities,
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `DigiPack_ERP_Full_Backup_${formattedDate}_${Date.now().toString().slice(-4)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logActivity(
      'SYSTEM_BACKUP_DOWNLOAD',
      'SYSTEM',
      'BACKUP-FILE',
      `Full system backup exported and downloaded to computer (${(blob.size / 1024).toFixed(1)} KB).`
    );

    showToast('Full system backup successfully downloaded to your computer.');
  };

  // Restore file selection
  const handleFileSelectForRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.data || parsed.customers || parsed.boardStocks) {
          setRestorePreview(parsed);
        } else {
          alert('Invalid backup file format. Please upload a valid DigiPack ERP backup JSON file.');
        }
      } catch (err) {
        alert('Could not parse file. Please select a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Execute restore
  const handleExecuteRestore = () => {
    if (!restorePreview) return;

    const success = restoreFromBackup(restorePreview);
    if (restorePreview.data?.users && Array.isArray(restorePreview.data.users)) {
      setUsers(restorePreview.data.users);
    }
    if (restorePreview.data?.activities && Array.isArray(restorePreview.data.activities)) {
      setActivities(restorePreview.data.activities);
    }

    if (success) {
      logActivity(
        'SYSTEM_RESTORE',
        'SYSTEM',
        'RESTORE-EXEC',
        'Restored running ERP datasets from local backup file.'
      );
      setRestorePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('System data successfully restored from backup.');
    } else {
      alert('Error during data restore. Check file format.');
    }
  };

  // ==========================================
  // CLEAR DATA FUNCTIONALITY
  // ==========================================
  const handleExecuteClearData = () => {
    if (confirmInput.trim().toUpperCase() !== 'CLEAR') {
      alert('Please type CLEAR to confirm data wipe.');
      return;
    }

    if (clearWipeType === 'audit_only') {
      setActivities([]);
      clearAllErpData('audit_only');
      showToast('Activity logs cleared successfully.');
    } else if (clearWipeType === 'transactions_only') {
      clearAllErpData('transactions_only');
      setActivities([]);
      showToast('All transaction records (Quotations, Orders, Jobs, Dispatches, Invoices) cleared.');
    } else if (clearWipeType === 'all') {
      clearAllErpData('all');
      setActivities([]);
      // Keep primary admin only
      setUsers(INITIAL_STAFF_USERS);
      showToast('Complete factory reset executed. All data cleared.');
    }

    setClearModalOpen(false);
    setConfirmInput('');
  };

  // Export specific module to CSV
  const handleQuickCsvExport = (type: 'customers' | 'stock' | 'invoices' | 'jobcards') => {
    let csv = '';
    let filename = '';

    if (type === 'customers') {
      csv = 'Customer ID,Customer Name,Company,Contact Person,Mobile,Email,GSTIN,Status\n' +
        customers.map(c => `"${c.customerId}","${c.customerName}","${c.companyName}","${c.contactPerson}","${c.mobile}","${c.email}","${c.gstin}","${c.status}"`).join('\n');
      filename = 'DigiPack_Customers.csv';
    } else if (type === 'stock') {
      csv = 'Board Size,GSM,Ply,Board Type,Available Qty,Rate Per Sheet,Total Value,Location\n' +
        boardStocks.map(s => `"${s.boardSize}","${s.gsm}","${s.ply || ''}","${s.boardType}","${s.availableQty}","${s.rate}","${s.totalValue}","${s.location}"`).join('\n');
      filename = 'DigiPack_Board_Stock.csv';
    } else if (type === 'invoices') {
      csv = 'Invoice No,Date,Customer,Subtotal,Tax,Total,Paid,Balance,Status\n' +
        invoices.map(i => `"${i.invoiceNumber}","${i.date}","${i.customerName}","${i.subtotal}","${i.taxAmount}","${i.totalAmount}","${i.paidAmount}","${i.balanceAmount}","${i.paymentStatus}"`).join('\n');
      filename = 'DigiPack_Invoices.csv';
    } else if (type === 'jobcards') {
      csv = 'Job Card No,Date,Customer/Party,Item Name,Required Qty,Stage,Status\n' +
        jobCards.map(j => `"${j.jobCardNo}","${j.date}","${j.partyName}","${j.itemName}","${j.requiredQty}","${j.currentStage}","${j.status}"`).join('\n');
      filename = 'DigiPack_Job_Cards.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filename} to your computer.`);
  };

  // Metrics
  const pendingUsers = useMemo(() => users.filter((u) => u.status === 'PENDING'), [users]);
  const activeUsers = useMemo(() => users.filter((u) => u.status === 'ACTIVE'), [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false;
      if (userSearchTerm.trim()) {
        const q = userSearchTerm.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.staffId.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, statusFilter, userSearchTerm]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (activityTypeFilter !== 'ALL' && act.entityType !== activityTypeFilter) return false;
      if (activitySearchTerm.trim()) {
        const q = activitySearchTerm.toLowerCase();
        return (
          act.action.toLowerCase().includes(q) ||
          act.userName.toLowerCase().includes(q) ||
          act.recordId.toLowerCase().includes(q) ||
          act.details.toLowerCase().includes(q) ||
          act.userRole.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activities, activityTypeFilter, activitySearchTerm]);

  // Security check: Only Admin / Owner or Guest View Only can access
  const isAuthorizedAdmin = role === 'OWNER / ADMIN' || role === 'MANAGER' || role === 'VIEW ONLY';
  const isGuestViewOnly = role === 'VIEW ONLY';

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Restricted Admin Area</h2>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            The Admin Dashboard is strictly reserved for Owner and General Manager privileges to monitor user activities, approvals, backups, and data controls.
          </p>
          <div className="mt-6 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 text-left">
            <p className="font-semibold text-neutral-800">Current Role: <span className="font-bold text-red-600">{role}</span></p>
            <p className="text-[11px] text-neutral-500 mt-0.5">Switch role in the bottom sidebar menu to <strong>OWNER / ADMIN</strong> or log in.</p>
          </div>
          <button
            onClick={() => switchRoleForDemo('OWNER / ADMIN')}
            className="mt-5 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Switch to Owner / Admin Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner & Executive Command Center
            </span>
            <span className="text-xs text-neutral-400">Production Mode</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Real-time control tower for staff onboarding approvals, live user activity tracking, full computer backups, and data management.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportBackupToComputer}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5 shadow-xs"
            title="Download full database snapshot to computer"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Backup to PC</span>
          </button>

          <button
            onClick={() => {
              if (isGuestViewOnly) {
                alert('Action locked: Data management is disabled in Guest (View Only) mode.');
                return;
              }
              setActiveTab('clear-data');
            }}
            disabled={isGuestViewOnly}
            className={`px-3.5 py-2 active:scale-95 font-bold text-xs rounded-xl border transition-all flex items-center gap-1.5 ${
              isGuestViewOnly
                ? 'bg-neutral-800/60 text-neutral-500 border-neutral-800 cursor-not-allowed opacity-60'
                : 'bg-neutral-800 hover:bg-red-950/60 text-neutral-300 hover:text-red-400 border-neutral-700'
            }`}
            title={isGuestViewOnly ? 'Locked in Guest View-Only Mode' : 'Open Clear Data controls'}
          >
            {isGuestViewOnly ? <Lock className="w-4 h-4 text-amber-500" /> : <Trash2 className="w-4 h-4 text-rose-500" />}
            <span>Clear Data</span>
          </button>

          <button
            onClick={() => {
              if (isGuestViewOnly) {
                alert('Action locked: Adding staff is disabled in Guest (View Only) mode.');
                return;
              }
              setNewStaffModalOpen(true);
            }}
            disabled={isGuestViewOnly}
            className={`px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
              isGuestViewOnly
                ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
                : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white'
            }`}
            title={isGuestViewOnly ? 'Locked in Guest View-Only Mode' : 'Add New Staff User'}
          >
            {isGuestViewOnly ? <Lock className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4" />}
            <span>Add Staff User</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div
          onClick={() => setActiveTab('approvals')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === 'approvals'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-md'
              : 'bg-white border-neutral-200/90 hover:border-amber-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">
              {pendingUsers.length}
            </span>
            <span className="text-xs text-amber-700 font-semibold">
              {pendingUsers.length === 0 ? 'All accounts verified' : 'Action needed'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">
            {pendingUsers.length === 0 ? 'Zero pending requests' : 'Requires admin review'}
          </p>
        </div>

        {/* Active Staff Users */}
        <div
          onClick={() => setActiveTab('all-users')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === 'all-users'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20 shadow-md'
              : 'bg-white border-neutral-200/90 hover:border-emerald-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Active Staff Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">
              {activeUsers.length}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">Authorized profiles</span>
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">
            Factory personnel records
          </p>
        </div>

        {/* Live User Activity Stream */}
        <div
          onClick={() => setActiveTab('activity')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === 'activity'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20 shadow-md'
              : 'bg-white border-neutral-200/90 hover:border-blue-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Live User Activities
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">
              {activities.length}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">Tracked events</span>
          </div>
          <p className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Real-time action stream
          </p>
        </div>

        {/* Backup Status */}
        <div
          onClick={() => setActiveTab('backup')}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === 'backup'
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/20 shadow-md'
              : 'bg-white border-neutral-200/90 hover:border-purple-200 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Data Backup & PC Store
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-neutral-900">
              Ready to Export
            </span>
          </div>
          <p className="mt-2 text-[11px] text-purple-700 font-semibold flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Direct Computer Download
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Approvals</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'activity'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>User Activity Stream</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
            {activities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all-users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'all-users'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Directory</span>
          <span className="px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold">
            {users.length}
          </span>
        </button>

        {/* Dedicated Backup Tab */}
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-700 hover:text-blue-900 hover:bg-blue-50'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Backup & Save to PC</span>
        </button>

        {/* Dedicated Clear All Data Tab */}
        <button
          onClick={() => setActiveTab('clear-data')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'clear-data'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: User Approvals */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/60">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Pending Account Review Queue
                </h3>
                <p className="text-xs text-neutral-500">
                  Verify employee identity, department allocation, and authorize manufacturing system roles.
                </p>
              </div>

              {pendingUsers.length > 0 && (
                <button
                  onClick={() => {
                    if (isGuestViewOnly) {
                      alert('Action locked in Guest (View Only) mode.');
                      return;
                    }
                    handleApproveAllPending();
                  }}
                  disabled={isGuestViewOnly}
                  className={`px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
                    isGuestViewOnly
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isGuestViewOnly ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Check className="w-3.5 h-3.5" />}
                  Approve All Pending ({pendingUsers.length})
                </button>
              )}
            </div>

            {pendingUsers.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">All Accounts Verified</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  There are no pending account approval requests at this moment. New staff registrations will automatically appear here for review.
                </p>
                <button
                  onClick={() => setNewStaffModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add New Staff Member
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-[520px] overflow-y-auto custom-scrollbar">
                {pendingUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900">{user.fullName}</h4>
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {user.staffId}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">
                            Pending Approval
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-neutral-400" />
                            {user.department} • {user.designation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            {user.mobileNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Selection & Approval Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
                      <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-neutral-500 pl-2">Role:</span>
                        <select
                          value={user.role}
                          onChange={(e) => {
                            const newR = e.target.value as UserRole;
                            setUsers((prev) =>
                              prev.map((u) => (u.uid === user.uid ? { ...u, role: newR } : u))
                            );
                          }}
                          className="bg-white border border-neutral-200 rounded-lg text-xs font-semibold py-1 px-2 text-neutral-800 focus:outline-none"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(user.uid, 'ACTIVE', user.role)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(user.uid, 'REJECTED')}
                        className="px-3 py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-600 font-semibold text-xs rounded-xl transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: User Activity Stream */}
      {/* ========================================================================= */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
            {/* Activity Toolbar */}
            <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/60">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={activitySearchTerm}
                  onChange={(e) => setActivitySearchTerm(e.target.value)}
                  placeholder="Search user activity, action, record ID, or details..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200">
                  {['ALL', 'USER_ACCOUNT', 'PRODUCTION', 'FINANCE', 'SALES', 'QUALITY', 'SYSTEM'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActivityTypeFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                        activityTypeFilter === cat
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activities Table */}
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[580px] custom-scrollbar">
              <table className="w-full min-w-[760px] table-fixed text-left text-xs border-collapse">
                <thead className="bg-neutral-50/80 text-neutral-500 font-semibold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-36 lg:w-44">Timestamp</th>
                    <th className="px-3 py-3 text-left w-48 lg:w-56">User & Role</th>
                    <th className="px-3 py-3 text-left w-36 lg:w-44">Action</th>
                    <th className="px-3 py-3 text-left w-auto min-w-[200px]">Details & Record</th>
                    <th className="px-3 py-3 text-right hidden sm:table-cell sm:w-28">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-neutral-500 text-xs">
                        <Activity className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="font-bold text-neutral-800">No activity logged yet</p>
                        <p className="text-neutral-400 text-[11px] mt-0.5">
                          Actions like employee approvals, stage completions, stock moves, and invoice creation will appear here in real time.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="px-4 py-3 text-neutral-500 font-mono text-[11px] truncate">
                          {new Date(act.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                          <span className="block text-[10px] text-neutral-400">
                            {new Date(act.timestamp).toLocaleDateString('en-IN')}
                          </span>
                        </td>
                        <td className="px-3 py-3 truncate">
                          <p className="font-bold text-neutral-900 truncate">{act.userName}</p>
                          <span className="text-[10px] text-neutral-500 truncate block">
                            {act.userRole}
                          </span>
                        </td>
                        <td className="px-3 py-3 truncate">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-200 truncate">
                            {act.action}
                          </span>
                        </td>
                        <td className="px-3 py-3 truncate">
                          <p className="text-neutral-800 truncate font-medium">{act.details}</p>
                          <span className="font-mono text-[10px] text-neutral-400 truncate block">
                            Ref: {act.recordId}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right hidden sm:table-cell whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                            {act.entityType}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: All Staff Directory */}
      {/* ========================================================================= */}
      {activeTab === 'all-users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
            {/* User Search & Filter Bar */}
            <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/60">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Search staff name, ID, department, or role..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 text-xs">
                  {(['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                        statusFilter === st
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setNewStaffModalOpen(true)}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[580px] custom-scrollbar">
              <table className="w-full min-w-[720px] table-fixed text-left text-xs border-collapse">
                <thead className="bg-neutral-50/80 text-neutral-500 font-semibold uppercase tracking-wider text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left w-auto min-w-[200px]">Staff Member & ID</th>
                    <th className="px-3 py-3 text-left hidden sm:table-cell sm:w-36 lg:w-44">Department</th>
                    <th className="px-3 py-3 text-left w-36 lg:w-44">Assigned Role</th>
                    <th className="px-3 py-3 text-left w-24">Status</th>
                    <th className="px-4 py-3 text-right w-32 shrink-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-4 py-3 truncate">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-800 font-bold flex items-center justify-center shrink-0 text-xs">
                            {user.fullName.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-neutral-900 truncate">{user.fullName}</p>
                            <span className="font-mono text-[10px] text-neutral-400 block truncate">
                              {user.staffId} • {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 hidden sm:table-cell truncate">
                        <span className="font-medium text-neutral-800 truncate block">
                          {user.department}
                        </span>
                        <span className="text-[10px] text-neutral-400 truncate block">
                          {user.designation}
                        </span>
                      </td>

                      <td className="px-3 py-3 truncate">
                        <select
                          value={user.role}
                          disabled={isGuestViewOnly}
                          onChange={(e) => {
                            if (isGuestViewOnly) return;
                            const newR = e.target.value as UserRole;
                            handleUpdateStatus(user.uid, user.status, newR);
                          }}
                          className={`w-full bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-semibold py-1 px-1.5 text-neutral-800 focus:outline-none truncate ${
                            isGuestViewOnly ? 'cursor-not-allowed opacity-75' : ''
                          }`}
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-3 py-3 truncate">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : user.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              if (isGuestViewOnly) {
                                alert('Editing permissions is locked in Guest mode.');
                                return;
                              }
                              setEditingPermissionsUser(user);
                              setEditingAllowedPages(
                                user.allowedPages && user.allowedPages.length > 0
                                  ? user.allowedPages
                                  : DEFAULT_ROLE_PAGES[user.role] || []
                              );
                            }}
                            disabled={isGuestViewOnly}
                            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold border ${
                              isGuestViewOnly
                                ? 'text-neutral-400 cursor-not-allowed opacity-50 border-transparent'
                                : 'text-neutral-600 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-200'
                            }`}
                            title={isGuestViewOnly ? 'Locked in Guest Mode' : 'Edit Role-Based Page Access Permissions'}
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden xl:inline">Pages</span>
                          </button>

                          {user.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                if (isGuestViewOnly) {
                                  alert('Action locked in Guest mode.');
                                  return;
                                }
                                handleUpdateStatus(user.uid, 'ACTIVE');
                              }}
                              disabled={isGuestViewOnly}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                isGuestViewOnly
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              Approve
                            </button>
                          )}

                          {user.status === 'ACTIVE' && user.role !== 'OWNER / ADMIN' && (
                            <button
                              onClick={() => {
                                if (isGuestViewOnly) {
                                  alert('Action locked in Guest mode.');
                                  return;
                                }
                                handleUpdateStatus(user.uid, 'SUSPENDED');
                              }}
                              disabled={isGuestViewOnly}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isGuestViewOnly
                                  ? 'text-neutral-300 cursor-not-allowed'
                                  : 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={isGuestViewOnly ? 'Locked in Guest Mode' : 'Suspend user'}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {user.status === 'SUSPENDED' && (
                            <button
                              onClick={() => {
                                if (isGuestViewOnly) {
                                  alert('Action locked in Guest mode.');
                                  return;
                                }
                                handleUpdateStatus(user.uid, 'ACTIVE');
                              }}
                              disabled={isGuestViewOnly}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                isGuestViewOnly
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              Re-activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYSTEM BACKUP (DOWNLOAD DIRECTLY TO COMPUTER) */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Main Computer Backup Hero Card */}
          <div className="bg-gradient-to-r from-blue-900 to-neutral-900 rounded-2xl p-6 text-white shadow-xl border border-blue-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-xs font-semibold">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Computer Backup Store</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Export Full System Running Data
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl leading-relaxed">
                Download a complete, offline snapshot of all active ERP tables (Stock, Quotations, Sales Orders, Production Job Cards, Invoices, Deliveries, and Staff Accounts) directly to your computer as a secure JSON archive.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleExportBackupToComputer}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Save Backup to PC</span>
              </button>
            </div>
          </div>

          {/* Backup Summary & Contents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Included Running Tables</span>
              </div>
              <ul className="text-xs space-y-2 text-neutral-600">
                <li className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span>Board Stock Master</span>
                  <span className="font-bold text-neutral-900">{boardStocks.length} records</span>
                </li>
                <li className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span>Job Cards & Production</span>
                  <span className="font-bold text-neutral-900">{jobCards.length + productionLogs.length} records</span>
                </li>
                <li className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span>Sales Orders & Quotes</span>
                  <span className="font-bold text-neutral-900">{salesOrders.length + quotations.length} records</span>
                </li>
                <li className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                  <span>Invoices & Payments</span>
                  <span className="font-bold text-neutral-900">{invoices.length + payments.length} records</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Customers & Suppliers</span>
                  <span className="font-bold text-neutral-900">{customers.length + suppliers.length} records</span>
                </li>
              </ul>
            </div>

            {/* Restore from File Card */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Restore from PC File</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Upload a previously saved `.json` backup file from your computer to restore running data.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelectForRestore}
                className="w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
              />

              {restorePreview && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <p className="font-bold flex items-center gap-1 text-emerald-800">
                    <FileCheck className="w-4 h-4" />
                    Valid Backup Detected
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Date: {restorePreview.metadata?.backupCreatedAt || 'Recent'}
                  </p>
                  <button
                    onClick={handleExecuteRestore}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                  >
                    Confirm & Load Restore Data
                  </button>
                </div>
              )}
            </div>

            {/* Quick CSV Exports */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                <span>Quick Spreadsheet (.CSV)</span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Download individual modules in CSV format for Excel, Google Sheets, or Tally accounting:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleQuickCsvExport('stock')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-700 text-left truncate"
                >
                  Stock Master
                </button>
                <button
                  onClick={() => handleQuickCsvExport('customers')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-700 text-left truncate"
                >
                  Customers
                </button>
                <button
                  onClick={() => handleQuickCsvExport('invoices')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-700 text-left truncate"
                >
                  Tax Invoices
                </button>
                <button
                  onClick={() => handleQuickCsvExport('jobcards')}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-700 text-left truncate"
                >
                  Job Cards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CLEAR ALL DATA (DATA WIPE CONTROLS) */}
      {/* ========================================================================= */}
      {activeTab === 'clear-data' && (
        <div className="space-y-6">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-rose-950 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-950">
                  Data Reset & Wipe Command Center
                </h2>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  Use this section to wipe running transactional data or perform a full factory reset. We strongly recommend downloading a <strong>Backup to PC</strong> before executing any wipe operation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: Transactions Only */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm">Clear Running Transactions</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Wipes all quotations, sales orders, job cards, production logs, dispatches, invoices, payments, and stock movements. <strong>Preserves master stock sizes, machine list, and customer directory.</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setClearWipeType('transactions_only');
                  setConfirmInput('');
                  setClearModalOpen(true);
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Clear Transactions
              </button>
            </div>

            {/* Option 2: Audit Logs Only */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-neutral-900 text-sm">Clear Activity & Audit Logs</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Purges the live user activity feed and audit trail while keeping all production, stock, and accounting data intact.
                </p>
              </div>

              <button
                onClick={() => {
                  setClearWipeType('audit_only');
                  setConfirmInput('');
                  setClearModalOpen(true);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Clear Activity Logs
              </button>
            </div>

            {/* Option 3: Full Factory Reset */}
            <div className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-3">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-red-950 text-sm">Full Factory Reset (Wipe All)</h3>
                <p className="text-xs text-red-800/80 mt-1 leading-relaxed">
                  Completely wipes all running ERP data across all modules to a blank canvas. Keeps only the root owner account.
                </p>
              </div>

              <button
                onClick={() => {
                  setClearWipeType('all');
                  setConfirmInput('');
                  setClearModalOpen(true);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                Full System Wipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRM CLEAR DATA MODAL */}
      {/* ========================================================================= */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-red-50 text-red-900">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Confirm Data Wipe
              </h3>
              <button
                onClick={() => setClearModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-neutral-700 leading-relaxed">
                You have requested to execute:{' '}
                <strong className="text-red-600 uppercase">
                  {clearWipeType === 'all'
                    ? 'Complete Factory Data Wipe'
                    : clearWipeType === 'transactions_only'
                    ? 'Clear Running Transactions'
                    : 'Clear Audit Logs'}
                </strong>
                . This action will permanently erase the selected records from browser memory.
              </p>

              <div className="p-3 bg-neutral-100 rounded-xl space-y-1">
                <p className="font-bold text-neutral-800">Safety Verification</p>
                <p className="text-neutral-500">
                  Type <span className="font-bold text-red-600 font-mono">CLEAR</span> below to authorize:
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Type CLEAR"
                  className="w-full mt-2 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-mono uppercase font-bold focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClearModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== 'CLEAR'}
                  onClick={handleExecuteClearData}
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs transition-all ${
                    confirmInput.trim().toUpperCase() === 'CLEAR'
                      ? 'bg-red-600 hover:bg-red-700 cursor-pointer active:scale-95'
                      : 'bg-neutral-300 cursor-not-allowed'
                  }`}
                >
                  Confirm & Wipe Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD STAFF MODAL WITH ROLE-BASED EDITABLE PAGES CHECKBOXES */}
      {/* ========================================================================= */}
      {newStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
              <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-600" />
                Add & Pre-Approve Staff Member
              </h3>
              <button
                onClick={() => setNewStaffModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[72vh] custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Staff ID</label>
                  <input
                    type="text"
                    value={newStaffForm.staffId}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, staffId: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Nair"
                    value={newStaffForm.fullName}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="staff@digipack.in"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newStaffForm.mobileNumber}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, mobileNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Department</label>
                  <select
                    value={newStaffForm.department}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, department: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500"
                  >
                    <option value="Production">Production</option>
                    <option value="Stores">Stores & Warehouse</option>
                    <option value="Sales">Sales & Marketing</option>
                    <option value="Accounts">Accounts & Finance</option>
                    <option value="QC">Quality Control</option>
                    <option value="HR">HR & Admin</option>
                    <option value="Dispatch">Dispatch & Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newStaffForm.designation}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, designation: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">System Role Assigned</label>
                <select
                  value={newStaffForm.role}
                  onChange={(e) => {
                    const newR = e.target.value as UserRole;
                    setNewStaffForm({
                      ...newStaffForm,
                      role: newR,
                      allowedPages: DEFAULT_ROLE_PAGES[newR] || [],
                    });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"
                >
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role-Based Editable Pages Checkboxes Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <div>
                    <label className="block font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-red-600" />
                      Role-Based Editable Pages & Modules Access
                    </label>
                    <p className="text-[11px] text-neutral-500">
                      Check or uncheck individual pages to customize what this staff member can access and edit.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setNewStaffForm({
                          ...newStaffForm,
                          allowedPages: AVAILABLE_ERP_PAGES.map((p) => p.id),
                        })
                      }
                      className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewStaffForm({
                          ...newStaffForm,
                          allowedPages: [],
                        })
                      }
                      className="text-neutral-500 hover:text-neutral-800 font-semibold px-2 py-0.5 rounded hover:bg-neutral-100 transition-colors"
                    >
                      Clear All
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewStaffForm({
                          ...newStaffForm,
                          allowedPages: DEFAULT_ROLE_PAGES[newStaffForm.role] || [],
                        })
                      }
                      className="text-red-600 hover:text-red-800 font-semibold px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                    >
                      Role Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  {AVAILABLE_ERP_PAGES.map((page) => {
                    const isChecked = (newStaffForm.allowedPages || []).includes(page.id);
                    const PageIcon = page.icon;
                    return (
                      <label
                        key={page.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-white border-red-300 ring-1 ring-red-400/25 shadow-xs'
                            : 'bg-neutral-100/60 border-neutral-200 hover:bg-white text-neutral-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = newStaffForm.allowedPages || [];
                            const updated = e.target.checked
                              ? [...current, page.id]
                              : current.filter((id) => id !== page.id);
                            setNewStaffForm({ ...newStaffForm, allowedPages: updated });
                          }}
                          className="mt-0.5 rounded border-neutral-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`flex items-center gap-1.5 text-xs font-bold leading-tight ${
                              isChecked ? 'text-neutral-900' : 'text-neutral-600'
                            }`}
                          >
                            <PageIcon className={`w-3.5 h-3.5 ${isChecked ? 'text-red-600' : 'text-neutral-400'}`} />
                            <span>{page.label}</span>
                          </span>
                          <span className="block text-[10px] text-neutral-400 truncate mt-0.5">
                            {page.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setNewStaffModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all"
                >
                  Save & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT EXISTING USER ROLE-BASED PAGES MODAL */}
      {/* ========================================================================= */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  Edit Page Permissions: {editingPermissionsUser.fullName}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Staff ID: <span className="font-mono font-bold text-neutral-700">{editingPermissionsUser.staffId}</span> • Role: <span className="font-bold text-red-600">{editingPermissionsUser.role}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[65vh] custom-scrollbar flex-1">
              <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                <p className="text-neutral-600 text-xs">
                  Authorize or restrict which pages this user can view and edit:
                </p>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEditingAllowedPages(AVAILABLE_ERP_PAGES.map((p) => p.id))}
                    className="text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded hover:bg-blue-50 transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() => setEditingAllowedPages([])}
                    className="text-neutral-500 hover:text-neutral-800 font-semibold px-2 py-0.5 rounded hover:bg-neutral-100 transition-colors"
                  >
                    Clear All
                  </button>
                  <span className="text-neutral-300">|</span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingAllowedPages(DEFAULT_ROLE_PAGES[editingPermissionsUser.role] || [])
                    }
                    className="text-red-600 hover:text-red-800 font-semibold px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
                  >
                    Role Defaults
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                {AVAILABLE_ERP_PAGES.map((page) => {
                  const isChecked = editingAllowedPages.includes(page.id);
                  const PageIcon = page.icon;
                  return (
                    <label
                      key={page.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-white border-blue-400 ring-1 ring-blue-400/25 shadow-xs'
                          : 'bg-neutral-100/60 border-neutral-200 hover:bg-white text-neutral-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...editingAllowedPages, page.id]
                            : editingAllowedPages.filter((id) => id !== page.id);
                          setEditingAllowedPages(updated);
                        }}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`flex items-center gap-1.5 text-xs font-bold leading-tight ${
                            isChecked ? 'text-neutral-900' : 'text-neutral-600'
                          }`}
                        >
                          <PageIcon className={`w-3.5 h-3.5 ${isChecked ? 'text-blue-600' : 'text-neutral-400'}`} />
                          <span>{page.label}</span>
                        </span>
                        <span className="block text-[10px] text-neutral-400 truncate mt-0.5">
                          {page.desc}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-center justify-between">
                <span>Total Authorized Pages:</span>
                <span className="font-bold font-mono text-xs">{editingAllowedPages.length} of {AVAILABLE_ERP_PAGES.length}</span>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-100 flex items-center justify-end gap-2 bg-neutral-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-semibold transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserPermissions}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition-all text-xs"
              >
                Save Page Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
