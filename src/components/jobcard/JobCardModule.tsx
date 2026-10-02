import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { JobCard } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import { JobCardPrintView } from './JobCardPrintView';
import {
  ClipboardList,
  Plus,
  Printer,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
} from 'lucide-react';

interface JobCardModuleProps {
  onNavigateToProduction?: () => void;
}

export const JobCardModule: React.FC<JobCardModuleProps> = ({ onNavigateToProduction }) => {
  const { jobCards, salesOrders, createManualJobCard, updateJobCard } = useErp();

  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'PRINT'>('LIST');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    partyName: 'LEEMMAK / JAMSHER BAI',
    itemName: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
    supplierName: 'Emami Paper Mills Ltd',
    spec: 'Duplex 300 GSM Golden Shade 5-Ply',
    boardSize: '69X115',
    ply: '5' as '3' | '5' | '7',
    print: 'YES' as 'YES' | 'NO',
    color: '2-Color Black & Red',
    stereo: 'DP-ST-LM104-01',
    outerDimension: { l: '69', w: '39', h: '17.5' },
    requiredQty: 200,
    creasedQty: 200,
    printedQty: 0,
    producedQty: 0,
    boardDamageQty: 0,
    productionDamageQty: 0,
    signOfManager: 'Shafi',
    signOfAccountant: 'Unni P.',
    note: 'Ensure Golden shade lamination is wrinkle-free. Double wire stitching required on joint flap.',
    status: 'READY' as const,
    currentStage: 'PRINTING' as const,
  });

  const handleCreateJobCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = await createManualJobCard(formData);
    const created = jobCards.find((j) => j.id === newId) || {
      id: newId,
      jobCardNo: `DP-JC-2026-${(jobCards.length + 1).toString().padStart(4, '0')}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };
    setSelectedJobCard(created);
    setViewMode('PRINT');
  };

  if (viewMode === 'PRINT' && selectedJobCard) {
    return (
      <JobCardPrintView
        jobCard={selectedJobCard}
        onBack={() => setViewMode('LIST')}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            Job Cards (Manufacturing Work Orders)
          </h2>
          <p className="text-xs text-neutral-500">
            DIGI PACK Paper Job Card Digital System · Auto Numbering DP-JC-2026-XXXX · Exact Print Parity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'LIST' ? (
            <button
              onClick={() => setViewMode('FORM')}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create New Job Card
            </button>
          ) : (
            <button
              onClick={() => setViewMode('LIST')}
              className="px-3 py-2 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Back to Job Cards
            </button>
          )}
        </div>
      </div>

      {/* Create Job Card Form */}
      {viewMode === 'FORM' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-6">
          <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              New Job Card Entry (Preserving Exact Document Fields)
            </h3>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
              Auto: DP-JC-2026-{(jobCards.length + 1).toString().padStart(4, '0')}
            </span>
          </div>

          <form onSubmit={handleCreateJobCard} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">DATE</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">DATE OF DELIVERY</label>
                <input
                  type="date"
                  required
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">PARTY NAME (Customer)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LEEMMAK / JAMSHER BAI"
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">ITEM NAME (Box Description)</label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">SUPPLIER NAME (Board Source)</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">SPEC (Specification)</label>
                <input
                  type="text"
                  value={formData.spec}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">BOARD SIZE</label>
                <input
                  type="text"
                  required
                  value={formData.boardSize}
                  onChange={(e) => setFormData({ ...formData, boardSize: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-xs focus:border-red-600 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">PLY (3 / 5 / 7)</label>
                <div className="flex items-center gap-4 mt-1.5">
                  {(['3', '5', '7'] as const).map((p) => (
                    <label key={p} className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="ply"
                        value={p}
                        checked={formData.ply === p}
                        onChange={() => setFormData({ ...formData, ply: p })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{p} PLY</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">PRINT (YES / NO)</label>
                <div className="flex items-center gap-4 mt-1.5">
                  {(['YES', 'NO'] as const).map((pr) => (
                    <label key={pr} className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="print"
                        value={pr}
                        checked={formData.print === pr}
                        onChange={() => setFormData({ ...formData, print: pr })}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{pr}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">COLOR</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">STEREO NO.</label>
                <input
                  type="text"
                  value={formData.stereo}
                  onChange={(e) => setFormData({ ...formData, stereo: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-neutral-700 mb-1">OUTER DIMENSION (L × W × H cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Length (L)"
                    value={formData.outerDimension.l}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outerDimension: { ...formData.outerDimension, l: e.target.value },
                      })
                    }
                    className="p-2 bg-neutral-50 border border-neutral-300 rounded text-center text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Width (W)"
                    value={formData.outerDimension.w}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outerDimension: { ...formData.outerDimension, w: e.target.value },
                      })
                    }
                    className="p-2 bg-neutral-50 border border-neutral-300 rounded text-center text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Height (H)"
                    value={formData.outerDimension.h}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outerDimension: { ...formData.outerDimension, h: e.target.value },
                      })
                    }
                    className="p-2 bg-neutral-50 border border-neutral-300 rounded text-center text-xs font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">REQUIRED QTY (NOS)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.requiredQty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requiredQty: parseInt(e.target.value) || 0,
                      creasedQty: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">CREASED QTY</label>
                <input
                  type="number"
                  value={formData.creasedQty}
                  onChange={(e) => setFormData({ ...formData, creasedQty: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">SIGN OF MANAGER</label>
                <input
                  type="text"
                  value={formData.signOfManager}
                  onChange={(e) => setFormData({ ...formData, signOfManager: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">SIGN OF ACCOUNTANT</label>
                <input
                  type="text"
                  value={formData.signOfAccountant}
                  onChange={(e) => setFormData({ ...formData, signOfAccountant: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">NOTE : (Production Instructions)</label>
              <textarea
                rows={2}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className="px-4 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Save & Open Printable Job Card
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Cards List */}
      {viewMode === 'LIST' && (
        <>
          {/* MOBILE VIEW: Cards without horizontal side scrolling */}
          <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
            {jobCards.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
                No job cards found.
              </div>
            ) : (
              jobCards.map((jc) => (
                <div
                  key={`mob-jc-${jc.id}`}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  {/* Header: Job Card No, Delivery Date, Stage */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <span className="font-black text-sm text-red-600 block">{jc.jobCardNo}</span>
                      <span className="text-[10px] text-neutral-400 font-medium">Due: {jc.deliveryDate}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-bold text-[11px] text-neutral-800">
                      {jc.currentStage}
                    </span>
                  </div>

                  {/* Party & Item details */}
                  <div>
                    <div className="font-bold text-xs text-neutral-900">{jc.partyName}</div>
                    <div className="text-[11px] text-neutral-600 font-medium mt-0.5">{jc.itemName}</div>
                  </div>

                  {/* Specs & Ply */}
                  <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-neutral-900">{jc.boardSize}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-200 text-neutral-800">
                        {jc.ply} PLY · {jc.print === 'YES' ? 'PRINT' : 'PLAIN'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500">{jc.spec}</div>
                  </div>

                  {/* Qty Progress Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-neutral-100/70 rounded-lg border border-neutral-200/60">
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Required Qty</span>
                      <span className="font-black text-sm text-neutral-900 tabular-nums">
                        {jc.requiredQty.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">Produced Qty</span>
                      <span className="font-black text-sm text-emerald-700 tabular-nums">
                        {jc.producedQty || 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setSelectedJobCard(jc);
                        setViewMode('PRINT');
                      }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      title="Print Job Card"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print A4
                    </button>

                    {onNavigateToProduction && (
                      <button
                        onClick={onNavigateToProduction}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        title="Floor Control"
                      >
                        Floor <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                    <th className="p-3">Job Card No.</th>
                    <th className="p-3">Delivery Date</th>
                    <th className="p-3">Party Name</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Board & Spec</th>
                    <th className="p-3 text-center">Ply / Print</th>
                    <th className="p-3 text-right">Required Qty</th>
                    <th className="p-3 text-right">Produced Qty</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {jobCards.map((jc) => (
                    <tr key={jc.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-black text-sm text-red-600">{jc.jobCardNo}</td>
                      <td className="p-3 font-medium text-neutral-600">{jc.deliveryDate}</td>
                      <td className="p-3 font-bold text-neutral-900">{jc.partyName}</td>
                      <td className="p-3 font-medium text-neutral-800 truncate max-w-xs">{jc.itemName}</td>
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{jc.boardSize}</div>
                        <div className="text-[11px] text-neutral-500">{jc.spec}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-neutral-700">
                        {jc.ply} PLY · {jc.print === 'YES' ? 'PRINT' : 'PLAIN'}
                      </td>
                      <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                        {jc.requiredQty.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-emerald-700 text-sm">
                        {jc.producedQty || 0}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-bold text-[11px] text-neutral-800">
                          {jc.currentStage}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedJobCard(jc);
                              setViewMode('PRINT');
                            }}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] flex items-center gap-1"
                            title="Print Job Card"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print A4
                          </button>

                          {onNavigateToProduction && (
                            <button
                              onClick={onNavigateToProduction}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] flex items-center gap-1"
                              title="Floor Control"
                            >
                              Floor <ChevronRight className="w-3 h-3" />
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
        </>
      )}
    </div>
  );
};
