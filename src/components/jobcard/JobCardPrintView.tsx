import React, { useState } from 'react';
import { JobCard } from '../../types/erp';
import { DigiPackLogo } from '../common/DigiPackLogo';
import { Download, ArrowLeft, Loader2 } from 'lucide-react';
import { exportElementToPdf } from '../../utils/printAndPdfHelper';

interface JobCardPrintViewProps {
  jobCard: JobCard;
  onBack: () => void;
}

export const JobCardPrintView: React.FC<JobCardPrintViewProps> = ({ jobCard, onBack }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSavePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportElementToPdf(
        'job-card-sheet',
        `JobCard_${jobCard.jobCardNo}_${(jobCard.partyName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}`,
        { singlePageOnly: true }
      );
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-2 sm:p-6 flex flex-col items-center">
      {/* Top Action Bar */}
      <div className="w-full max-w-3xl mb-4 flex items-center justify-between no-print bg-white p-3 rounded-lg border border-neutral-300 shadow-xs">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Cards
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
                <span>Save PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* A4 Printable Job Card matching the exact attached PDF */}
      <div
        id="job-card-sheet"
        className="w-full max-w-3xl bg-white p-6 sm:p-8 border border-black shadow-md text-black font-sans print:p-0 print:border-none print:shadow-none flex flex-col justify-between"
        style={{ width: '100%', maxWidth: '210mm', minHeight: '290mm', boxSizing: 'border-box' }}
      >
        {/* Header: DIGI PACK Logo on left, JOB CARD title underlined on right */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/20">
          <div className="w-56">
            <DigiPackLogo size="lg" />
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-black uppercase tracking-wider text-black border-b-2 border-black pb-0.5 inline-block">
              JOB CARD
            </h1>
          </div>
        </div>

        {/* The Exact Attached Table Layout adjusted to fill A4 sheet cleanly */}
        <table className="w-full border-collapse border border-black text-xs flex-1">
          <tbody>
            {/* DATE */}
            <tr className="border-b border-black">
              <td className="w-1/3 py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                DATE
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.date}</td>
            </tr>

            {/* JOB CARD NO */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                JOB CARD NO
              </td>
              <td className="py-2 px-3 font-black text-sm text-red-600">{jobCard.jobCardNo}</td>
            </tr>

            {/* DATE OF DELIVERY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                DATE OF DELIVERY
              </td>
              <td className="py-2 px-3 font-semibold">{jobCard.deliveryDate}</td>
            </tr>

            {/* PARTY NAME */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PARTY NAME
              </td>
              <td className="py-2 px-3 font-bold text-sm">{jobCard.partyName}</td>
            </tr>

            {/* ITEM NAME */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                ITEM NAME
              </td>
              <td className="py-2 px-3 font-medium leading-normal">{jobCard.itemName}</td>
            </tr>

            {/* SUPPLIER NAME */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                SUPPLIER NAME
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.supplierName}</td>
            </tr>

            {/* SPEC */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                SPEC
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.spec}</td>
            </tr>

            {/* BOARD SIZE */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                BOARD SIZE
              </td>
              <td className="py-2 px-3 font-bold">{jobCard.boardSize}</td>
            </tr>

            {/* PLY: 3, 5, 7 Checkboxes */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PLY
              </td>
              <td className="py-2 px-3 font-medium">
                <div className="flex items-center gap-8">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">3</span>
                    <span
                      className={`inline-block w-4.5 h-4.5 border border-black text-center font-bold text-xs leading-3.5 ${
                        jobCard.ply === '3' ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {jobCard.ply === '3' ? '✓' : ''}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="font-bold">5</span>
                    <span
                      className={`inline-block w-4.5 h-4.5 border border-black text-center font-bold text-xs leading-3.5 ${
                        jobCard.ply === '5' ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {jobCard.ply === '5' ? '✓' : ''}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="font-bold">7</span>
                    <span
                      className={`inline-block w-4.5 h-4.5 border border-black text-center font-bold text-xs leading-3.5 ${
                        jobCard.ply === '7' ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {jobCard.ply === '7' ? '✓' : ''}
                    </span>
                  </span>
                </div>
              </td>
            </tr>

            {/* PRINT: YES, NO Checkboxes */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PRINT
              </td>
              <td className="py-2 px-3 font-medium">
                <div className="flex items-center gap-8">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">YES</span>
                    <span
                      className={`inline-block w-4.5 h-4.5 border border-black text-center font-bold text-xs leading-3.5 ${
                        jobCard.print === 'YES' ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {jobCard.print === 'YES' ? '✓' : ''}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="font-bold">NO</span>
                    <span
                      className={`inline-block w-4.5 h-4.5 border border-black text-center font-bold text-xs leading-3.5 ${
                        jobCard.print === 'NO' ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {jobCard.print === 'NO' ? '✓' : ''}
                    </span>
                  </span>
                </div>
              </td>
            </tr>

            {/* COLOR */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                COLOR
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.color || 'Standard Flexo'}</td>
            </tr>

            {/* STEREO */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                STEREO
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.stereo || 'DP-ST-STANDARD'}</td>
            </tr>

            {/* OUTER DIMENSION: L, W, H Boxes */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                OUTER DIMENSION
              </td>
              <td className="py-2 px-3 font-medium">
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-1.5">
                    <span className="font-bold">L</span>
                    <span className="inline-block min-w-12 px-2 py-0.5 border border-black text-center font-semibold">
                      {jobCard.outerDimension?.l || '-'}
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="font-bold">W</span>
                    <span className="inline-block min-w-12 px-2 py-0.5 border border-black text-center font-semibold">
                      {jobCard.outerDimension?.w || '-'}
                    </span>
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="font-bold">H</span>
                    <span className="inline-block min-w-12 px-2 py-0.5 border border-black text-center font-semibold">
                      {jobCard.outerDimension?.h || '-'}
                    </span>
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">(cm)</span>
                </div>
              </td>
            </tr>

            {/* REQUIRED QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                REQUIRED QTY
              </td>
              <td className="py-2 px-3 font-black text-sm">{jobCard.requiredQty} NOS</td>
            </tr>

            {/* CREASED QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                CREASED QTY
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.creasedQty || '-'}</td>
            </tr>

            {/* PRINTED QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PRINTED QTY
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.printedQty || '-'}</td>
            </tr>

            {/* PRODUCED QTY/BUNDLED QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PRODUCED QTY/BUNDLED QTY
              </td>
              <td className="py-2 px-3 font-bold">{jobCard.producedQty || '-'}</td>
            </tr>

            {/* BOARD DAMAGE QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                BOARD DAMAGE QTY
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.boardDamageQty ?? '-'}</td>
            </tr>

            {/* PRODUCTION DAMAGE QTY */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                PRODUCTION DAMAGE QTY
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.productionDamageQty ?? '-'}</td>
            </tr>

            {/* SIGN OF MANAGER */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                SIGN OF MANAGER
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.signOfManager || 'Shafi'}</td>
            </tr>

            {/* SIGN OF ACCOUNTANT */}
            <tr className="border-b border-black">
              <td className="py-2 px-3 font-bold uppercase tracking-wide border-r border-black bg-neutral-50/50">
                SIGN OF ACCOUNTANT
              </td>
              <td className="py-2 px-3 font-medium">{jobCard.signOfAccountant || 'Unni P.'}</td>
            </tr>

            {/* NOTE : */}
            <tr>
              <td className="py-3 px-3 font-bold uppercase tracking-wide border-r border-black align-top bg-neutral-50/50">
                NOTE :
              </td>
              <td className="py-3 px-3 font-medium min-h-16 leading-relaxed italic text-neutral-800 align-top">
                {jobCard.note || 'Produce according to approved specification sheet and shade sample.'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
