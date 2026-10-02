import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { SalesOrder } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  ShoppingCart,
  Plus,
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface SalesOrderModuleProps {
  onNavigateToJobCards?: () => void;
}

export const SalesOrderModule: React.FC<SalesOrderModuleProps> = ({ onNavigateToJobCards }) => {
  const { salesOrders, createJobCardFromOrder, updateSalesOrderStatus } = useErp();
  const [selectedSo, setSelectedSo] = useState<SalesOrder | null>(null);

  const handleCreateJobCard = async (so: SalesOrder) => {
    try {
      await createJobCardFromOrder(so.id, 1);
      alert(`Job Card created for Sales Order ${so.soNumber}! Ready for production planning.`);
      if (onNavigateToJobCards) onNavigateToJobCards();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating Job Card');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-red-600" />
            Confirmed Sales Orders
          </h2>
          <p className="text-xs text-neutral-500">
            Converted from Customer Approved Quotations · Automatic Material Checking & 1-Click Job Card Generation
          </p>
        </div>
      </div>

      {/* Orders List */}
      {/* MOBILE VIEW: Cards without horizontal side scrolling */}
      <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
        {salesOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
            No sales orders found.
          </div>
        ) : (
          salesOrders.map((so) => (
            <div
              key={`mob-so-${so.id}`}
              className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
            >
              {/* Header: SO Number, Date, Status */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <div>
                  <span className="font-black text-sm text-red-600 block">{so.soNumber}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">{so.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={so.status} size="sm" />
                </div>
              </div>

              {/* Customer & PO Info */}
              <div>
                <div className="font-bold text-xs text-neutral-900">{so.customerName}</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  PO: <span className="font-semibold text-neutral-700">{so.customerPoNumber || 'N/A'}</span>
                  {so.quotationNo && ` · Qtn: ${so.quotationNo}`}
                </div>
              </div>

              {/* Details & Material status */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Total Amount</span>
                  <span className="font-black text-neutral-900 tabular-nums">
                    ₹{so.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Delivery Date</span>
                  <span className="font-semibold text-neutral-700">{so.deliveryDate}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-neutral-200/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-neutral-500">Material Status</span>
                  <StatusBadge status={so.materialStatus} size="sm" />
                </div>
              </div>

              {/* Action: Job Card Generation */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                {!so.jobCardCreated ? (
                  <button
                    onClick={() => handleCreateJobCard(so)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ClipboardList className="w-3.5 h-3.5" /> Generate Job Card
                  </button>
                ) : (
                  <span className="font-bold text-xs text-neutral-800 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-300">
                    Job Card: {so.jobCardNo}
                  </span>
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
                <th className="p-3">SO Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer / Party Name</th>
                <th className="p-3">Customer PO</th>
                <th className="p-3">Quotation No.</th>
                <th className="p-3">Delivery Date</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3">Material Status</th>
                <th className="p-3">Order Status</th>
                <th className="p-3 text-right">Job Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {salesOrders.map((so) => (
                <tr key={so.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-3 font-black text-sm text-red-600">{so.soNumber}</td>
                  <td className="p-3 font-medium text-neutral-600">{so.date}</td>
                  <td className="p-3 font-bold text-neutral-900">{so.customerName}</td>
                  <td className="p-3 font-semibold text-neutral-700">{so.customerPoNumber || '-'}</td>
                  <td className="p-3 font-semibold text-neutral-600">{so.quotationNo || '-'}</td>
                  <td className="p-3 font-bold text-neutral-900">{so.deliveryDate}</td>
                  <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                    ₹{so.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={so.materialStatus} size="sm" />
                  </td>
                  <td className="p-3">
                    <StatusBadge status={so.status} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    {!so.jobCardCreated ? (
                      <button
                        onClick={() => handleCreateJobCard(so)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Generate Job Card
                      </button>
                    ) : (
                      <span className="font-bold text-xs text-neutral-800 bg-neutral-100 px-2 py-1 rounded border border-neutral-300">
                        {so.jobCardNo}
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
