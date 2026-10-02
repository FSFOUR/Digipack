import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { History, ShieldCheck, Search, Filter } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useErp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <History className="w-5 h-5 text-red-600" />
            System Audit Trail & Immutability Logs
          </h2>
          <p className="text-xs text-neutral-500">
            Cryptographic Action Ledger · Immutable Event Recording · User & Role Signatures
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search audit actions, user name, record ID, or change details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded focus:border-red-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User & Staff Role</th>
                <th className="p-3">Action Performed</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Record Identifier</th>
                <th className="p-3">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500 text-xs">
                    No audit records match the current filter. System operations will automatically stream here.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50 font-mono text-[11px]">
                    <td className="p-3 text-neutral-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 font-sans">
                      <span className="font-bold text-neutral-900 block">{log.userName}</span>
                      <span className="text-[10px] text-neutral-500">{log.userRole}</span>
                    </td>
                    <td className="p-3 font-bold text-neutral-900">
                      <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-neutral-700">{log.entityType}</td>
                    <td className="p-3 font-bold text-red-600">{log.recordId}</td>
                    <td className="p-3 font-sans text-neutral-700">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
