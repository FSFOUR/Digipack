import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { useAuth } from '../../context/AuthContext';
import { JobCard, ProductionStageLog } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Cpu,
  CheckCircle2,
  Clock,
  Printer,
  FoldHorizontal,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';

export const ProductionModule: React.FC = () => {
  const { jobCards, productionLogs, updateProductionStage, submitQcInspection, machines } = useErp();
  const { profile, role } = useAuth();

  const [selectedJcNo, setSelectedJcNo] = useState<string>(jobCards[0]?.jobCardNo || '');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [qcModalOpen, setQcModalOpen] = useState(false);

  const [activeStage, setActiveStage] = useState<'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC'>('PRINTING');
  const [qtyCompleted, setQtyCompleted] = useState<number>(200);
  const [stageRemarks, setStageRemarks] = useState('');
  const [machineSelected, setMachineSelected] = useState('DP-MCH-01');

  // QC modal form
  const [qcData, setQcData] = useState({
    rejectedQty: 2,
    reworkQty: 1,
    plyVerified: true,
    printQualityOk: true,
    dimensionAccuracyOk: true,
    creaseFoldOk: true,
    gluingStitchingOk: true,
    status: 'ACCEPTED' as const,
    remarks: 'Approved for Finished Goods warehouse dispatch.',
  });

  const activeJobCard = jobCards.find((j) => j.jobCardNo === selectedJcNo) || jobCards[0];
  const jcLogs = productionLogs.filter((p) => p.jobCardNo === activeJobCard?.jobCardNo);

  const stages: { key: 'PRINTING' | 'FOLDING' | 'GLUING' | 'STITCHING' | 'FINISHING' | 'QC'; name: string; icon: any }[] = [
    { key: 'PRINTING', name: '1. PRINTING', icon: Printer },
    { key: 'FOLDING', name: '2. FOLDING', icon: FoldHorizontal },
    { key: 'GLUING', name: '3. GLUING', icon: Layers },
    { key: 'STITCHING', name: '4. STITCHING', icon: Sparkles },
    { key: 'FINISHING', name: '5. FINISHING', icon: Cpu },
    { key: 'QC', name: '6. QUALITY CHECK', icon: ShieldCheck },
  ];

  // Authorization check
  const canAuthorizeSection =
    role === 'OWNER / ADMIN' ||
    role === 'MANAGER' ||
    role === 'SUPERVISOR' ||
    role === 'PRODUCTION OPERATOR' ||
    role === 'QC';

  const handleStartStage = async (stageKey: any) => {
    if (!canAuthorizeSection) {
      alert('You are not authorized to start production stages. Requires Supervisor or Operator role.');
      return;
    }
    await updateProductionStage({
      jobCardNo: activeJobCard.jobCardNo,
      stage: stageKey,
      status: 'STARTED',
      qtyProcessed: activeJobCard.requiredQty,
      machineId: machineSelected,
      remarks: `Started ${stageKey} section by ${profile?.fullName}`,
    });
  };

  const handleOpenCompleteModal = (stageKey: any) => {
    if (!canAuthorizeSection) {
      alert('You are not authorized to mark section completed. Requires Supervisor or Lead Operator.');
      return;
    }
    setActiveStage(stageKey);
    setQtyCompleted(activeJobCard?.requiredQty || 100);
    setCompleteModalOpen(true);
  };

  const handleConfirmSectionCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStage === 'QC') {
      setCompleteModalOpen(false);
      setQcModalOpen(true);
      return;
    }

    await updateProductionStage({
      jobCardNo: activeJobCard.jobCardNo,
      stage: activeStage,
      status: 'COMPLETED',
      qtyProcessed: Number(qtyCompleted),
      machineId: machineSelected,
      remarks: stageRemarks || `Section ${activeStage} confirmed completed`,
    });

    setCompleteModalOpen(false);
    setStageRemarks('');
  };

  const handleConfirmQc = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitQcInspection({
      jobCardNo: activeJobCard.jobCardNo,
      customerName: activeJobCard.partyName,
      productName: activeJobCard.itemName,
      inspectionDate: new Date().toISOString().split('T')[0],
      inspectedBy: profile?.fullName || 'Haridas K. (QC)',
      plannedQty: activeJobCard.requiredQty,
      producedQty: activeJobCard.producedQty || activeJobCard.requiredQty,
      rejectedQty: Number(qcData.rejectedQty),
      reworkQty: Number(qcData.reworkQty),
      plyVerified: qcData.plyVerified,
      printQualityOk: qcData.printQualityOk,
      dimensionAccuracyOk: qcData.dimensionAccuracyOk,
      creaseFoldOk: qcData.creaseFoldOk,
      gluingStitchingOk: qcData.gluingStitchingOk,
      status: qcData.status,
      remarks: qcData.remarks,
    });
    setQcModalOpen(false);
    alert('QC Inspection finalized! Accepted quantity automatically transferred to FINISHED GOODS.');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-600" />
            Production Planning & Section Completion Control
          </h2>
          <p className="text-xs text-neutral-500">
            Supervisor Gate Controls · Timestamps & Operator Signatures · Real-Time Progress Tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-600 font-semibold">Active Job:</span>
          <select
            value={selectedJcNo}
            onChange={(e) => setSelectedJcNo(e.target.value)}
            className="p-1.5 bg-neutral-50 border border-neutral-300 rounded font-bold text-xs text-neutral-900 focus:border-red-600 focus:outline-hidden"
          >
            {jobCards.map((j) => (
              <option key={j.id} value={j.jobCardNo}>
                {j.jobCardNo} — {j.partyName.slice(0, 18)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Job Card Summary Header */}
      {activeJobCard && (
        <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-black text-red-500">{activeJobCard.jobCardNo}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded">
                  SO: {activeJobCard.soNumber || 'DIRECT'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  Current Stage: {activeJobCard.currentStage}
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{activeJobCard.partyName}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{activeJobCard.itemName}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Planned</span>
                <strong className="text-lg font-black text-white tabular-nums">{activeJobCard.requiredQty}</strong>
              </div>
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Bundled</span>
                <strong className="text-lg font-black text-emerald-400 tabular-nums">
                  {activeJobCard.producedQty || 0}
                </strong>
              </div>
              <div className="bg-neutral-800/80 p-2.5 rounded-lg border border-neutral-700">
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Damage</span>
                <strong className="text-lg font-black text-rose-400 tabular-nums">
                  {(activeJobCard.boardDamageQty || 0) + (activeJobCard.productionDamageQty || 0)}
                </strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs text-neutral-300">
            <div>Board Size: <strong className="text-white font-bold">{activeJobCard.boardSize}</strong></div>
            <div>Structure: <strong className="text-white font-bold">{activeJobCard.ply} PLY ({activeJobCard.spec})</strong></div>
            <div>Print Spec: <strong className="text-white font-bold">{activeJobCard.print} ({activeJobCard.color})</strong></div>
            <div>Delivery Target: <strong className="text-red-400 font-bold">{activeJobCard.deliveryDate}</strong></div>
          </div>
        </div>
      )}

      {/* 6 SECTION COMPLETION CONTROL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stg) => {
          const Icon = stg.icon;
          const stageLog = jcLogs.filter((l) => l.stage === stg.key);
          const latestLog = stageLog[stageLog.length - 1];
          const isCompleted = latestLog?.status === 'COMPLETED';
          const isStarted = latestLog?.status === 'STARTED';

          return (
            <div
              key={stg.key}
              className={`p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-50/40 border-emerald-300'
                  : isStarted
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-neutral-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isStarted
                          ? 'bg-amber-600 text-white'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-neutral-900">{stg.name}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isStarted
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {isCompleted ? 'COMPLETED' : isStarted ? 'IN PROGRESS' : 'WAITING'}
                  </span>
                </div>

                {/* Section details & audit trail info */}
                <div className="text-xs text-neutral-600 space-y-1 mb-4">
                  {latestLog ? (
                    <>
                      <div>
                        {isCompleted ? 'Completed By:' : 'Started By:'}{' '}
                        <strong className="text-neutral-900">
                          {isCompleted ? latestLog.completedBy : latestLog.startedBy}
                        </strong>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Timestamp: {isCompleted ? latestLog.completedAt?.slice(11, 16) : latestLog.startedAt?.slice(11, 16)} hrs
                      </div>
                      <div>
                        Quantity Handled: <strong className="text-neutral-900 font-bold">{latestLog.qtyProcessed} NOS</strong>
                      </div>
                      {latestLog.remarks && (
                        <div className="text-[11px] italic text-neutral-500 bg-white/80 p-1.5 rounded border border-neutral-200">
                          "{latestLog.remarks}"
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-neutral-400 italic py-2">
                      Stage pending start authorization by floor supervisor.
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-neutral-200 flex items-center gap-2">
                {!isStarted && !isCompleted && (
                  <button
                    onClick={() => handleStartStage(stg.key)}
                    className="flex-1 py-1.5 px-3 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" /> Start Section
                  </button>
                )}

                {isStarted && (
                  <button
                    onClick={() => handleOpenCompleteModal(stg.key)}
                    className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}

                {isCompleted && (
                  <div className="flex-1 text-center py-1 bg-emerald-100/60 rounded text-emerald-900 font-bold text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Section Verified
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Completion Modal */}
      {completeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              Confirm Section Completion — {activeStage}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Recording operator signature: <strong>{profile?.fullName}</strong> ({profile?.role})
            </p>

            <form onSubmit={handleConfirmSectionCompletion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Completed Quantity (NOS)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qtyCompleted}
                  onChange={(e) => setQtyCompleted(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-bold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Machine Line Used</label>
                <select
                  value={machineSelected}
                  onChange={(e) => setMachineSelected(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.machineId}>
                      {m.machineId} — {m.machineName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Supervisor Remarks / Batch Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dimensions checked, fold crispness verified"
                  value={stageRemarks}
                  onChange={(e) => setStageRemarks(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCompleteModalOpen(false)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider shadow-xs"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QC Final Inspection & Finished Goods Transfer Modal */}
      {qcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-300 p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Final Quality Control (QC) & Warehouse Transfer
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Accepted quantity will automatically transfer to <strong>FINISHED GOODS</strong>.
            </p>

            <form onSubmit={handleConfirmQc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Produced Quantity (NOS)</label>
                  <input
                    type="number"
                    disabled
                    value={activeJobCard.requiredQty}
                    className="w-full p-2 bg-neutral-100 border border-neutral-300 rounded font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rejected Quantity (NOS)</label>
                  <input
                    type="number"
                    min="0"
                    value={qcData.rejectedQty}
                    onChange={(e) => setQcData({ ...qcData, rejectedQty: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm text-rose-600"
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 space-y-2">
                <span className="font-bold text-[11px] uppercase tracking-wider text-neutral-700 block mb-1">
                  Physical Quality Checklist
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcData.plyVerified}
                    onChange={(e) => setQcData({ ...qcData, plyVerified: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Ply and GSM thickness verified according to spec sheet</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcData.printQualityOk}
                    onChange={(e) => setQcData({ ...qcData, printQualityOk: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Print sharpness, color match and shade alignment approved</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcData.dimensionAccuracyOk}
                    onChange={(e) => setQcData({ ...qcData, dimensionAccuracyOk: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Outer dimensions (L × W × H) match approved sample within tolerance</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcData.gluingStitchingOk}
                    onChange={(e) => setQcData({ ...qcData, gluingStitchingOk: e.target.checked })}
                    className="rounded text-red-600"
                  />
                  <span>Flap gluing and wire stitching pitch securely verified</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">QC Decision</label>
                <select
                  value={qcData.status}
                  onChange={(e) => setQcData({ ...qcData, status: e.target.value as any })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-xs"
                >
                  <option value="ACCEPTED">ACCEPTED — Transfer to Finished Goods</option>
                  <option value="REWORK_REQUIRED">REWORK REQUIRED — Return to Line</option>
                  <option value="REJECTED">REJECTED — Write Off</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setQcModalOpen(false)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold uppercase tracking-wider shadow-xs"
                >
                  Finalize QC & Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
