import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  CreditCard,
  Plus,
  ArrowDownRight,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

export const PaymentModule: React.FC = () => {
  const { invoices, payments, customers, recordCustomerPayment } = useErp();
  const { profile } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.customerName || 'LEEMMAK / JAMSHER BAI',
    invoiceNumber: invoices[0]?.invoiceNumber || 'DP-INV-2026-0001',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'BANK_TRANSFER' as const,
    referenceNo: 'UTR-99882211',
    recordedBy: profile?.fullName || 'Unni P. (Accounts)',
    remarks: 'Payment via NEFT',
  });

  const selectedInv = invoices.find((i) => i.invoiceNumber === formData.invoiceNumber);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recordCustomerPayment(formData);
      setShowAddModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error in payment entry');
    }
  };

  const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const overdueInvoices = invoices.filter(
    (i) => i.balanceAmount > 0 && new Date(i.dueDate) < new Date()
  );
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            Customer Payments & Receivables Aging Ledger
          </h2>
          <p className="text-xs text-neutral-500">
            Payment Receipts · Overdue Aging · Customer Ledgers with Validation Safeguards
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Record Customer Payment
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Outstanding Receivables
          </span>
          <div className="text-2xl font-black text-neutral-900 tabular-nums">
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-neutral-500">Across {invoices.filter((i) => i.balanceAmount > 0).length} unpaid invoices</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Total Overdue Amount
          </span>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            ₹{totalOverdue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">{overdueInvoices.length} Invoices past due date</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Total Receipts Recorded
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            {payments.length} Payments
          </div>
          <span className="text-[11px] text-neutral-500">
            ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')} collected
          </span>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-neutral-900 text-white font-bold text-xs flex justify-between items-center">
          <span>Recorded Payment Transactions</span>
          <span className="text-[11px] text-neutral-400 font-normal">Auto Linked to Invoices & Ledgers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                <th className="p-3">Payment No.</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer / Party Name</th>
                <th className="p-3">Invoice Number</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Reference / UTR</th>
                <th className="p-3 text-right">Amount Received</th>
                <th className="p-3">Recorded By</th>
                <th className="p-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="p-3 font-bold text-neutral-900">{p.paymentNo}</td>
                  <td className="p-3 font-medium text-neutral-600">{p.date}</td>
                  <td className="p-3 font-bold text-neutral-900">{p.customerName}</td>
                  <td className="p-3 font-bold text-red-600">{p.invoiceNumber}</td>
                  <td className="p-3 font-semibold text-neutral-800">{p.paymentMode}</td>
                  <td className="p-3 text-[11px] font-mono text-neutral-600">{p.referenceNo}</td>
                  <td className="p-3 text-right font-black tabular-nums text-emerald-700 text-sm">
                    ₹{p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-neutral-600">{p.recordedBy}</td>
                  <td className="p-3 text-neutral-500 italic">{p.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Record Customer Payment Receipt
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter received funds against customer invoice. Balance updates automatically.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Invoice to Credit</label>
                <select
                  value={formData.invoiceNumber}
                  onChange={(e) => {
                    const inv = invoices.find((i) => i.invoiceNumber === e.target.value);
                    setFormData({
                      ...formData,
                      invoiceNumber: e.target.value,
                      customerId: inv?.customerId || formData.customerId,
                      customerName: inv?.customerName || formData.customerName,
                      amount: inv?.balanceAmount || 5000,
                    });
                  }}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} — {inv.customerName} (Bal: ₹{inv.balanceAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInv && (
                <div className="p-2.5 bg-neutral-100 rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Invoice Total:</span>
                    <strong className="tabular-nums">₹{selectedInv.totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Outstanding Balance:</span>
                    <strong className="tabular-nums font-bold">₹{selectedInv.balanceAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm text-emerald-700 focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Receipt Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Bank Reference / UTR / Cheque No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR / NEFT / IMPS Reference"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Part payment received via SBI Kakkanchery"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold uppercase tracking-wider"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
