import React from 'react';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  UserCheck,
  Home,
} from 'lucide-react';

interface NavbarProps {
  activeModule: string;
  onSelectModule: (mod: string) => void;
  onOpenQuickAction: () => void;
  onOpenUserApproval: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onOpenQuickAction,
  onOpenUserApproval,
  onToggleSidebar,
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
        <span className="font-semibold text-neutral-300">DIGI PACK</span>
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

        {/* User Approval quick link for Manager / Admin */}
        {(role === 'OWNER / ADMIN' || role === 'MANAGER') && (
          <button
            onClick={onOpenUserApproval}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors relative"
            title="Manage Staff Accounts & Approvals"
          >
            <UserCheck className="w-4 h-4" />
            {pendingUsersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>
        )}

        {/* Profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="hidden xl:block text-right text-xs">
            <span className="block font-bold text-white truncate max-w-[100px]">
              {profile?.fullName || 'Shafi'}
            </span>
            <span className="block text-[10px] text-neutral-400">
              {profile?.department || 'Operations'}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
