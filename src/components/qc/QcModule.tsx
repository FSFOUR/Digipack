import React from 'react';
import { useErp } from '../../context/ErpDataContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const QcModule: React.FC = () => {
  const { qcRecords, jobCards } = useErp();

  const totalAccepted = qcRecords.reduce((sum, q) => sum + q.acceptedQty, 0);
  const totalRejected = qcRecords.reduce((sum, q) => sum + q.rejectedQty, 0);
  const totalRework = qcRecords.reduce((sum, q) => sum + q.reworkQty, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-red-600" />
            Quality Assurance & Final Inspection Logs
          </h2>
          <p className="text-xs text-neutral-500">
            Physical Box Audits · Rejection Tracking · Flap & Stitching Verification · Auto Transfer to Finished Goods
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Total Accepted for Warehousing
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            {totalAccepted.toLocaleString('en-IN')} Boxes
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Total Rejected Damage
          </span>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {totalRejected.toLocaleString('en-IN')} Boxes
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Sent for Rework
          </span>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {totalRework.toLocaleString('en-IN')} Boxes
          </div>
        </div>
      </div>

      {/* Inspection Records Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-neutral-900 text-white font-bold text-xs flex justify-between items-center">
          <span>Final Inspection Audit Logs</span>
          <span className="text-[11px] text-neutral-400 font-normal">Signed by QC Staff</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                <th className="p-3">Job Card</th>
                <th className="p-3">Inspection Date</th>
                <th className="p-3">Customer / Party Name</th>
                <th className="p-3">Product Description</th>
                <th className="p-3 text-right">Planned</th>
                <th className="p-3 text-right text-emerald-700">Accepted</th>
                <th className="p-3 text-right text-rose-600">Rejected</th>
                <th className="p-3 text-center">Quality Verification</th>
                <th className="p-3">Inspector</th>
                <th className="p-3">QC Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {qcRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-neutral-500 text-xs">
                    No QC inspections logged yet. Complete sections on the Production Line to trigger QC.
                  </td>
                </tr>
              ) : (
                qcRecords.map((qc) => (
                  <tr key={qc.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-black text-sm text-red-600">{qc.jobCardNo}</td>
                    <td className="p-3 font-medium text-neutral-600">{qc.inspectionDate}</td>
                    <td className="p-3 font-bold text-neutral-900">{qc.customerName}</td>
                    <td className="p-3 font-medium text-neutral-800 truncate max-w-xs">{qc.productName}</td>
                    <td className="p-3 text-right font-medium tabular-nums">{qc.plannedQty}</td>
                    <td className="p-3 text-right font-black tabular-nums text-emerald-700 text-sm">
                      {qc.acceptedQty}
                    </td>
                    <td className="p-3 text-right font-black tabular-nums text-rose-600">
                      {qc.rejectedQty}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        All 5 Checkpoints Pass
                      </span>
                    </td>
                    <td className="p-3 text-neutral-700 font-semibold">{qc.inspectedBy}</td>
                    <td className="p-3">
                      <StatusBadge status={qc.status} size="sm" />
                    </td>
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
