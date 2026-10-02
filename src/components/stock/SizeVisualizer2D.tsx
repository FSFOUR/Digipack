import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { CuttingMatchOption } from '../../types/erp';
import { CheckCircle2, Bookmark, ArrowRight, Sparkles, Layers } from 'lucide-react';

interface SizeVisualizer2DProps {
  initialLength?: number;
  initialWidth?: number;
  initialQty?: number;
  initialGsm?: number;
  onSelectOption?: (option: CuttingMatchOption) => void;
  referenceDocNo?: string;
}

export const SizeVisualizer2D: React.FC<SizeVisualizer2DProps> = ({
  initialLength = 69,
  initialWidth = 39,
  initialQty = 200,
  initialGsm = 300,
  onSelectOption,
  referenceDocNo = 'QUOTATION-CHECK',
}) => {
  const { findBestStockMatches, reserveStockForJob } = useErp();

  const [reqLength, setReqLength] = useState<number>(initialLength);
  const [reqWidth, setReqWidth] = useState<number>(initialWidth);
  const [reqQty, setReqQty] = useState<number>(initialQty);
  const [gsmFilter, setGsmFilter] = useState<number>(initialGsm);
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const [reservedSuccess, setReservedSuccess] = useState<string | null>(null);

  // Compute TOP 5 matching options from full stock inventory
  const matches = useMemo(() => {
    return findBestStockMatches(reqLength, reqWidth, reqQty, gsmFilter > 0 ? gsmFilter : undefined);
  }, [reqLength, reqWidth, reqQty, gsmFilter, findBestStockMatches]);

  const activeOption = matches.find((m) => m.rank === selectedRank) || matches[0];

  const handleReserve = async () => {
    if (!activeOption) return;
    try {
      await reserveStockForJob(activeOption.stockId, activeOption.sheetsNeeded, referenceDocNo);
      setReservedSuccess(
        `Successfully reserved ${activeOption.sheetsNeeded} sheets of ${activeOption.boardSize} for ${referenceDocNo}!`
      );
      setTimeout(() => setReservedSuccess(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Reservation failed');
    }
  };

  // Dimensions for SVG Visualizer
  const bl = activeOption?.boardLength || 100;
  const bw = activeOption?.boardWidth || 100;
  const rl = activeOption?.orientation === 'ROTATED' ? reqWidth : reqLength;
  const rw = activeOption?.orientation === 'ROTATED' ? reqLength : reqWidth;

  const cols = Math.max(1, Math.floor(bl / rl));
  const rows = Math.max(1, Math.floor(bw / rw));

  const totalUsedLength = cols * rl;
  const totalUsedWidth = rows * rw;
  const remLength = Math.max(0, Math.round((bl - totalUsedLength) * 10) / 10);
  const remWidth = Math.max(0, Math.round((bw - totalUsedWidth) * 10) / 10);

  // Scale calculations for SVG viewport (fit in 500x320 box)
  const maxViewWidth = 480;
  const maxViewHeight = 280;
  const scale = Math.min(maxViewWidth / bw, maxViewHeight / bl);
  const svgW = bw * scale;
  const svgH = bl * scale;

  return (
    <div className="bg-white border border-neutral-300 rounded-lg shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-neutral-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-bold text-white text-sm">
            2D
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Board Size 2D Cutting Visualizer & Stock Matcher
            </h3>
            <p className="text-xs text-neutral-400">
              Zero-Wastage & Minimum Wastage Search across Complete Board Stock Inventory
            </p>
          </div>
        </div>
        {activeOption?.isExactMatch && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded">
            <Sparkles className="w-3.5 h-3.5" /> EXACT MATCH FOUND
          </span>
        )}
      </div>

      {/* Input Parameters Bar */}
      <div className="p-4 bg-neutral-50 border-b border-neutral-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Required Length (cm)
            </label>
            <input
              type="number"
              min="5"
              step="0.5"
              value={reqLength}
              onChange={(e) => setReqLength(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded text-sm font-semibold focus:outline-hidden focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Required Width (cm)
            </label>
            <input
              type="number"
              min="5"
              step="0.5"
              value={reqWidth}
              onChange={(e) => setReqWidth(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded text-sm font-semibold focus:outline-hidden focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Required Quantity (pcs)
            </label>
            <input
              type="number"
              min="1"
              value={reqQty}
              onChange={(e) => setReqQty(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded text-sm font-semibold focus:outline-hidden focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Board GSM Spec
            </label>
            <select
              value={gsmFilter}
              onChange={(e) => setGsmFilter(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded text-sm font-semibold focus:outline-hidden focus:border-red-600"
            >
              <option value="0">Any GSM</option>
              <option value="250">250 GSM</option>
              <option value="280">280 GSM</option>
              <option value="300">300 GSM</option>
              <option value="320">320 GSM</option>
              <option value="350">350 GSM</option>
              <option value="400">400 GSM</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[11px] text-neutral-500 font-medium pb-1">
              Searched: {matches.length} Options
            </div>
            <div className="text-xs font-semibold text-neutral-900 bg-neutral-200/60 px-3 py-1.5 rounded flex items-center justify-between">
              <span>Pieces/Cut:</span>
              <span className="font-bold text-red-600">{activeOption?.piecesPerSheet || 1}</span>
            </div>
          </div>
        </div>
      </div>

      {reservedSuccess && (
        <div className="mx-4 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {reservedSuccess}
        </div>
      )}

      {/* Main Grid: 2D Canvas on left, Top 5 Ranked Options on right */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Visual Representation */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-neutral-100 rounded-lg border border-neutral-300 min-h-[360px]">
          <div className="w-full flex items-center justify-between text-xs font-bold text-neutral-600 mb-2">
            <span>
              Board Sheet: <strong className="text-black">{activeOption?.boardSize}</strong> ({bl} × {bw} cm)
            </span>
            <span className="text-red-700">
              Orientation: <strong>{activeOption?.orientation}</strong>
            </span>
          </div>

          {/* SVG Canvas */}
          <div className="relative p-2 bg-white border-2 border-neutral-800 shadow-md rounded flex items-center justify-center overflow-auto max-w-full">
            <svg
              width={svgW}
              height={svgH}
              viewBox={`0 0 ${bw} ${bl}`}
              className="bg-neutral-200 transition-all duration-300"
            >
              {/* Background Master Sheet Area */}
              <rect x="0" y="0" width={bw} height={bl} fill="#F3F4F6" stroke="#111827" strokeWidth="1.5" />

              {/* Tiled Cut Pieces */}
              {Array.from({ length: rows }).map((_, rIdx) =>
                Array.from({ length: cols }).map((_, cIdx) => (
                  <g key={`${rIdx}-${cIdx}`}>
                    <rect
                      x={rIdx * rw + 0.3}
                      y={cIdx * rl + 0.3}
                      width={rw - 0.6}
                      height={rl - 0.6}
                      fill="#DC2626"
                      fillOpacity="0.85"
                      stroke="#991B1B"
                      strokeWidth="0.8"
                      rx="1"
                    />
                    <text
                      x={rIdx * rw + rw / 2}
                      y={cIdx * rl + rl / 2 + 1}
                      fill="#FFFFFF"
                      fontSize={Math.min(rw, rl) * 0.28}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      #{rIdx * cols + cIdx + 1}
                    </text>
                  </g>
                ))
              )}

              {/* Scrap / Wastage Area Shading */}
              {remWidth > 0 && (
                <rect
                  x={totalUsedWidth}
                  y="0"
                  width={remWidth}
                  height={bl}
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeDasharray="2,2"
                />
              )}
              {remLength > 0 && (
                <rect
                  x="0"
                  y={totalUsedLength}
                  width={totalUsedWidth}
                  height={remLength}
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeDasharray="2,2"
                />
              )}
            </svg>
          </div>

          {/* Dimension Details & Scrap Summary */}
          <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded border border-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Pieces / Sheet</span>
              <strong className="text-neutral-900 text-sm font-bold">{activeOption?.piecesPerSheet} pcs</strong>
            </div>
            <div className="bg-white p-2 rounded border border-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Sheets Required</span>
              <strong className="text-neutral-900 text-sm font-bold">{activeOption?.sheetsNeeded} sheets</strong>
            </div>
            <div className="bg-white p-2 rounded border border-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Remaining Scrap</span>
              <strong className="text-neutral-900 text-sm font-bold">{remLength} × {remWidth} cm</strong>
            </div>
            <div className="bg-white p-2 rounded border border-neutral-300">
              <span className="text-neutral-500 block text-[10px]">Wastage %</span>
              <strong className={`text-sm font-bold ${activeOption?.wastagePercent < 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {activeOption?.wastagePercent}%
              </strong>
            </div>
          </div>
        </div>

        {/* Right: TOP 5 MATCHING OPTIONS LIST */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-600" /> Top 5 Stock Cutting Matches
              </h4>
              <span className="text-[11px] text-neutral-500 font-medium">Ranked by minimum waste</span>
            </div>

            <div className="space-y-2.5">
              {matches.map((opt) => {
                const isSelected = opt.rank === selectedRank;
                const isSufficient = opt.currentAvailableQty >= opt.sheetsNeeded;

                return (
                  <div
                    key={opt.stockId}
                    onClick={() => {
                      setSelectedRank(opt.rank);
                      if (onSelectOption) onSelectOption(opt);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-red-600 bg-red-50/40 shadow-xs ring-1 ring-red-600'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            opt.rank === 1
                              ? 'bg-red-600 text-white'
                              : 'bg-neutral-200 text-neutral-700'
                          }`}
                        >
                          #{opt.rank}
                        </span>
                        <span className="font-bold text-sm text-neutral-900">
                          {opt.boardSize}
                        </span>
                        {opt.isExactMatch && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                            EXACT
                          </span>
                        )}
                        {opt.isZeroWastage && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                            ZERO-WASTE
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            opt.wastagePercent < 5
                              ? 'text-emerald-700'
                              : opt.wastagePercent < 15
                              ? 'text-amber-700'
                              : 'text-neutral-700'
                          }`}
                        >
                          {opt.wastagePercent}% waste
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] text-neutral-600 mt-2">
                      <div>
                        Yield: <strong>{opt.piecesPerSheet} pcs/sheet</strong>
                      </div>
                      <div>
                        Need: <strong>{opt.sheetsNeeded} shts</strong>
                      </div>
                      <div>
                        Stock:{' '}
                        <strong className={isSufficient ? 'text-emerald-700' : 'text-rose-700'}>
                          {opt.currentAvailableQty} avl
                        </strong>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>
                        {opt.gsm} GSM · {opt.creasing} · {opt.location}
                      </span>
                      <span className="font-semibold text-neutral-900">
                        ₹{(opt.ratePerSheet * opt.sheetsNeeded).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center gap-2">
            <button
              onClick={handleReserve}
              disabled={!activeOption || activeOption.currentAvailableQty < activeOption.sheetsNeeded}
              className={`flex-1 py-2 px-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                activeOption?.currentAvailableQty >= activeOption?.sheetsNeeded
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Reserve Selected Stock ({activeOption?.sheetsNeeded || 0} sheets)
            </button>

            {onSelectOption && activeOption && (
              <button
                onClick={() => onSelectOption(activeOption)}
                className="py-2 px-4 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                Use Size <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
