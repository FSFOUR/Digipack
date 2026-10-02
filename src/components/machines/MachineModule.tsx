import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { Machine } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Wrench,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const MachineModule: React.FC = () => {
  const { machines, updateMachineStatus } = useErp();

  const handleStatusChange = async (mchId: string, status: Machine['status']) => {
    await updateMachineStatus(mchId, status, status === 'BREAKDOWN' ? 2 : 0);
  };

  const totalCapacity = machines.reduce((sum, m) => sum + m.capacityPerHour, 0);
  const activeCount = machines.filter((m) => m.status === 'RUNNING').length;
  const breakdownCount = machines.filter((m) => m.status === 'BREAKDOWN' || m.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-600" />
            Machine Asset Management & Downtime Tracker
          </h2>
          <p className="text-xs text-neutral-500">
            Flexo Printers · Automatic Folder Gluers · Wire Stitchers · Creasing & Rotary Cutters
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Active Running Machinery
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            {activeCount} / {machines.length} Operational
          </div>
          <span className="text-[11px] text-neutral-500">Total plant capacity: {totalCapacity.toLocaleString()} boxes/hr</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Maintenance / Breakdown
          </span>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            {breakdownCount} Units Affected
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Immediate technician attention</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Downtime This Month
          </span>
          <div className="text-2xl font-black text-neutral-900 tabular-nums">
            {machines.reduce((sum, m) => sum + m.downtimeHoursThisMonth, 0)} Hours
          </div>
          <span className="text-[11px] text-neutral-500">Plant efficiency: 98.2%</span>
        </div>
      </div>

      {/* Machine Master Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((m) => (
          <div
            key={m.id}
            className={`p-4 bg-white rounded-xl border transition-all duration-150 shadow-xs flex flex-col justify-between ${
              m.status === 'BREAKDOWN'
                ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                : m.status === 'RUNNING'
                ? 'border-neutral-200'
                : 'border-amber-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {m.machineId}
                </span>
                <StatusBadge status={m.status} size="sm" />
              </div>

              <h3 className="font-bold text-sm text-neutral-900 mb-1 leading-snug">{m.machineName}</h3>
              <p className="text-xs text-neutral-600 mb-3">Operator: <strong>{m.assignedOperator}</strong></p>

              <div className="space-y-1 text-xs text-neutral-600 border-t border-neutral-100 pt-2 mb-3">
                <div className="flex justify-between">
                  <span>Rated Capacity:</span>
                  <strong className="font-bold text-neutral-900 tabular-nums">{m.capacityPerHour.toLocaleString()} pcs/hr</strong>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="font-semibold text-neutral-800">{m.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Scheduled Service:</span>
                  <span className="text-neutral-700 font-medium">{m.nextScheduledMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Month Downtime:</span>
                  <span className="font-bold text-rose-600 tabular-nums">{m.downtimeHoursThisMonth} hrs</span>
                </div>
              </div>
            </div>

            {/* Quick State Toggle for Supervisor */}
            <div className="pt-3 border-t border-neutral-200 flex items-center gap-1.5">
              <button
                onClick={() => handleStatusChange(m.machineId, 'RUNNING')}
                className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-colors ${
                  m.status === 'RUNNING'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                Running
              </button>
              <button
                onClick={() => handleStatusChange(m.machineId, 'IDLE')}
                className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-colors ${
                  m.status === 'IDLE'
                    ? 'bg-amber-600 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                Idle
              </button>
              <button
                onClick={() => handleStatusChange(m.machineId, 'BREAKDOWN')}
                className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase transition-colors ${
                  m.status === 'BREAKDOWN'
                    ? 'bg-rose-600 text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                Breakdown
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
