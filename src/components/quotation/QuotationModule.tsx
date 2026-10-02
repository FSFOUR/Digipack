import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { Quotation, QuotationItem } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import { QuotationPrintView } from './QuotationPrintView';
import { SizeVisualizer2D } from '../stock/SizeVisualizer2D';
import {
  FileText,
  Plus,
  Printer,
  Sparkles,
  ArrowRight,
  Trash2,
  Copy,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface QuotationModuleProps {
  onNavigateToOrders?: () => void;
}

export const QuotationModule: React.FC<QuotationModuleProps> = ({ onNavigateToOrders }) => {
  const {
    quotations,
    customers,
    addQuotation,
    updateQuotation,
    convertQuotationToSalesOrder,
  } = useErp();

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'PRINT' | 'STOCK_CHECK'>('LIST');
  const [activeItemForStockCheck, setActiveItemForStockCheck] = useState<QuotationItem | null>(null);

  // Form State for Creating New Quotation
  const [formData, setFormData] = useState({
    quotationNo: `2109${(quotations.length + 1).toString().padStart(2, '0')}`,
    date: new Date().toISOString().split('T')[0],
    validity: '7 Days',
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.customerName || 'LEEMMAK / JAMSHER BAI',
    gstApplicableText: '5% Applicable',
    gstRate: 5,
    freight: 'Extra',
    preparedBy: 'Shafi',
  });

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: 'item-1',
      sl: 1,
      productDescription: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
      qty: 200,
      ratePerPc: 81.0,
      amount: 16200.0,
      length: 69,
      width: 39,
      height: 17.5,
      gsm: 300,
      ply: '5',
      shade: 'Golden Shade',
    },
  ]);

  // Indian currency numbering to words converter
  const numberToWordsIndian = (num: number): string => {
    const a = [
      '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
      'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
      'Seventeen ', 'Eighteen ', 'Nineteen ',
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      let str = '';
      if (n > 99) {
        str += a[Math.floor(n / 100)] + 'Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : ' ');
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const remainder = Math.floor(num);
    const paise = Math.round((num - remainder) * 100);

    let res = '';
    if (crore) res += inWords(crore) + 'Crore ';
    if (lakh) res += inWords(lakh) + 'Lakh ';
    if (thousand) res += inWords(thousand) + 'Thousand ';
    if (remainder) res += inWords(remainder);
    if (!res) res = 'Zero ';

    let finalStr = `Rupees ${res.trim()}`;
    if (paise > 0) {
      finalStr += ` and ${inWords(paise).trim()} Paise`;
    }
    return `${finalStr} Only, excluding freight.`;
  };

  // Re-calculate row amounts and subtotal
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gstAmount = Math.round((subtotal * 0.05) * 100) / 100;
  const totalBeforeFreight = subtotal + gstAmount;
  const amountInWords = numberToWordsIndian(totalBeforeFreight);

  const handleItemChange = (index: number, field: keyof QuotationItem, val: any) => {
    const updated = [...items];
    const item = { ...updated[index], [field]: val };
    if (field === 'qty' || field === 'ratePerPc') {
      item.amount = (Number(item.qty) || 0) * (Number(item.ratePerPc) || 0);
    }
    updated[index] = item;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        id: 'item-' + (items.length + 1),
        sl: items.length + 1,
        productDescription: 'Duplex Master Box 5PLY',
        qty: 100,
        ratePerPc: 90.0,
        amount: 9000.0,
        length: 70,
        width: 40,
        height: 20,
        gsm: 300,
        ply: '5',
      },
    ]);
  };

  const deleteItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sl: i + 1 })));
  };

  const duplicateItemRow = (idx: number) => {
    const it = items[idx];
    setItems([
      ...items,
      {
        ...it,
        id: 'item-' + Date.now(),
        sl: items.length + 1,
      },
    ]);
  };

  const handleSaveQuotation = async () => {
    const terms = [
      'Prices are quoted in Indian Rupees and are based on the specifications stated above.',
      'GST will be charged at 5% as applicable.',
      'Freight / transportation charges are extra and will be charged separately based on the delivery location and actual transportation cost.',
      'Production will be carried out according to the dimensions, material specification and shade confirmed by the customer.',
      'Delivery will be scheduled after order confirmation and receipt of the agreed payment/advance, subject to production and material availability.',
      'Payment terms shall be as mutually agreed and confirmed at the time of order.',
      'Any change in quantity or specification may result in a revision of the quoted price.',
      'This quotation is valid for 7 days from the date of issue unless otherwise confirmed in writing.',
      'Any applicable statutory taxes or charges not specifically included above will be charged as applicable.',
    ];

    const newId = await addQuotation({
      date: formData.date,
      validity: formData.validity,
      customerId: formData.customerId,
      customerName: formData.customerName,
      gstApplicableText: formData.gstApplicableText,
      items,
      subtotal,
      gstRate: formData.gstRate,
      gstAmount,
      totalBeforeFreight,
      freight: formData.freight,
      amountInWords,
      terms,
      status: 'SENT',
      preparedBy: formData.preparedBy,
    });

    const created = quotations.find((q) => q.id === newId) || {
      id: newId,
      quotationNo: formData.quotationNo,
      date: formData.date,
      validity: formData.validity,
      customerId: formData.customerId,
      customerName: formData.customerName,
      gstApplicableText: formData.gstApplicableText,
      items,
      subtotal,
      gstRate: formData.gstRate,
      gstAmount,
      totalBeforeFreight,
      freight: formData.freight,
      amountInWords,
      terms,
      status: 'SENT' as const,
      preparedBy: formData.preparedBy,
      createdAt: new Date().toISOString(),
    };

    setSelectedQuotation(created);
    setViewMode('PRINT');
  };

  const handleConvertToOrder = async (quote: Quotation) => {
    const soId = await convertQuotationToSalesOrder(quote.id);
    alert(`Quotation ${quote.quotationNo} successfully converted to Sales Order! Material requirements generated.`);
    if (onNavigateToOrders) onNavigateToOrders();
  };

  // Render Print View if requested
  if (viewMode === 'PRINT' && selectedQuotation) {
    return (
      <QuotationPrintView
        quotation={selectedQuotation}
        onBack={() => setViewMode('LIST')}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Quotations & Price Estimation
          </h2>
          <p className="text-xs text-neutral-500">
            Official DIGI PACK Quotation Format · Integrated 2D Cutting Stock Check · 1-Click SO Conversion
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'LIST' ? (
            <button
              onClick={() => setViewMode('FORM')}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create New Quotation
            </button>
          ) : (
            <button
              onClick={() => setViewMode('LIST')}
              className="px-3 py-2 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Back to Quotation List
            </button>
          )}
        </div>
      </div>

      {/* Stock Check Modal (2D Visualizer Embedded inside quotation preparation) */}
      {viewMode === 'STOCK_CHECK' && activeItemForStockCheck && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-neutral-900 text-white p-3 rounded-lg">
            <span className="text-xs font-bold">
              Checking Stock for: {activeItemForStockCheck.productDescription}
            </span>
            <button
              onClick={() => setViewMode('FORM')}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded"
            >
              Back to Quotation Form
            </button>
          </div>
          <SizeVisualizer2D
            initialLength={activeItemForStockCheck.length || 69}
            initialWidth={activeItemForStockCheck.width || 39}
            initialQty={activeItemForStockCheck.qty || 200}
            initialGsm={activeItemForStockCheck.gsm || 300}
            referenceDocNo={`QTN-${formData.quotationNo}`}
            onSelectOption={(opt) => {
              alert(`Selected stock size ${opt.boardSize} with ${opt.wastagePercent}% wastage. Sheet rate ₹${opt.ratePerSheet}.`);
              setViewMode('FORM');
            }}
          />
        </div>
      )}

      {/* Create / Edit Form */}
      {viewMode === 'FORM' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs p-5 space-y-6">
          <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              Quotation Preparation (DIGI PACK Standard Letterhead)
            </h3>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-200">
              No: {formData.quotationNo}
            </span>
          </div>

          {/* Quotation Header Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Customer / Party Name *</label>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  const cust = customers.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    customerId: e.target.value,
                    customerName: cust?.customerName || '',
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
              <label className="block font-bold text-neutral-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Validity (Default 7 Days)</label>
              <input
                type="text"
                value={formData.validity}
                onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">GST Applicable Text</label>
              <input
                type="text"
                value={formData.gstApplicableText}
                onChange={(e) => setFormData({ ...formData, gstApplicableText: e.target.value })}
                className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Quotation Product Items Rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Quotation Details Items ({items.length} Products)
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Row
              </button>
            </div>

            <div className="border border-neutral-300 rounded-lg overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-300 font-bold text-neutral-700 text-[11px] uppercase">
                    <th className="p-2 w-10 text-center">Sl.</th>
                    <th className="p-2">Product Description & Specs</th>
                    <th className="p-2 w-28 text-center">Cut Size (L × W cm)</th>
                    <th className="p-2 w-24 text-center">Qty (NOS)</th>
                    <th className="p-2 w-28 text-right">Rate / Pc (₹)</th>
                    <th className="p-2 w-28 text-right">Amount (₹)</th>
                    <th className="p-2 w-28 text-center">Stock Check</th>
                    <th className="p-2 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-2 text-center font-bold">{idx + 1}</td>
                      <td className="p-2">
                        <textarea
                          rows={2}
                          value={item.productDescription}
                          onChange={(e) => handleItemChange(idx, 'productDescription', e.target.value)}
                          className="w-full p-1.5 border border-neutral-300 rounded text-xs font-medium focus:border-red-600 focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            placeholder="L"
                            value={item.length || ''}
                            onChange={(e) => handleItemChange(idx, 'length', parseFloat(e.target.value) || 0)}
                            className="w-12 p-1 border border-neutral-300 rounded text-center text-xs font-semibold"
                          />
                          <span>×</span>
                          <input
                            type="number"
                            step="0.5"
                            placeholder="W"
                            value={item.width || ''}
                            onChange={(e) => handleItemChange(idx, 'width', parseFloat(e.target.value) || 0)}
                            className="w-12 p-1 border border-neutral-300 rounded text-center text-xs font-semibold"
                          />
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 0)}
                          className="w-20 p-1 border border-neutral-300 rounded text-center text-xs font-bold"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.5"
                          value={item.ratePerPc}
                          onChange={(e) => handleItemChange(idx, 'ratePerPc', parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 border border-neutral-300 rounded text-right text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 text-right font-black tabular-nums">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemForStockCheck(item);
                            setViewMode('STOCK_CHECK');
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-bold flex items-center gap-1 mx-auto"
                        >
                          <Sparkles className="w-3 h-3" /> Check 2D
                        </button>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => duplicateItemRow(idx)}
                            className="p-1 text-neutral-500 hover:text-black"
                            title="Duplicate Row"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteItemRow(idx)}
                            className="p-1 text-neutral-400 hover:text-red-600"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Summary Box */}
            <div className="flex flex-col sm:flex-row justify-end items-end pt-3">
              <div className="w-full sm:w-80 bg-neutral-50 border border-neutral-300 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <strong className="text-neutral-900 font-bold tabular-nums">₹{subtotal.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>GST @ 5%:</span>
                  <strong className="text-neutral-900 font-bold tabular-nums">₹{gstAmount.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 border-t border-neutral-300 pt-2">
                  <span>TOTAL BEFORE FREIGHT:</span>
                  <span className="text-red-600 tabular-nums">₹{totalBeforeFreight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Freight:</span>
                  <strong className="text-neutral-900 font-bold">Extra</strong>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-neutral-100 rounded text-xs italic text-neutral-700">
              <strong>Amount in Words: </strong> {amountInWords}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => setViewMode('LIST')}
              className="px-4 py-2 border border-neutral-300 rounded text-xs font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveQuotation}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs"
            >
              Generate Quotation & Preview A4
            </button>
          </div>
        </div>
      )}

      {/* Quotations List */}
      {viewMode === 'LIST' && (
        <>
          {/* MOBILE VIEW: Cards without horizontal side scrolling */}
          <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
            {quotations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
                No quotations found.
              </div>
            ) : (
              quotations.map((q) => (
                <div
                  key={`mob-q-${q.id}`}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  {/* Header: Quotation No, Date, Status */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <span className="font-black text-sm text-red-600 block">{q.quotationNo}</span>
                      <span className="text-[10px] text-neutral-400 font-medium">{q.date}</span>
                    </div>
                    <StatusBadge status={q.status} size="sm" />
                  </div>

                  {/* Customer and Products Details */}
                  <div>
                    <div className="font-bold text-xs text-neutral-900">{q.customerName}</div>
                    <div className="text-[11px] text-neutral-600 font-medium mt-0.5">
                      {q.items.length} Line Items · <span className="text-neutral-500">{q.items[0]?.productDescription}</span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Subtotal</span>
                      <span className="font-semibold text-neutral-700 tabular-nums">
                        ₹{q.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Before Freight</span>
                      <span className="font-black text-neutral-900 tabular-nums">
                        ₹{q.totalBeforeFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setSelectedQuotation(q);
                        setViewMode('PRINT');
                      }}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      title="Print / View PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print A4
                    </button>

                    {q.status !== 'CONVERTED' && (
                      <button
                        onClick={() => handleConvertToOrder(q)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                        title="Convert to Sales Order"
                      >
                        Convert SO <ArrowRight className="w-3.5 h-3.5" />
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
                    <th className="p-3">Quotation No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer / Party Name</th>
                    <th className="p-3">Products</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">Before Freight</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-black text-sm text-red-600">{q.quotationNo}</td>
                      <td className="p-3 font-medium text-neutral-600">{q.date}</td>
                      <td className="p-3 font-bold text-neutral-900">{q.customerName}</td>
                      <td className="p-3">
                        <span className="font-semibold text-neutral-800">{q.items.length} Line Items</span>
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs">
                          {q.items[0]?.productDescription}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-600">
                        ₹{q.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold tabular-nums text-neutral-900 text-sm">
                        ₹{q.totalBeforeFreight.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={q.status} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedQuotation(q);
                              setViewMode('PRINT');
                            }}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] flex items-center gap-1"
                            title="Print / View PDF"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print A4
                          </button>

                          {q.status !== 'CONVERTED' && (
                            <button
                              onClick={() => handleConvertToOrder(q)}
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] flex items-center gap-1"
                              title="Convert to Sales Order"
                            >
                              Convert SO <ArrowRight className="w-3 h-3" />
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
