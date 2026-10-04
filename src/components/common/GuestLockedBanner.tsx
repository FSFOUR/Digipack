import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, LogIn, ShieldAlert, Sparkles } from 'lucide-react';

interface GuestLockedBannerProps {
  onOpenAuthModal?: () => void;
  compact?: boolean;
}

export const GuestLockedBanner: React.FC<GuestLockedBannerProps> = ({
  onOpenAuthModal,
  compact = false,
}) => {
  const { role } = useAuth();

  if (role !== 'VIEW ONLY') return null;

  if (compact) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-medium text-[11px]">
            <strong>Guest Mode:</strong> View-only access across all tabs. Actions are locked.
          </span>
        </div>
        {onOpenAuthModal && (
          <button
            onClick={onOpenAuthModal}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 bg-gradient-to-r from-amber-50 via-amber-100/60 to-orange-50 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-amber-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-800 border border-amber-300 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-amber-700" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Guest User · View Only
            </span>
            <span className="font-bold text-xs text-amber-900">All Tabs & Reports Viewable</span>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            You are browsing Digipack with full view-only access across all operational modules. Creation, editing, deleting, and status changes are <strong>locked</strong>.
          </p>
        </div>
      </div>

      {onOpenAuthModal && (
        <button
          onClick={onOpenAuthModal}
          className="self-start sm:self-auto px-4 py-2 bg-neutral-900 hover:bg-black active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <LogIn className="w-3.5 h-3.5 text-amber-400" />
          <span>Sign In to Unlock</span>
        </button>
      )}
    </div>
  );
};
