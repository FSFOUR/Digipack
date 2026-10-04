import React from 'react';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  UserCheck,
  Home,
  Eye,
  LogIn,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  activeModule: string;
  onSelectModule: (mod: string) => void;
  onOpenQuickAction: () => void;
  onOpenUserApproval: () => void;
  onToggleSidebar?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenQuickAction,
  onOpenUserApproval,
  onToggleSidebar,
  onOpenAuthModal,
}) => {
  const { profile, role, logout, pendingUsersCount } = useAuth();

  return (
    <header className="mt-3 mx-3 mb-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-md text-white px-4 py-2.5 flex items-center justify-between shrink-0">
      {/* Zone 1: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-700 active:scale-95"
            title="Home - Show Main Menu Bar"
          >
            <Home className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold hidden sm:inline">Menu</span>
          </button>
        )}
        <div className="hidden sm:block">
          <DigiPackLogo size="sm" className="cursor-pointer" />
        </div>
      </div>

      {/* Zone 2: Breadcrumbs / Active Context (Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
        <span className="font-bold text-neutral-200 tracking-wider">DIGIPACK</span>
        <span>/</span>
        <span className="font-bold text-white uppercase tracking-wider">{activeModule}</span>
      </div>

      {/* Zone 3: Quick Action, Staff Approvals, Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="text-sm leading-none">+</span>
          <span className="hidden sm:inline">Actions</span>
        </button>

        {/* Admin Dashboard & Approvals quick link for Manager / Admin */}
        {(role === 'OWNER / ADMIN' || role === 'MANAGER') && (
          <button
            onClick={() => onSelectModule('admin')}
            className={`p-1.5 rounded-lg border transition-colors relative flex items-center gap-1.5 ${
              activeModule === 'admin'
                ? 'bg-red-600 text-white border-red-700'
                : 'text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border-neutral-700'
            }`}
            title="Admin Dashboard (User Activity & Approvals)"
          >
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold hidden sm:inline">Admin</span>
            {pendingUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        )}

        {/* Guest Mode Status & Sign In OR Profile & Logout */}
        {role === 'VIEW ONLY' ? (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-800/80 text-[11px] font-semibold" title="Guest User: All tabs in View Only mode with editing locked">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Guest (View Only · Locked)</span>
            </span>

            {onOpenAuthModal && (
              <button
                onClick={onOpenAuthModal}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                title="Sign in as Admin or Staff"
              >
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
            <div className="hidden xl:block text-right text-xs">
              <span className="block font-bold text-white truncate max-w-[120px]">
                {profile?.fullName || 'Admin'}
              </span>
              <span className="block text-[10px] text-neutral-400">
                {profile?.role || 'Staff'}
              </span>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
              title="Sign Out to Guest Mode"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
