import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { UserRole } from '../../types/erp';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Briefcase,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REMEMBER_KEY = 'digipack_saved_login_credentials';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerStaffAccount,
    switchRoleForDemo,
    role,
    profile,
  } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [savePassword, setSavePassword] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      return !!saved;
    } catch {
      return false;
    }
  });

  const [email, setEmail] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.email || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [password, setPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.password || '';
      }
    } catch {
      // ignore
    }
    return '';
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup fields
  const [staffId, setStaffId] = useState(`DP-STF-${Math.floor(100 + Math.random() * 900)}`);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [department, setDepartment] = useState('Production');
  const [designation, setDesignation] = useState('Machine Operator');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Reset/sync credentials when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(REMEMBER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.email || parsed.password)) {
            setEmail(parsed.email || '');
            setPassword(parsed.password || '');
            setSavePassword(true);
            setLoginError(null);
            return;
          }
        }
      } catch {
        // ignore
      }
      // If no valid saved credentials or save password was not chosen, always ensure empty
      setEmail('');
      setPassword('');
      setSavePassword(false);
      setLoginError(null);
    } else {
      // When modal is closed, if savePassword is not active, purge credentials from memory
      try {
        const saved = localStorage.getItem(REMEMBER_KEY);
        if (!saved) {
          setEmail('');
          setPassword('');
        }
      } catch {
        setEmail('');
        setPassword('');
      }
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await loginWithEmail(email, password);
      if (savePassword) {
        try {
          localStorage.setItem(
            REMEMBER_KEY,
            JSON.stringify({ email, password })
          );
        } catch {
          // ignore
        }
      } else {
        // Explicitly delete any stored credentials for all users if save password is not checked
        try {
          localStorage.removeItem(REMEMBER_KEY);
        } catch {
          // ignore
        }
        setEmail('');
        setPassword('');
      }
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerStaffAccount({
      staffId,
      fullName,
      mobileNumber,
      email,
      password,
      department,
      designation,
    });
    setSignupSuccess(true);
  };

  const departments = [
    'Management',
    'Sales',
    'Purchase',
    'Stores',
    'Production',
    'QC',
    'Accounts',
    'HR',
    'Dispatch',
    'Maintenance',
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 cursor-pointer"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-900 max-h-[90vh] flex flex-col relative cursor-default"
      >
        {/* Header */}
        <div className="p-6 bg-black text-white text-center border-b border-neutral-800 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close / Dismiss"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-3">
            <DigiPackLogo size="lg" />
          </div>
          <h2 className="text-lg font-black tracking-wide text-white uppercase">
            DIGIPACK
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Secure Staff Authentication & Authorization
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => {
              setMode('LOGIN');
              setSignupSuccess(false);
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === 'LOGIN'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Staff Login
          </button>
          <button
            onClick={() => setMode('SIGNUP')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === 'SIGNUP'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/20'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            Register Staff Account
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {loginError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">User Name or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Save password for future login checkbox */}
              <div className="flex items-center justify-between pt-0.5 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-neutral-700 hover:text-neutral-900">
                  <input
                    type="checkbox"
                    checked={savePassword}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSavePassword(checked);
                      if (!checked) {
                        try {
                          localStorage.removeItem(REMEMBER_KEY);
                        } catch {}
                      }
                    }}
                    className="w-4 h-4 text-red-600 rounded border-neutral-300 focus:ring-red-500 cursor-pointer accent-red-600"
                  />
                  <span className="text-xs font-semibold text-neutral-800">Save Password</span>
                </label>
                {savePassword && (email || password) && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('');
                      setPassword('');
                      setSavePassword(false);
                      try {
                        localStorage.removeItem(REMEMBER_KEY);
                      } catch {}
                    }}
                    className="text-[11px] text-neutral-400 hover:text-rose-600 font-medium transition-colors"
                  >
                    Clear saved
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider text-xs shadow-xs transition-colors"
              >
                Sign In to ERP Console
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-2 text-[10px] text-neutral-400 font-bold uppercase">or</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await loginWithGoogle();
                  onClose();
                }}
                className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white rounded font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Sign In with Google Account
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-black"
                >
                  Continue with Current Active Session ({role})
                </button>
              </div>
            </form>
          ) : (
            <div>
              {signupSuccess ? (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
                  <h4 className="font-bold text-sm text-amber-900">
                    Account Status: PENDING APPROVAL
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Your staff account <strong>{staffId}</strong> has been registered. For security reasons, new staff accounts cannot access ERP data until authorized by the General Manager or Managing Director.
                  </p>
                  <button
                    onClick={() => {
                      setSignupSuccess(false);
                      setMode('LOGIN');
                    }}
                    className="mt-3 px-4 py-2 bg-neutral-900 text-white rounded text-xs font-bold"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Staff ID</label>
                      <input
                        type="text"
                        required
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="w-full p-2 bg-neutral-100 border border-neutral-300 rounded font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammed Nihal"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        required
                        placeholder="+91 9847..."
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        placeholder="staff@digipack.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                      >
                        {departments.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Designation</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Printing Operator"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Create Password</label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider text-xs shadow-xs"
                  >
                    Submit for Manager Approval
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
