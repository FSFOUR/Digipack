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
  ShieldCheck,
  Send,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Phone,
  Sparkles,
  Check,
} from 'lucide-react';

interface PasswordSecurityPageProps {
  onNavigate: (module: string) => void;
}

export const PasswordSecurityPage: React.FC<PasswordSecurityPageProps> = ({ onNavigate }) => {
  const { profile, role, changePassword, sendResetEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<'RESET' | 'FORGOT' | 'GUIDELINES'>('RESET');

  // Direct Reset state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState(profile?.email || 'shafi3396@gmail.com');
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Not entered', color: 'bg-neutral-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, text: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score, text: 'Medium', color: 'bg-amber-500' };
    return { score, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match. Please verify and try again.' });
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `${res.message} Your new credentials are now active.`,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'An error occurred while updating password.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid registered email address.' });
      return;
    }

    setLoading(true);
    try {
      const res = await sendResetEmail(forgotEmail.trim());
      if (res.success) {
        setEmailSent(true);
        setFeedback({
          type: 'success',
          message: `Password reset instructions sent to ${forgotEmail}. Follow the link in your email.`,
        });
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to send recovery email.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors active:scale-95 flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span>DIGI PACK</span>
              <span>/</span>
              <span>SECURITY</span>
              <span>/</span>
              <span className="text-red-600 font-bold uppercase">PASSWORD OPTIONS</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2 mt-0.5">
              Password Reset & Security Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Admin Approved Profile</span>
          </span>
        </div>
      </div>

      {/* Profile Security Overview Card */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 text-red-500 font-black text-xl flex items-center justify-center border border-red-500/30 shrink-0">
              {(profile?.fullName || 'S').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white">{profile?.fullName || 'Shafi (Admin & Manager)'}</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold tracking-wider uppercase">
                  {role}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Staff ID: <span className="font-mono text-neutral-200">{profile?.staffId || 'DP-DIR-001'}</span> • Department: <span className="text-neutral-200">{profile?.department || 'Management'}</span>
              </p>
              <p className="text-xs text-neutral-400">
                Registered Email: <span className="font-mono text-neutral-200">{profile?.email || 'shafi3396@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-neutral-800 pt-3 md:pt-0 md:pl-5">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">Authentication Engine</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Firebase Auth Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-neutral-200 bg-white rounded-t-2xl px-4 pt-2 gap-2 shadow-xs">
        <button
          onClick={() => {
            setActiveTab('RESET');
            setFeedback(null);
          }}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'RESET'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Reset / Change Password</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('FORGOT');
            setFeedback(null);
          }}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'FORGOT'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Forgot Password Option</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('GUIDELINES');
            setFeedback(null);
          }}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'GUIDELINES'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Security Guidelines</span>
        </button>
      </div>

      {/* Feedback Alert Box */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 shadow-xs animate-in fade-in duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold">{feedback.type === 'success' ? 'Operation Successful' : 'Action Failed'}</p>
            <p className="text-xs mt-0.5 leading-relaxed">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-b-2xl border border-neutral-200 p-6 shadow-xs">
        {/* TAB 1: RESET / CHANGE PASSWORD */}
        {activeTab === 'RESET' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Set a New Password</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your desired new password below. It will update your account across DIGI PACK ERP immediately.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Current Password (Optional Verification)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter current password if known"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Strength:</span>
                      <span className="font-bold text-neutral-700">{strength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-neutral-200'}`} />
                      <div className={`h-full flex-1 rounded-full ${strength.score >= 4 ? strength.color : 'bg-neutral-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-5 py-3 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: FORGOT PASSWORD OPTION */}
        {activeTab === 'FORGOT' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Forgot Your Password?</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                If you have forgotten your password or cannot access your profile, request a recovery link sent to your registered staff email.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Registered Staff Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Default email associated with your profile: <span className="font-mono font-semibold text-neutral-800">{profile?.email || 'shafi3396@gmail.com'}</span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  How Password Recovery Works:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px]">
                  <li>You will receive an automated link generated by Firebase Authentication.</li>
                  <li>Clicking the link will open a secure verification window to create your new password.</li>
                  <li>The link remains valid for 1 hour for optimal security.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || resendCooldown > 0}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Sending Reset Link...'
                      : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Send Password Reset Email'}
                  </span>
                </button>

                {emailSent && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(profile?.email || 'shafi3396@gmail.com');
                      setEmailSent(false);
                    }}
                    className="p-3 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Another Email</span>
                  </button>
                )}
              </div>
            </form>

            {/* Emergency Hotline for Staff */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                Need Immediate Administrator Assistance?
              </h4>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-neutral-900">Managing Director / Administrator Desk</p>
                  <p className="text-neutral-500 text-[11px]">Shafi • Operations & Plant Management</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="tel:+918590046637"
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-red-400" />
                    <span>+91 8590 046 637</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDELINES & BEST PRACTICES */}
        {activeTab === 'GUIDELINES' && (
          <div className="max-w-2xl space-y-5 text-neutral-700 text-xs">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Enterprise Security Policies</h3>
              <p className="text-neutral-500 mt-1">
                Security best practices enforced for DIGI PACK ERP systems.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">Strong Passwords</h4>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Use at least 8 characters with a mix of uppercase letters, numbers, and special symbols.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">Role Authorization</h4>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Only accounts approved by management can access critical production lines and finance reports.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">Single Device Session</h4>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Do not share your password across terminals or with unauthorized external visitors.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-sm">Audit Trail Logging</h4>
                <p className="text-neutral-600 text-[11px] leading-relaxed">
                  Password changes and role updates are recorded in the central compliance audit log.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
