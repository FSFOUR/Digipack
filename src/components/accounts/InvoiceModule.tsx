import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { Invoice } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Receipt,
  Plus,
  Printer,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface InvoiceModuleProps {
  onOpenPaymentModal?: (inv: Invoice) => void;
}

export const InvoiceModule: React.FC<InvoiceModuleProps> = ({ onOpenPaymentModal }) => {
  const { invoices, customers, salesOrders, jobCards, createInvoice } = useErp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.customerName || 'LEEMMAK / JAMSHER BAI',
    gstin: customers[0]?.gstin || '32AAACL1234F1Z8',
    billingAddress: customers[0]?.billingAddress || 'Industrial Zone, Kakkanchery, Malappuram',
    salesOrderId: salesOrders[0]?.id || '',
    jobCardNo: jobCards[0]?.jobCardNo || 'DP-JC-2026-0001',
    description: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
    qty: 200,
    rate: 81.0,
    freight: 450.0,
    paymentTerms: '15 Days Credit',
  });

  const subtotal = formData.qty * formData.rate;
  const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = subtotal + taxAmount + Number(formData.freight);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await createInvoice({
      date: formData.date,
      dueDate: formData.dueDate,
      customerId: formData.customerId,
      customerName: formData.customerName,
      gstin: formData.gstin,
      billingAddress: formData.billingAddress,
      salesOrderId: formData.salesOrderId,
      jobCardNo: formData.jobCardNo,
      items: [
        {
          description: formData.description,
          qty: Number(formData.qty),
          rate: Number(formData.rate),
          amount: subtotal,
        },
      ],
      subtotal,
      taxRate: 5,
      taxAmount,
      freight: Number(formData.freight),
      totalAmount,
      paidAmount: 0,
      balanceAmount: totalAmount,
      paymentStatus: 'UNPAID',
      paymentTerms: formData.paymentTerms,
    });
    setShowAddModal(false);
  };

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalReceived = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            Tax Invoices & Billing
          </h2>
          <p className="text-xs text-neutral-500">
            GST Invoicing · Automated Customer Ledger Updates · Payment Status Tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> Generate New Invoice
        </button>
      </div>

      {/* Financial Snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Invoiced (Billed)
          </span>
          <div className="text-2xl font-black text-neutral-900 tabular-nums">
            ₹{totalInvoiced.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Total Payments Collected
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
            Total Pending Receivables
          </span>
          <div className="text-2xl font-black text-rose-600 tabular-nums">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {/* MOBILE VIEW: Cards without horizontal side scrolling */}
      <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
            No invoices found.
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={`mob-inv-${inv.id}`}
              className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
            >
              {/* Header: Invoice No, Date, Status */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <div>
                  <span className="font-black text-sm text-red-600 block">{inv.invoiceNumber}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">Date: {inv.date} · Due: {inv.dueDate}</span>
                </div>
                <StatusBadge status={inv.paymentStatus} size="sm" />
              </div>

              {/* Customer & Description */}
              <div>
                <div className="font-bold text-xs text-neutral-900">{inv.customerName}</div>
                <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
                  {inv.items[0]?.description} {inv.jobCardNo && `(${inv.jobCardNo})`}
                </div>
              </div>

              {/* Financial Breakdown Grid */}
              <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-center text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Total</span>
                  <span className="font-black text-neutral-900 tabular-nums">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">Paid</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-600 block">Balance</span>
                  <span className="font-black text-rose-600 tabular-nums">
                    ₹{inv.balanceAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                <button
                  onClick={() => alert(`Printing Tax Invoice ${inv.invoiceNumber} with GSTIN ${inv.gstin}...`)}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Invoice
                </button>
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
                <th className="p-3">Invoice No.</th>
                <th className="p-3">Invoice Date</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Customer / Party Name</th>
                <th className="p-3">Description & Job</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3 text-right">GST (5%)</th>
                <th className="p-3 text-right">Total Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-3 font-black text-sm text-red-600">{inv.invoiceNumber}</td>
                  <td className="p-3 font-medium text-neutral-600">{inv.date}</td>
                  <td className="p-3 font-semibold text-neutral-800">{inv.dueDate}</td>
                  <td className="p-3 font-bold text-neutral-900">{inv.customerName}</td>
                  <td className="p-3 text-[11px] text-neutral-600 truncate max-w-xs">
                    {inv.items[0]?.description} ({inv.jobCardNo})
                  </td>
                  <td className="p-3 text-right font-medium tabular-nums text-neutral-600">
                    ₹{inv.subtotal.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-medium tabular-nums text-neutral-600">
                    ₹{inv.taxAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-bold tabular-nums text-emerald-700">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right font-black tabular-nums text-rose-600 text-sm">
                    ₹{inv.balanceAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={inv.paymentStatus} size="sm" />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => alert(`Printing Tax Invoice ${inv.invoiceNumber} with GSTIN ${inv.gstin}...`)}
                      className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-300 p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Create Tax Invoice</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter billing details, customer link, quantities, and GST rate.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Customer / Party Name</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        customerId: e.target.value,
                        customerName: cust?.customerName || '',
                        gstin: cust?.gstin || formData.gstin,
                        billingAddress: cust?.billingAddress || formData.billingAddress,
                      });
                    }}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Job Card Reference</label>
                  <select
                    value={formData.jobCardNo}
                    onChange={(e) => {
                      const jc = jobCards.find((j) => j.jobCardNo === e.target.value);
                      setFormData({
                        ...formData,
                        jobCardNo: e.target.value,
                        description: jc?.itemName || formData.description,
                        qty: jc?.producedQty || jc?.requiredQty || 200,
                      });
                    }}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                  >
                    {jobCards.map((j) => (
                      <option key={j.id} value={j.jobCardNo}>
                        {j.jobCardNo} — {j.partyName.slice(0, 16)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Quantity (NOS)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.qty}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rate / Pc (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Freight (₹)</label>
                  <input
                    type="number"
                    value={formData.freight}
                    onChange={(e) => setFormData({ ...formData, freight: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Invoice Calculations Summary */}
              <div className="p-3 bg-neutral-100 rounded-lg space-y-1 text-xs font-medium">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <strong className="tabular-nums">₹{subtotal.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>GST @ 5%:</span>
                  <strong className="tabular-nums">₹{taxAmount.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Freight:</span>
                  <strong className="tabular-nums">₹{formData.freight}</strong>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 border-t border-neutral-300 pt-1">
                  <span>Grand Total:</span>
                  <span className="text-red-600 tabular-nums">₹{totalAmount.toFixed(2)}</span>
                </div>
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider shadow-xs"
                >
                  Confirm Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
