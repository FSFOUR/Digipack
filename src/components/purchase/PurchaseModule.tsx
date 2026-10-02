import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { PurchaseOrder, Supplier } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Truck,
  Plus,
  ArrowDownToLine,
  CheckCircle2,
  Building,
  Phone,
  Mail,
} from 'lucide-react';

export const PurchaseModule: React.FC = () => {
  const { purchaseOrders, suppliers, receivePurchaseOrder } = useErp();

  const [activeTab, setActiveTab] = useState<'POS' | 'SUPPLIERS'>('POS');
  const [receiveModalPo, setReceiveModalPo] = useState<PurchaseOrder | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  const handleReceiveGoods = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiveModalPo) return;
    try {
      await receivePurchaseOrder(receiveModalPo.id, invoiceNumber || 'INV-SUP-DIRECT');
      alert(`Goods received! ${receiveModalPo.quantity} sheets of ${receiveModalPo.boardSize} automatically credited to Board Stock inventory.`);
      setReceiveModalPo(null);
      setInvoiceNumber('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error receiving PO');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            Purchasing & Raw Material Procurement
          </h2>
          <p className="text-xs text-neutral-500">
            Purchase Orders · Mill Suppliers · Direct Automated Stock IN Integration upon Receipt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('POS')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'POS' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Purchase Orders ({purchaseOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('SUPPLIERS')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'SUPPLIERS' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Supplier Master ({suppliers.length})
            </button>
          </div>
        </div>
      </div>

      {/* POs List */}
      {activeTab === 'POS' && (
        <>
          {/* MOBILE VIEW: Cards without horizontal side scrolling */}
          <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
            {purchaseOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
                No purchase orders found.
              </div>
            ) : (
              purchaseOrders.map((po) => (
                <div
                  key={`mob-po-${po.id}`}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  {/* Header: PO Number, Date, Status */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <span className="font-black text-sm text-red-600 block">{po.poNumber}</span>
                      <span className="text-[10px] text-neutral-400 font-medium">{po.date} · Due: {po.expectedDelivery}</span>
                    </div>
                    <StatusBadge status={po.status} size="sm" />
                  </div>

                  {/* Supplier & Material */}
                  <div>
                    <div className="font-bold text-xs text-neutral-900">{po.supplierName}</div>
                    <div className="text-xs font-semibold text-neutral-800 mt-1">
                      {po.boardSize} ({po.gsm} GSM)
                    </div>
                    <div className="text-[11px] text-neutral-500">{po.material}</div>
                  </div>

                  {/* Quantities & Financials */}
                  <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Quantity</span>
                      <span className="font-black text-neutral-900 tabular-nums">{po.quantity.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Rate</span>
                      <span className="font-semibold text-neutral-700 tabular-nums">₹{po.rate.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Amount</span>
                      <span className="font-black text-neutral-900 tabular-nums">₹{po.amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        onClick={() => setReceiveModalPo(po)}
                        className="w-full sm:w-auto px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" /> Receive & Stock IN
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 py-1">
                        <CheckCircle2 className="w-4 h-4" /> Stock In Added
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
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Material & Board Size</th>
                    <th className="p-3 text-right">Qty (Sheets)</th>
                    <th className="p-3 text-right">Rate (₹)</th>
                    <th className="p-3 text-right">Amount (₹)</th>
                    <th className="p-3">Expected Delivery</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Goods Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-black text-sm text-red-600">{po.poNumber}</td>
                      <td className="p-3 font-medium text-neutral-600">{po.date}</td>
                      <td className="p-3 font-bold text-neutral-900">{po.supplierName}</td>
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{po.boardSize} ({po.gsm} GSM)</div>
                        <div className="text-[11px] text-neutral-500">{po.material}</div>
                      </td>
                      <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                        {po.quantity.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-700">
                        ₹{po.rate.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                        ₹{po.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-semibold text-neutral-800">{po.expectedDelivery}</td>
                      <td className="p-3">
                        <StatusBadge status={po.status} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        {po.status !== 'RECEIVED' ? (
                          <button
                            onClick={() => setReceiveModalPo(po)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs"
                            title="Receive Goods and Auto Stock IN"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" /> Receive & Stock IN
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stock In Added
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Supplier Master Tab */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {sup.supplierId}
                </span>
                <span className="text-xs text-neutral-500 font-semibold">{sup.paymentTerms}</span>
              </div>
              <h3 className="font-bold text-sm text-neutral-900 mb-1">{sup.name}</h3>
              <p className="text-xs text-neutral-600 mb-3">{sup.contactPerson} · {sup.phone}</p>
              <div className="text-[11px] text-neutral-500 space-y-1 border-t border-neutral-100 pt-2">
                <div>GSTIN: <strong>{sup.gstin}</strong></div>
                <div>Address: {sup.address}</div>
                <div>Supplies: <strong className="text-neutral-800">{sup.materialsSupplied.join(', ')}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receive Goods Modal */}
      {receiveModalPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
              Goods Receipt & Stock IN
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              PO Number: <strong>{receiveModalPo.poNumber}</strong> · {receiveModalPo.supplierName}
            </p>

            <form onSubmit={handleReceiveGoods} className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span>Material Size:</span>
                  <strong className="font-bold text-neutral-900">{receiveModalPo.boardSize} ({receiveModalPo.gsm} GSM)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Order Quantity:</span>
                  <strong className="font-bold text-emerald-700">{receiveModalPo.quantity} Sheets</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <strong className="font-bold text-neutral-900">₹{receiveModalPo.amount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Supplier Invoice No. / Delivery Challan *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EPM-INV-9921 / DC-441"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setReceiveModalPo(null)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold uppercase tracking-wider shadow-xs"
                >
                  Confirm & Credit Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
