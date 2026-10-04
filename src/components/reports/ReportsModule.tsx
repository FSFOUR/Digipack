import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpDataContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  BarChart3,
  Download,
  Printer,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  Eye,
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { role } = useAuth();
  const isGuest = role === 'VIEW ONLY';
  const {
    quotations,
    salesOrders,
    boardStocks,
    jobCards,
    invoices,
    payments,
    finishedGoods,
    dispatches,
    customers,
    employees,
    machines,
  } = useErp();

  const [selectedReport, setSelectedReport] = useState<string>('BOARD_STOCK');
  const [searchTerm, setSearchTerm] = useState('');

  const reportCategories = [
    { id: 'BOARD_STOCK', name: 'Board Stock Inventory Report' },
    { id: 'QUOTATION', name: 'Quotations Prepared & Status Report' },
    { id: 'SALES_ORDER', name: 'Sales Order Fulfillment Report' },
    { id: 'JOB_CARD', name: 'Job Card Production Run Report' },
    { id: 'FINISHED_GOODS', name: 'Finished Goods Warehouse Report' },
    { id: 'DISPATCH', name: 'Dispatch & Delivery Report' },
    { id: 'RECEIVABLES', name: 'Outstanding Receivables Report' },
    { id: 'PAYMENT', name: 'Customer Payment Collection Report' },
    { id: 'EMPLOYEE', name: 'Staff Roster & Payroll Report' },
    { id: 'MACHINE', name: 'Machine Maintenance & Downtime Report' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (selectedReport === 'BOARD_STOCK') {
      headers = ['Board Size', 'Length', 'Width', 'GSM', 'Creasing', 'Available', 'Rate', 'Total Value', 'Location'];
      rows = boardStocks.map((s) => [s.boardSize, s.length, s.width, s.gsm, s.creasing, s.availableQty, s.rate, s.totalValue, s.location]);
    } else if (selectedReport === 'QUOTATION') {
      headers = ['Quotation No', 'Date', 'Customer', 'Subtotal', 'GST', 'Total Before Freight', 'Status'];
      rows = quotations.map((q) => [q.quotationNo, q.date, q.customerName, q.subtotal, q.gstAmount, q.totalBeforeFreight, q.status]);
    } else if (selectedReport === 'JOB_CARD') {
      headers = ['Job Card No', 'Date', 'Customer', 'Product', 'Required Qty', 'Produced Qty', 'Stage', 'Status'];
      rows = jobCards.map((j) => [j.jobCardNo, j.date, j.partyName, j.itemName, j.requiredQty, j.producedQty, j.currentStage, j.status]);
    } else {
      headers = ['Invoice No', 'Date', 'Customer', 'Total Amount', 'Paid Amount', 'Balance', 'Status'];
      rows = invoices.map((i) => [i.invoiceNumber, i.date, i.customerName, i.totalAmount, i.paidAmount, i.balanceAmount, i.paymentStatus]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DIGI_PACK_${selectedReport}_REPORT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" />
            Executive Reports & Analytics Center
          </h2>
          <p className="text-xs text-neutral-500">
            Export Excel / CSV · Print-Ready Ledger Schedules · Operational Audits
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isGuest && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Guest View-Only</span>
            </div>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Select Report Category */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
          Select Report Category (20+ Standard Manufacturing Schedules)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {reportCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedReport(cat.id)}
              className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all ${
                selectedReport === cat.id
                  ? 'bg-neutral-900 text-white border-black shadow-xs ring-1 ring-neutral-900'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
              }`}
            >
              <span className="block truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-neutral-900 text-white font-bold text-xs flex justify-between items-center">
          <span>Active Report: {reportCategories.find((c) => c.id === selectedReport)?.name}</span>
          <span className="text-[11px] text-neutral-400 font-normal">DIGI PACK Manufacturing ERP Data</span>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'BOARD_STOCK' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                  <th className="p-3">Board Size</th>
                  <th className="p-3">Dimensions (L × W)</th>
                  <th className="p-3">GSM & Creasing</th>
                  <th className="p-3 text-right">Available Qty</th>
                  <th className="p-3 text-right">Rate</th>
                  <th className="p-3 text-right">Total Value</th>
                  <th className="p-3">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {boardStocks.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-bold text-neutral-900">{s.boardSize}</td>
                    <td className="p-3 text-neutral-600">{s.length} × {s.width} cm</td>
                    <td className="p-3 text-neutral-600">{s.gsm} GSM · {s.creasing}</td>
                    <td className="p-3 text-right font-black tabular-nums">{s.availableQty}</td>
                    <td className="p-3 text-right tabular-nums">₹{s.rate.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold tabular-nums">₹{s.totalValue.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-semibold text-neutral-700">{s.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'QUOTATION' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                  <th className="p-3">Quotation No.</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer / Party Name</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">GST (5%)</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-bold text-red-600">{q.quotationNo}</td>
                    <td className="p-3 text-neutral-600">{q.date}</td>
                    <td className="p-3 font-bold text-neutral-900">{q.customerName}</td>
                    <td className="p-3 text-right tabular-nums">₹{q.subtotal.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right tabular-nums">₹{q.gstAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right font-black tabular-nums text-neutral-900">
                      ₹{q.totalBeforeFreight.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3"><StatusBadge status={q.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'JOB_CARD' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                  <th className="p-3">Job Card No.</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3 text-right">Required Qty</th>
                  <th className="p-3 text-right">Produced Qty</th>
                  <th className="p-3">Current Stage</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {jobCards.map((j) => (
                  <tr key={j.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-bold text-red-600">{j.jobCardNo}</td>
                    <td className="p-3 font-bold text-neutral-900">{j.partyName}</td>
                    <td className="p-3 text-neutral-800">{j.itemName}</td>
                    <td className="p-3 text-right font-black tabular-nums">{j.requiredQty}</td>
                    <td className="p-3 text-right font-bold text-emerald-700 tabular-nums">{j.producedQty}</td>
                    <td className="p-3 font-semibold text-neutral-700">{j.currentStage}</td>
                    <td className="p-3"><StatusBadge status={j.status} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'RECEIVABLES' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                  <th className="p-3">Invoice No.</th>
                  <th className="p-3">Customer / Party Name</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3 text-right">Total Amount</th>
                  <th className="p-3 text-right">Paid Amount</th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50">
                    <td className="p-3 font-bold text-neutral-900">{inv.invoiceNumber}</td>
                    <td className="p-3 font-bold text-neutral-900">{inv.customerName}</td>
                    <td className="p-3 font-semibold text-neutral-800">{inv.dueDate}</td>
                    <td className="p-3 text-right tabular-nums">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right tabular-nums text-emerald-700 font-bold">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right tabular-nums text-rose-600 font-black text-sm">
                      ₹{inv.balanceAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3"><StatusBadge status={inv.paymentStatus} size="sm" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
