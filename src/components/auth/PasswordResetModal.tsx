import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, role, changePassword, sendResetEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<'DIRECT' | 'EMAIL'>('DIRECT');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState(profile?.email || 'shafi3396@gmail.com');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match. Please re-type carefully.' });
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 2200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await sendResetEmail(resetEmail.trim());
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 3000);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to send reset email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Password Change & Reset</h3>
              <p className="text-[11px] text-neutral-400">Update security credentials for your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User Info Card */}
        <div className="p-4 bg-neutral-950/40 border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 font-bold flex items-center justify-center text-xs shrink-0 border border-red-500/30">
              {(profile?.fullName || 'S').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white truncate">{profile?.fullName || 'Shafi (Admin & Manager)'}</p>
              <p className="text-[11px] text-neutral-400 font-mono truncate">{profile?.staffId || 'DP-DIR-001'} • {profile?.email || 'shafi3396@gmail.com'}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold shrink-0 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {role}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 mx-4 mt-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DIRECT');
              setFeedback(null);
            }}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'DIRECT'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Set New Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('EMAIL');
              setFeedback(null);
            }}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'EMAIL'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Send Email Reset
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3.5">
          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-150 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800/80 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{feedback.message}</span>
            </div>
          )}

          {activeTab === 'DIRECT' ? (
            <form onSubmit={handleDirectPasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter password to confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendResetEmail} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Registered Staff Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="your-email@digipack.in"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 text-xs"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  We will send a secure link to your email address where you can reset your password immediately.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Link...' : 'Send Reset Email'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
