import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import { X, ShieldCheck, UserX, UserCheck, AlertTriangle } from 'lucide-react';

interface UserApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserApprovalModal: React.FC<UserApprovalModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateUserStatus } = useAuth();

  // Simulated list of staff accounts for review
  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      uid: 'user-pending-01',
      staffId: 'DP-STF-104',
      fullName: 'Muhammed Nihal',
      email: 'nihal@digipack.in',
      mobileNumber: '+91 9745 667 890',
      department: 'Production',
      designation: 'Folding Machine Operator',
      role: 'PRODUCTION OPERATOR',
      status: 'PENDING',
      createdAt: '2026-09-24T10:00:00Z',
    },
    {
      uid: 'user-pending-02',
      staffId: 'DP-STF-105',
      fullName: 'Anoop Raj',
      email: 'anoop@digipack.in',
      mobileNumber: '+91 9496 112 334',
      department: 'Stores',
      designation: 'Assistant Storekeeper',
      role: 'STOREKEEPER',
      status: 'PENDING',
      createdAt: '2026-09-24T12:30:00Z',
    },
    {
      uid: 'user-active-01',
      staffId: 'DP-STF-102',
      fullName: 'Manojkumar K.',
      email: 'manoj@digipack.in',
      mobileNumber: '+91 9447 111 222',
      department: 'Production',
      designation: 'Head Printing Operator',
      role: 'PRODUCTION OPERATOR',
      status: 'ACTIVE',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      uid: 'user-active-02',
      staffId: 'DP-STF-103',
      fullName: 'Unni P.',
      email: 'unni@digipack.in',
      mobileNumber: '+91 9745 888 999',
      department: 'Accounts',
      designation: 'Senior Accountant',
      role: 'ACCOUNTS',
      status: 'ACTIVE',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ]);

  if (!isOpen) return null;

  const handleStatusChange = async (
    targetUid: string,
    newStatus: UserProfile['status'],
    newRole?: UserRole
  ) => {
    setUsersList((prev) =>
      prev.map((u) => (u.uid === targetUid ? { ...u, status: newStatus, role: newRole || u.role } : u))
    );
    try {
      await updateUserStatus(targetUid, newStatus, newRole);
    } catch {
      // Ignored for local demo fallback
    }
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Staff Account Management & Approval</h3>
              <p className="text-[11px] text-neutral-400">
                Authorized: {profile?.fullName} ({profile?.role})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="border border-neutral-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 font-bold text-neutral-700">
                  <th className="p-2.5">Staff ID</th>
                  <th className="p-2.5">Full Name & Contact</th>
                  <th className="p-2.5">Dept / Designation</th>
                  <th className="p-2.5">Assigned Role</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {usersList.map((user) => (
                  <tr key={user.uid} className="hover:bg-neutral-50">
                    <td className="p-2.5 font-bold text-neutral-900">{user.staffId}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-neutral-900">{user.fullName}</div>
                      <div className="text-[11px] text-neutral-500">{user.email} · {user.mobileNumber}</div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-medium text-neutral-900">{user.department}</div>
                      <div className="text-[11px] text-neutral-500">{user.designation}</div>
                    </td>
                    <td className="p-2.5">
                      <select
                        value={user.role}
                        onChange={(e) => handleStatusChange(user.uid, user.status, e.target.value as UserRole)}
                        className="p-1 bg-white border border-neutral-300 rounded text-xs font-medium focus:border-red-600 focus:outline-hidden"
                      >
                        {ALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <StatusBadge status={user.status} size="sm" />
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(user.uid, 'ACTIVE')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Approve Staff Account"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(user.uid, 'REJECTED')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Reject Account"
                            >
                              <UserX className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {user.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(user.uid, 'SUSPENDED')}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            title="Suspend Staff Access"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}

                        {user.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleStatusChange(user.uid, 'ACTIVE')}
                            className="px-2 py-1 bg-neutral-900 hover:bg-black text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                          >
                            Reactivate
                          </button>
                        )}

                        {user.status === 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(user.uid, 'ACTIVE')}
                            className="px-2 py-1 bg-neutral-700 hover:bg-neutral-800 text-white rounded text-[11px] font-bold"
                          >
                            Reconsider
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

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
