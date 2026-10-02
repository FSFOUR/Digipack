import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import {
  LayoutDashboard,
  FileText,
  Boxes,
  ClipboardList,
  Cpu,
  Truck,
  TrendingUp,
  BarChart3,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

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

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onToggle,
  onClose,
}) => {
  const { role, switchRoleForDemo, isAdminOrManager } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Navigation Items (configured per user specifications)
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core' },
    { id: 'quotations', label: 'Quotation', icon: FileText, category: 'Sales' },
    { id: 'visualizer', label: '2D Cutting Visualizer', icon: Sparkles, category: 'Stock' },
    { id: 'stock', label: 'Board Stock', icon: Boxes, category: 'Stock' },
    { id: 'jobcards', label: 'Job Cards', icon: ClipboardList, category: 'Production' },
    { id: 'production', label: 'Production Line', icon: Cpu, category: 'Production' },
    { id: 'dispatch', label: 'Despatch & Delivery', icon: Truck, category: 'Production' },
    { id: 'profitability', label: 'Profitability Analysis', icon: TrendingUp, category: 'Finance' },
    { id: 'reports', label: 'Reports & Export', icon: BarChart3, category: 'Admin' },
  ];

  // Role visibility filtering
  const visibleItems = navItems.filter((item) => {
    if (isAdminOrManager) return true;
    if (role === 'SUPERVISOR') {
      return ['dashboard', 'jobcards', 'production', 'qc', 'material', 'visualizer', 'dispatch'].includes(item.id);
    }
    if (role === 'SALES') {
      return ['dashboard', 'customers', 'enquiries', 'quotations', 'orders', 'visualizer'].includes(item.id);
    }
    if (role === 'STOREKEEPER') {
      return ['dashboard', 'stock', 'material', 'visualizer', 'purchasing'].includes(item.id);
    }
    if (role === 'PURCHASE') {
      return ['dashboard', 'purchasing', 'stock', 'material'].includes(item.id);
    }
    if (role === 'PRODUCTION OPERATOR') {
      return ['dashboard', 'jobcards', 'production'].includes(item.id);
    }
    if (role === 'QC') {
      return ['dashboard', 'qc', 'production', 'finishedgoods'].includes(item.id);
    }
    if (role === 'DISPATCH') {
      return ['dashboard', 'finishedgoods', 'dispatch'].includes(item.id);
    }
    if (role === 'ACCOUNTS') {
      return ['dashboard', 'invoices', 'payments', 'customers', 'reports'].includes(item.id);
    }
    if (role === 'HR') {
      return ['dashboard', 'hr', 'reports'].includes(item.id);
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

      {/* Role Switcher Tab (Moved from Top Header to Menu Bar) */}
      <div className="p-2 border-t border-neutral-800 shrink-0 relative bg-neutral-900/90">
        <button
          onClick={() => setRoleMenuOpen(!roleMenuOpen)}
          className={`w-full flex items-center gap-2 p-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-200 active:scale-[0.98] transition-all duration-150 ease-out ${
            isOpen ? 'justify-between' : 'justify-center'
          }`}
          title={`Active Role: ${role} (Click to switch)`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse"></span>
            <div
              className={`transition-all duration-200 ease-out overflow-hidden text-left ${
                isOpen
                  ? 'opacity-100 max-w-[170px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <span className="text-[9px] text-neutral-400 block uppercase tracking-wider font-semibold leading-none mb-0.5 whitespace-nowrap">
                ACTIVE ROLE
              </span>
              <span className="font-bold text-white truncate block leading-tight text-xs whitespace-nowrap">
                {role}
              </span>
            </div>
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-neutral-400 shrink-0 transition-all duration-200 ease-out ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-50 w-0'
            }`}
          />
        </button>

        {/* Upward Role Selection Popup */}
        {roleMenuOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-2 z-50">
            <div className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1.5 border-b border-neutral-800">
              Switch Role for Testing (12 Roles)
            </div>
            <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRoleForDemo(r);
                    setRoleMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors duration-150 ${
                    role === r
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{r}</span>
                  {role === r && (
                    <span className="text-[9px] bg-red-700 text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
