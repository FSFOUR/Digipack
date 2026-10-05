import React, { useState } from 'react';
import { Quotation } from '../../types/erp';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { exportElementToPdf } from '../../utils/printAndPdfHelper';

interface QuotationPrintViewProps {
  quotation: Quotation;
  onBack: () => void;
}

export const QuotationPrintView: React.FC<QuotationPrintViewProps> = ({ quotation, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportElementToPdf(
        'quotation-print-sheet',
        `Quotation_${quotation.quotationNo}_${quotation.customerName.replace(/[^a-zA-Z0-9]/g, '_')}`
      );
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-2 sm:p-6 flex flex-col items-center">
      {/* Top Action Bar - Hidden when printing */}
      <div className="w-full max-w-4xl mb-4 flex items-center justify-between no-print bg-white p-3 rounded-lg border border-neutral-300 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save as PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Printable Document Container matching the exact PDF format */}
      <div
        id="quotation-print-sheet"
        className="w-full max-w-4xl bg-white p-5 sm:p-6 border border-neutral-300 shadow-md text-black font-sans print:p-0 print:border-none print:shadow-none"
        style={{ maxWidth: '210mm', width: '100%', boxSizing: 'border-box' }}
      >
        {/* Header: Logo on left, Company address on right */}
        <div className="flex justify-between items-start pb-6 border-b border-neutral-800">
          <div className="w-64">
            <DigiPackLogo size="lg" />
          </div>

          <div className="text-right text-[11px] leading-tight text-neutral-800">
            <p className="font-semibold text-neutral-900">
              1/426 G, KAKKANCHERY - AIKKARAPPADI ROAD,
            </p>
            <p className="font-semibold text-neutral-900">
              MALAPPURAM, KERALA - 673637
            </p>
            <p className="mt-2 text-neutral-700">
              OFFICE: <strong className="text-black">+91 8590 046 637, +91 7907 037 469</strong>
            </p>
            <p className="text-neutral-700">
              EMAIL: <strong className="text-black">info2digipack@gmail.com</strong>
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-xl font-black uppercase tracking-widest text-neutral-900 underline underline-offset-4">
            QUOTATION
          </h1>
        </div>

        {/* Metadata Boxes */}
        <div className="border border-black text-xs mb-6">
          {/* Row 1: Quotation No, Date, Validity */}
          <div className="grid grid-cols-12 border-b border-black">
            <div className="col-span-4 p-2 border-r border-black font-bold uppercase bg-neutral-50">
              QUOTATION NO.
            </div>
            <div className="col-span-2 p-2 border-r border-black font-medium">
              {quotation.quotationNo}
            </div>
            <div className="col-span-2 p-2 border-r border-black font-bold uppercase bg-neutral-50">
              DATE
            </div>
            <div className="col-span-2 p-2 border-r border-black font-medium">
              {quotation.date}
            </div>
            <div className="col-span-1 p-2 border-r border-black font-bold uppercase bg-neutral-50">
              VALIDITY
            </div>
            <div className="col-span-1 p-2 font-medium">
              {quotation.validity}
            </div>
          </div>

          {/* Row 2: TO and GST */}
          <div className="grid grid-cols-12">
            <div className="col-span-2 p-2 border-r border-black font-bold uppercase bg-neutral-50">
              TO
            </div>
            <div className="col-span-6 p-2 border-r border-black font-bold text-neutral-900">
              {quotation.customerName}
            </div>
            <div className="col-span-2 p-2 border-r border-black font-bold uppercase bg-neutral-50">
              GST
            </div>
            <div className="col-span-2 p-2 font-medium">
              {quotation.gstApplicableText || '5% Applicable'}
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="text-center font-bold text-xs uppercase tracking-wider mb-2">
          QUOTATION DETAILS
        </div>

        {/* Quotation Details Table */}
        <table className="w-full border-collapse border border-black text-xs mb-4">
          <thead>
            <tr className="bg-neutral-100 font-bold border-b border-black">
              <th className="border-r border-black p-2 w-12 text-center">Sl.</th>
              <th className="border-r border-black p-2 text-left">Product Description</th>
              <th className="border-r border-black p-2 w-20 text-center">Qty</th>
              <th className="border-r border-black p-2 w-24 text-right">Rate / Pc</th>
              <th className="p-2 w-28 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-black">
                <td className="border-r border-black p-2 text-center font-medium">
                  {item.sl || idx + 1}
                </td>
                <td className="border-r border-black p-2 font-medium leading-relaxed">
                  {item.productDescription}
                </td>
                <td className="border-r border-black p-2 text-center font-bold">
                  {item.qty}
                </td>
                <td className="border-r border-black p-2 text-right tabular-nums">
                  ₹ {item.ratePerPc.toFixed(2)}
                </td>
                <td className="p-2 text-right font-bold tabular-nums">
                  ₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}

            {/* Subtotal Row */}
            <tr className="border-b border-black">
              <td colSpan={3} className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-right font-bold bg-neutral-50">
                Subtotal
              </td>
              <td className="p-2 text-right font-bold tabular-nums">
                ₹ {quotation.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* GST Row */}
            <tr className="border-b border-black">
              <td colSpan={3} className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-right font-bold bg-neutral-50">
                GST @ {quotation.gstRate}%
              </td>
              <td className="p-2 text-right font-bold tabular-nums">
                ₹ {quotation.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* BEFORE FREIGHT Row */}
            <tr className="border-b border-black">
              <td colSpan={3} className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-right font-black uppercase bg-neutral-50">
                TOTAL BEFORE FREIGHT
              </td>
              <td className="p-2 text-right font-black tabular-nums bg-neutral-50">
                ₹ {quotation.totalBeforeFreight.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>

            {/* Freight Row */}
            <tr>
              <td colSpan={3} className="border-r border-black p-2"></td>
              <td className="border-r border-black p-2 text-right font-bold bg-neutral-50">
                Freight
              </td>
              <td className="p-2 text-right font-bold">
                {quotation.freight || 'Extra'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words */}
        <div className="text-xs mb-6 p-2 bg-neutral-50 border border-neutral-400">
          <strong className="font-bold text-neutral-900">Amount in Words: </strong>
          <span className="italic">{quotation.amountInWords}</span>
        </div>

        {/* Commercial Terms & Conditions */}
        <div className="mb-6">
          <h4 className="font-bold text-xs uppercase tracking-wider mb-2">
            COMMERCIAL TERMS & CONDITIONS
          </h4>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] text-neutral-800 leading-normal">
            {quotation.terms.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ol>
        </div>

        {/* Signatures Box */}
        <div className="grid grid-cols-2 border border-black text-xs mb-8">
          {/* Customer Acceptance */}
          <div className="p-3 border-r border-black flex flex-col justify-between min-h-[140px]">
            <div className="font-bold uppercase tracking-wider border-b border-black pb-1 mb-2">
              CUSTOMER ACCEPTANCE
            </div>
            <div className="space-y-3 text-[11px]">
              <div>
                Customer Name: <span className="inline-block border-b border-dotted border-black w-48 ml-1"></span>
              </div>
              <div>
                Authorized Person: <span className="inline-block border-b border-dotted border-black w-44 ml-1"></span>
              </div>
              <div>
                Signature & Seal: <span className="inline-block border-b border-dotted border-black w-48 ml-1"></span>
              </div>
              <div>
                Date: <span className="inline-block border-b border-dotted border-black w-32 ml-1"></span>
              </div>
            </div>
          </div>

          {/* DIGI PACK Signatory */}
          <div className="p-3 flex flex-col justify-between min-h-[140px]">
            <div className="font-bold uppercase tracking-wider border-b border-black pb-1 mb-2 flex justify-between items-center">
              <span>FOR DIGI PACK</span>
            </div>
            <div className="space-y-3 text-[11px]">
              <div className="font-medium text-neutral-600">Authorized Signatory</div>
              <div>
                Name: <span className="inline-block border-b border-dotted border-black w-48 ml-1"></span>
              </div>
              <div>
                Signature & Seal: <span className="inline-block border-b border-dotted border-black w-48 ml-1"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="pt-4 border-t border-neutral-300 text-center text-[10px] text-neutral-500 flex justify-between items-center">
          <span>This is a quotation and not a tax invoice.</span>
          <span className="font-semibold text-neutral-700">DIGI PACK | Quotation Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
