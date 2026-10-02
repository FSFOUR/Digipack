import React, { useState } from 'react';
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
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('Digipack@2026');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup fields
  const [staffId, setStaffId] = useState(`DP-STF-${Math.floor(100 + Math.random() * 900)}`);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [department, setDepartment] = useState('Production');
  const [designation, setDesignation] = useState('Machine Operator');
  const [signupSuccess, setSignupSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      await loginWithEmail(email, password);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-300 overflow-hidden text-neutral-900">
        {/* Header */}
        <div className="p-6 bg-black text-white text-center border-b border-neutral-800">
          <div className="flex justify-center mb-3">
            <DigiPackLogo size="lg" />
          </div>
          <h2 className="text-base font-black tracking-wide text-white uppercase">
            Duplex Master Box Manufacturing ERP
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Kakkanchery, Malappuram · Secure Staff Authentication & Authorization
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
        <div className="p-6">
          {mode === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {/* Credentials hint */}
              <div className="p-2.5 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800 text-[11px] flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-600 block">Owner / Admin Access:</span>
                  <span>User name: <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-neutral-300">admin</code> · Password: <code className="font-mono font-bold bg-white px-1 py-0.5 rounded border border-neutral-300">Digipack@2026</code></span>
                </div>
              </div>

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
                    placeholder="admin"
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
                    placeholder="Digipack@2026"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-bold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
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
