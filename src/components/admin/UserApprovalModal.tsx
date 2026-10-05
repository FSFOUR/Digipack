import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import { X, ShieldCheck, UserX, UserCheck, AlertTriangle, Users } from 'lucide-react';

interface UserApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserApprovalModal: React.FC<UserApprovalModalProps> = ({ isOpen, onClose }) => {
  const { profile, allUsers, pendingUsers, updateUserStatus } = useAuth();

  if (!isOpen) return null;

  const handleStatusChange = async (
    targetUid: string,
    newStatus: UserProfile['status'],
    newRole?: UserRole
  ) => {
    try {
      await updateUserStatus(targetUid, newStatus, newRole);
    } catch (err) {
      console.error('Failed to change user status:', err);
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-neutral-300 overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-bold tracking-tight">Staff Account Management & Approval</h3>
              <p className="text-[11px] text-neutral-400">
                Authorized: {profile?.fullName} ({profile?.role}) · {pendingUsers.length} Pending Approval(s)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {allUsers.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              <Users className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
              No staff accounts registered yet.
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-x-auto custom-scrollbar-x">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
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
                  {allUsers.map((user) => (
                    <tr
                      key={user.uid}
                      className={user.status === 'PENDING' ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-neutral-50'}
                    >
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
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(user.uid, 'ACTIVE')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Approve and activate account"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(user.uid, 'REJECTED')}
                                className="px-2.5 py-1 bg-neutral-200 hover:bg-rose-100 text-neutral-700 hover:text-rose-700 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Reject registration"
                              >
                                <UserX className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          ) : user.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(user.uid, 'SUSPENDED')}
                              className="px-2 py-1 bg-neutral-100 hover:bg-amber-100 text-neutral-600 hover:text-amber-800 rounded font-medium text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Suspend staff account"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(user.uid, 'ACTIVE')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Reactivate staff account"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
