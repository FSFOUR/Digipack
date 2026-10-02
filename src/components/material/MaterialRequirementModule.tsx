import React from 'react';
import { useErp } from '../../context/ErpDataContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Truck,
  Boxes,
  ArrowRight,
} from 'lucide-react';

interface MaterialRequirementModuleProps {
  onNavigateToPurchasing?: () => void;
}

export const MaterialRequirementModule: React.FC<MaterialRequirementModuleProps> = ({
  onNavigateToPurchasing,
}) => {
  const { materialRequirements, createPurchaseOrderForShortage } = useErp();

  const handleCreatePo = async (matId: string) => {
    try {
      const poId = await createPurchaseOrderForShortage(matId);
      alert('Purchase Order successfully generated for material shortage!');
      if (onNavigateToPurchasing) onNavigateToPurchasing();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating PO');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            Material Requirements Planning (BOM)
          </h2>
          <p className="text-xs text-neutral-500">
            Bill of Materials calculation · Automated Board, Ink, Glue, and Wire Shortage Detection
          </p>
        </div>
      </div>

      {/* Material Requirements Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                <th className="p-3">Sales Order</th>
                <th className="p-3">Customer / Party Name</th>
                <th className="p-3">Required Board Size</th>
                <th className="p-3 text-right">Required Sheets</th>
                <th className="p-3 text-right">Available in Stock</th>
                <th className="p-3 text-right">Shortage</th>
                <th className="p-3 text-right">Ink (kg)</th>
                <th className="p-3 text-right">Cold Glue (kg)</th>
                <th className="p-3 text-right">Stitching Wire (kg)</th>
                <th className="p-3">Material Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {materialRequirements.map((mat) => (
                <tr key={mat.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-3 font-black text-sm text-red-600">{mat.soNumber}</td>
                  <td className="p-3 font-bold text-neutral-900">{mat.customerName}</td>
                  <td className="p-3 font-bold text-neutral-900">
                    {mat.boardSize} ({mat.gsm} GSM)
                  </td>
                  <td className="p-3 text-right font-black tabular-nums text-neutral-900">
                    {mat.requiredSheets}
                  </td>
                  <td className="p-3 text-right font-bold tabular-nums text-neutral-700">
                    {mat.availableSheets}
                  </td>
                  <td className="p-3 text-right font-black tabular-nums text-rose-600 text-sm">
                    {mat.shortageSheets > 0 ? `${mat.shortageSheets} Short` : '0 (None)'}
                  </td>
                  <td className="p-3 text-right tabular-nums text-neutral-600">{mat.inkRequirementKg} kg</td>
                  <td className="p-3 text-right tabular-nums text-neutral-600">{mat.glueRequirementKg} kg</td>
                  <td className="p-3 text-right tabular-nums text-neutral-600">{mat.stitchingWireRequirementKg} kg</td>
                  <td className="p-3">
                    <StatusBadge status={mat.status} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    {mat.status === 'SHORTAGE' && !mat.purchaseOrderId ? (
                      <button
                        onClick={() => handleCreatePo(mat.id)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" /> Order Board (PO)
                      </button>
                    ) : mat.purchaseOrderId ? (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        PO Issued
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Ready for Floor
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
