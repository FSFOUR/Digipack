import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { useAuth } from '../../context/AuthContext';
import { BoardStockItem } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  Boxes,
  TrendingDown,
  Layers,
  Trash2,
  CheckCircle2,
  Lock,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const StockModule: React.FC = () => {
  const { role } = useAuth();
  const isGuest = role === 'VIEW ONLY';
  const {
    boardStocks,
    stockTransactions,
    addStockItem,
    updateStockItem,
    deleteStockItem,
    recordStockIn,
    recordStockOut,
    exportStockToCSV,
    importStockFromData,
  } = useErp();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGsm, setFilterGsm] = useState<string>('ALL');
  const [filterPly, setFilterPly] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedStock, setSelectedStock] = useState<BoardStockItem | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState<BoardStockItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    boardSize: '',
    length: 69,
    width: 115,
    gsm: 300,
    ply: '3ply' as string,
    creasing: 'NON-CREASING' as 'CREASING' | 'NON-CREASING',
    boardType: 'Duplex Grey Back',
    openingStock: 1000,
    rate: 18.5,
    supplier: 'Emami Paper Mills Ltd',
    location: 'Bay General',
    minStock: 300,
    reorderLevel: 500,
  });

  const [inOutData, setInOutData] = useState({
    quantity: 100,
    rate: 19.0,
    supplier: 'Emami Paper Mills Ltd',
    invoiceNo: '',
    jobCardNo: 'DP-JC-2026-0001',
    workName: '5-Ply Master Box',
    location: 'Bay A-01',
    purpose: 'Production Issue',
    remarks: '',
  });

  // Filtered stocks
  const filteredStocks = useMemo(() => {
    return boardStocks.filter((item) => {
      const matchSearch =
        item.boardSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.boardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ply && item.ply.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchGsm = filterGsm === 'ALL' || item.gsm.toString() === filterGsm;
      const matchPly = filterPly === 'ALL' || item.ply === filterPly;

      let matchStatus = true;
      if (filterStatus === 'LOW_STOCK') {
        matchStatus = item.availableQty <= item.reorderLevel;
      } else if (filterStatus === 'CRITICAL') {
        matchStatus = item.availableQty <= item.minStock;
      } else if (filterStatus === 'OUT_OF_STOCK') {
        matchStatus = item.availableQty === 0;
      }

      return matchSearch && matchGsm && matchPly && matchStatus;
    });
  }, [boardStocks, searchTerm, filterGsm, filterPly, filterStatus]);

  // Handle Form Submissions
  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.boardSize) return;
    await addStockItem({
      boardSize: formData.boardSize.toUpperCase(),
      length: Number(formData.length),
      width: Number(formData.width),
      gsm: Number(formData.gsm),
      ply: formData.ply,
      creasing: formData.creasing,
      boardType: formData.boardType,
      openingStock: Number(formData.openingStock),
      inQty: 0,
      outQty: 0,
      reservedQty: 0,
      rate: Number(formData.rate),
      supplier: formData.supplier,
      location: formData.location,
      minStock: Number(formData.minStock),
      reorderLevel: Number(formData.reorderLevel),
    });
    setShowAddModal(false);
  };

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    try {
      await recordStockIn({
        stockId: selectedStock.id,
        quantity: Number(inOutData.quantity),
        rate: Number(inOutData.rate),
        supplier: inOutData.supplier,
        invoiceNo: inOutData.invoiceNo,
        location: inOutData.location,
        remarks: inOutData.remarks,
      });
      setShowInModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error in Stock IN');
    }
  };

  const handleStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    try {
      await recordStockOut({
        stockId: selectedStock.id,
        quantity: Number(inOutData.quantity),
        jobCardNo: inOutData.jobCardNo,
        workName: inOutData.workName,
        purpose: inOutData.purpose,
        remarks: inOutData.remarks,
      });
      setShowOutModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error in Stock OUT');
    }
  };

  // CSV Import File handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const imported: Partial<BoardStockItem>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 2) {
          const boardSize = cols[1]?.replace(/"/g, '').trim();
          if (boardSize) {
            imported.push({
              boardSize,
              length: parseFloat(cols[2]) || 69,
              width: parseFloat(cols[3]) || 115,
              gsm: parseInt(cols[4]) || 300,
              creasing: cols[5]?.includes('CREAS') ? 'CREASING' : 'NON-CREASING',
              openingStock: parseInt(cols[7]) || 500,
              rate: parseFloat(cols[12]) || 18.5,
              location: cols[15]?.replace(/"/g, '').trim() || 'Bay General',
            });
          }
        }
      }

      if (imported.length > 0) {
        const count = await importStockFromData(imported);
        alert(`Successfully imported ${count} board sizes into master inventory!`);
      }
    };
    reader.readAsText(file);
  };

  const totalSheets = boardStocks.reduce((sum, s) => sum + s.availableQty, 0);
  const totalVal = boardStocks.reduce((sum, s) => sum + s.totalValue, 0);
  const lowStockCount = boardStocks.filter((s) => s.availableQty <= s.reorderLevel).length;

  return (
    <div className="space-y-5">
      {/* Delete / Action Success Banner */}
      {deleteSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{deleteSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-black text-sm px-1.5"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-red-600" />
            Board Stock Inventory Master
          </h2>
          <p className="text-xs text-neutral-500">
            Official DIGI PACK Duplex Board Database · Strict Balances: Opening + IN - OUT - Reserved = Available
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (isGuest) {
                alert('Action locked: Adding board sizes is disabled in Guest (View Only) mode.');
                return;
              }
              setShowAddModal(true);
            }}
            disabled={isGuest}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs ${
              isGuest
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isGuest ? 'Locked in Guest Mode' : 'Add Board Size'}
          >
            {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4" />}
            <span>Add Board Size</span>
          </button>

          <button
            onClick={exportStockToCSV}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Download CSV for Excel"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <label
            onClick={(e) => {
              if (isGuest) {
                e.preventDefault();
                alert('Action locked: Importing Excel is disabled in Guest (View Only) mode.');
              }
            }}
            className={`px-3 py-1.5 border rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              isGuest
                ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300 cursor-pointer'
            }`}
          >
            {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <Upload className="w-4 h-4" />}
            <span>Import Excel</span>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleCSVUpload}
              disabled={isGuest}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Board Sizes
          </span>
          <div className="text-xl font-black text-neutral-900 tabular-nums">
            {boardStocks.length} Master Sizes
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Available Stock
          </span>
          <div className="text-xl font-black text-neutral-900 tabular-nums">
            {totalSheets.toLocaleString('en-IN')} Sheets
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Inventory Valuation
          </span>
          <div className="text-xl font-black text-neutral-900 tabular-nums">
            ₹{totalVal.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Reorder Alerts
          </span>
          <div className="text-xl font-black text-rose-700 tabular-nums">
            {lowStockCount} Sizes Low
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-neutral-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search board size (e.g. 69X115, 84X127), location, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-300 rounded focus:border-red-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full sm:w-auto">
            <select
              value={filterGsm}
              onChange={(e) => setFilterGsm(e.target.value)}
              className="w-full min-w-0 px-2 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
            >
              <option value="ALL">All GSM</option>
              <option value="250">250 GSM</option>
              <option value="280">280 GSM</option>
              <option value="300">300 GSM</option>
              <option value="320">320 GSM</option>
              <option value="350">350 GSM</option>
              <option value="400">400 GSM</option>
            </select>

            <select
              value={filterPly}
              onChange={(e) => setFilterPly(e.target.value)}
              className="w-full min-w-0 px-2 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
            >
              <option value="ALL">All Ply</option>
              <option value="3ply">3ply</option>
              <option value="5ply">5ply</option>
              <option value="6ply">6ply</option>
              <option value="7ply">7ply</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full min-w-0 px-2 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
            >
              <option value="ALL">All Status</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="CRITICAL">Critical</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Streamlined Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Showcase Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* UNIQUE & SIMPLE STOCK DISPLAY: CARD GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStocks.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
              No stock items found matching your filters.
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const isCritical = stock.availableQty <= stock.minStock;
              const isLow = stock.availableQty <= stock.reorderLevel;

              return (
                <div
                  key={`grid-${stock.id}`}
                  className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                    isCritical
                      ? 'border-rose-300 bg-rose-50/10'
                      : isLow
                      ? 'border-amber-300 bg-amber-50/10'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-neutral-900 tracking-tight">
                            {stock.boardSize}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            {stock.ply || '3ply'}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500 font-medium block">
                          {stock.length} × {stock.width} cm
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-[10px] text-neutral-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          {stock.location}
                        </span>
                        {isCritical ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-rose-600 text-white font-bold rounded">
                            REORDER
                          </span>
                        ) : isLow ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-600 text-white font-bold rounded">
                            LOW
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Specs Pill */}
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 space-y-1">
                      <div className="font-semibold text-neutral-800">{stock.boardType}</div>
                      <div className="text-neutral-500 text-[10px]">
                        {stock.gsm} GSM · {stock.creasing}
                      </div>
                    </div>

                    {/* Movement Formula Chips */}
                    <div className="bg-neutral-100/70 p-2 rounded-lg text-[11px] border border-neutral-200/80">
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Stock Movement Balance
                      </span>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-neutral-600" title="Opening">Op: {stock.openingStock}</span>
                        <span className="text-emerald-700 font-bold" title="IN">+{stock.inQty}</span>
                        <span className="text-rose-700 font-bold" title="OUT">-{stock.outQty}</span>
                        <span className="text-amber-700 font-bold" title="Reserved">-{stock.reservedQty}</span>
                      </div>
                    </div>

                    {/* Available & Valuation */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">Available</span>
                        <div className="text-xl font-black text-neutral-900 tabular-nums">
                          <span className={isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-neutral-900'}>
                            {stock.availableQty.toLocaleString()}
                          </span>{' '}
                          <span className="text-xs font-normal text-neutral-500">sheets</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 block">Valuation</span>
                        <div className="font-black text-neutral-900 text-sm tabular-nums">
                          ₹{stock.totalValue.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-neutral-500">₹{stock.rate.toFixed(2)}/sh</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        if (isGuest) {
                          alert('Action locked: Stock IN is disabled in Guest (View Only) mode.');
                          return;
                        }
                        setSelectedStock(stock);
                        setShowInModal(true);
                      }}
                      disabled={isGuest}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs ${
                        isGuest
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {isGuest ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <ArrowDownToLine className="w-3.5 h-3.5" />} IN
                    </button>

                    <button
                      onClick={() => {
                        if (isGuest) {
                          alert('Action locked: Stock OUT is disabled in Guest (View Only) mode.');
                          return;
                        }
                        setSelectedStock(stock);
                        setShowOutModal(true);
                      }}
                      disabled={isGuest}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs ${
                        isGuest
                          ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                          : 'bg-neutral-900 hover:bg-black text-white'
                      }`}
                    >
                      {isGuest ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <ArrowUpFromLine className="w-3.5 h-3.5" />} OUT
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isGuest) {
                          alert('Action locked: Deleting stock is disabled in Guest (View Only) mode.');
                          return;
                        }
                        setStockToDelete(stock);
                        setDeleteError(null);
                      }}
                      disabled={isGuest}
                      className={`p-1.5 rounded-lg transition-colors border ${
                        isGuest
                          ? 'text-neutral-400 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100/70 bg-rose-50 border-rose-200'
                      }`}
                      title="Delete size"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* UNIQUE & SIMPLE STOCK DISPLAY: STREAMLINED LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                  <th className="p-3.5 pl-4">Board Size & Material Specs</th>
                  <th className="p-3.5">Balance Flow (Op + IN - OUT - Rsvd)</th>
                  <th className="p-3.5 text-right">Net Available</th>
                  <th className="p-3.5 text-right">Valuation (Rate)</th>
                  <th className="p-3.5 text-center">Location</th>
                  <th className="p-3.5 pr-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-neutral-400 font-medium text-xs">
                      No stock items found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isCritical = stock.availableQty <= stock.minStock;
                    const isLow = stock.availableQty <= stock.reorderLevel;

                    return (
                      <tr
                        key={`list-${stock.id}`}
                        className={`hover:bg-neutral-50/90 transition-colors ${
                          isCritical ? 'bg-rose-50/40' : isLow ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        {/* 1. Board Size & Specs */}
                        <td className="p-3.5 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                              <span className="text-[11px] font-black text-neutral-900 leading-none">
                                {stock.ply?.replace('ply', '') || '3'}P
                              </span>
                              <span className="text-[8px] text-neutral-400 font-bold uppercase mt-0.5">PLY</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-sm text-neutral-900 tracking-tight">{stock.boardSize}</span>
                                <span className="text-xs text-neutral-500 font-medium">({stock.length} × {stock.width} cm)</span>
                                {isCritical ? (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-rose-600 text-white font-bold rounded">
                                    REORDER
                                  </span>
                                ) : isLow ? (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-600 text-white font-bold rounded">
                                    LOW
                                  </span>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-neutral-600 font-medium flex items-center gap-1.5 mt-0.5">
                                <span className="font-semibold text-neutral-800">{stock.boardType}</span>
                                <span className="text-neutral-300">•</span>
                                <span className="font-bold text-neutral-700">{stock.gsm} GSM</span>
                                <span className="text-neutral-300">•</span>
                                <span className="text-neutral-500 text-[10px]">{stock.creasing}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Stock Movement Flow */}
                        <td className="p-3.5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100/90 rounded-lg text-xs font-semibold text-neutral-700 border border-neutral-200 font-mono">
                            <span className="text-neutral-500" title="Opening Stock">{stock.openingStock.toLocaleString()}</span>
                            <span className="text-emerald-700 font-bold" title="Stock IN">+{stock.inQty.toLocaleString()}</span>
                            <span className="text-rose-700 font-bold" title="Stock OUT">-{stock.outQty.toLocaleString()}</span>
                            <span className="text-amber-700 font-bold" title="Reserved Stock">-{stock.reservedQty.toLocaleString()}</span>
                          </div>
                        </td>

                        {/* 3. Available Stock */}
                        <td className="p-3.5 text-right tabular-nums">
                          <div
                            className={`text-base font-black ${
                              isCritical
                                ? 'text-rose-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-neutral-900'
                            }`}
                          >
                            {stock.availableQty.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium">sheets</span>
                        </td>

                        {/* 4. Valuation (Rate) */}
                        <td className="p-3.5 text-right tabular-nums">
                          <div className="font-black text-neutral-900 text-sm">
                            ₹{stock.totalValue.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[11px] text-neutral-500">₹{stock.rate.toFixed(2)}/sh</span>
                        </td>

                        {/* 5. Location */}
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-neutral-300 rounded font-semibold text-[11px] text-neutral-800">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {stock.location}
                          </span>
                        </td>

                        {/* 6. Actions */}
                        <td className="p-3.5 pr-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                if (isGuest) {
                                  alert('Action locked: Stock IN is disabled in Guest (View Only) mode.');
                                  return;
                                }
                                setSelectedStock(stock);
                                setShowInModal(true);
                              }}
                              disabled={isGuest}
                              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors ${
                                isGuest
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                              }`}
                              title={isGuest ? 'Locked in Guest Mode' : 'Stock IN (Goods Receipt)'}
                            >
                              {isGuest ? <Lock className="w-3 h-3 text-amber-600" /> : <ArrowDownToLine className="w-3 h-3" />} IN
                            </button>

                            <button
                              onClick={() => {
                                if (isGuest) {
                                  alert('Action locked: Stock OUT is disabled in Guest (View Only) mode.');
                                  return;
                                }
                                setSelectedStock(stock);
                                setShowOutModal(true);
                              }}
                              disabled={isGuest}
                              className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors ${
                                isGuest
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-neutral-900 hover:bg-black text-white'
                              }`}
                              title={isGuest ? 'Locked in Guest Mode' : 'Stock OUT (Production Issue)'}
                            >
                              {isGuest ? <Lock className="w-3 h-3 text-amber-600" /> : <ArrowUpFromLine className="w-3 h-3" />} OUT
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (isGuest) {
                                  alert('Action locked: Deleting stock is disabled in Guest (View Only) mode.');
                                  return;
                                }
                                setStockToDelete(stock);
                                setDeleteError(null);
                              }}
                              disabled={isGuest}
                              className={`p-1.5 rounded-lg transition-colors border ${
                                isGuest
                                  ? 'text-neutral-400 bg-neutral-100 border-neutral-200 cursor-not-allowed'
                                  : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100/70 bg-rose-50/50 border-rose-200'
                              }`}
                              title={isGuest ? 'Locked in Guest Mode' : `Delete size ${stock.boardSize}`}
                              aria-label={`Delete board size ${stock.boardSize}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock IN Modal */}
      {showInModal && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
              Stock IN — {selectedStock.boardSize} ({selectedStock.gsm} GSM)
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Current Available: {selectedStock.availableQty} sheets · Location: {selectedStock.location}
            </p>

            <form onSubmit={handleStockIn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Quantity (Sheets)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={inOutData.quantity}
                  onChange={(e) => setInOutData({ ...inOutData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-bold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rate / Sheet (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inOutData.rate}
                    onChange={(e) => setInOutData({ ...inOutData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={inOutData.location}
                    onChange={(e) => setInOutData({ ...inOutData, location: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={inOutData.supplier}
                  onChange={(e) => setInOutData({ ...inOutData, supplier: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Invoice / Delivery Challan No.</label>
                <input
                  type="text"
                  placeholder="e.g. INV-9921 / EPM-01"
                  value={inOutData.invoiceNo}
                  onChange={(e) => setInOutData({ ...inOutData, invoiceNo: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowInModal(false)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold uppercase tracking-wider"
                >
                  Confirm Stock IN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock OUT Modal */}
      {showOutModal && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <ArrowUpFromLine className="w-5 h-5 text-rose-600" />
              Stock OUT — Issue {selectedStock.boardSize}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Available to Issue:{' '}
              <strong className="text-neutral-900">{selectedStock.availableQty} sheets</strong>
            </p>

            <form onSubmit={handleStockOut} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Issue Quantity (Sheets)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedStock.availableQty}
                  required
                  value={inOutData.quantity}
                  onChange={(e) => setInOutData({ ...inOutData, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-bold focus:border-red-600 focus:outline-hidden"
                />
                {inOutData.quantity > selectedStock.availableQty && (
                  <p className="text-rose-600 text-[11px] mt-1 font-bold">
                    Cannot issue more than available balance ({selectedStock.availableQty} sheets)
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Job Card No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DP-JC-2026-0001"
                  value={inOutData.jobCardNo}
                  onChange={(e) => setInOutData({ ...inOutData, jobCardNo: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Work / Job Description</label>
                <input
                  type="text"
                  placeholder="e.g. Leemmak 5-Ply Master Box"
                  value={inOutData.workName}
                  onChange={(e) => setInOutData({ ...inOutData, workName: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Purpose / Machine Line</label>
                <select
                  value={inOutData.purpose}
                  onChange={(e) => setInOutData({ ...inOutData, purpose: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                >
                  <option value="Production Issue">Production Issue (Die-Cut / Corrugation)</option>
                  <option value="Sample Making">Sample Making</option>
                  <option value="Damaged Sheet Write-off">Damaged Sheet Write-off</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowOutModal(false)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inOutData.quantity > selectedStock.availableQty}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 text-white rounded font-bold uppercase tracking-wider"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Master Board Size Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Add New Duplex Board Size Master
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter exact board format (e.g. 76X110) and physical dimensions.
            </p>

            <form onSubmit={handleCreateStock} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold text-neutral-700 mb-1">Board Size Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 76X110"
                    value={formData.boardSize}
                    onChange={(e) => setFormData({ ...formData, boardSize: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-black focus:border-red-600 focus:outline-hidden uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Length (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Width (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">GSM</label>
                  <select
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: parseInt(e.target.value) || 300 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="230">230 GSM</option>
                    <option value="250">250 GSM</option>
                    <option value="280">280 GSM</option>
                    <option value="300">300 GSM</option>
                    <option value="320">320 GSM</option>
                    <option value="350">350 GSM</option>
                    <option value="400">400 GSM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ply Spec (Number)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      step="1"
                      required
                      placeholder="3"
                      value={parseInt(formData.ply.replace(/\D/g, '')) || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          ply: val ? `${val}ply` : '3ply',
                        });
                      }}
                      className="w-full p-2 pr-10 bg-neutral-50 border border-neutral-300 rounded text-sm font-bold focus:border-red-600 focus:outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-400 pointer-events-none">
                      PLY
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Creasing</label>
                  <select
                    value={formData.creasing}
                    onChange={(e) => setFormData({ ...formData, creasing: e.target.value as any })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="NON-CREASING">NON-CREASING</option>
                    <option value="CREASING">CREASING</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Board Type</label>
                  <select
                    value={formData.boardType}
                    onChange={(e) => setFormData({ ...formData, boardType: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="Duplex Grey Back">Duplex Grey Back</option>
                    <option value="Duplex White Back">Duplex White Back</option>
                    <option value="Kraft Liner">Kraft Liner</option>
                    <option value="Heavy Duplex">Heavy Duplex</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={formData.openingStock}
                    onChange={(e) => setFormData({ ...formData, openingStock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Rate (₹ / Sheet)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Storage Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Min Stock Threshold</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                  />
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider"
                >
                  Save Board Size Master
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 text-neutral-900">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-neutral-100">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900">
                  Delete Board Size: {stockToDelete.boardSize}
                </h3>
                <p className="text-[11px] text-neutral-500 font-semibold">
                  Stock Inventory Master Deletion
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <p className="text-neutral-600 leading-relaxed">
                Are you sure you want to permanently delete board size{' '}
                <strong className="text-neutral-900 font-black">{stockToDelete.boardSize}</strong> from the stock database?
              </p>

              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Dimensions:</span>
                  <span className="font-bold text-neutral-800">{stockToDelete.length} × {stockToDelete.width} cm ({stockToDelete.ply || '3ply'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">GSM & Type:</span>
                  <span className="font-bold text-neutral-800">{stockToDelete.gsm} GSM · {stockToDelete.boardType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Available Stock:</span>
                  <span className="font-bold text-neutral-800">{stockToDelete.availableQty.toLocaleString()} Sheets</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-medium">Storage Location:</span>
                  <span className="font-bold text-neutral-800">{stockToDelete.location}</span>
                </div>
              </div>

              {stockToDelete.reservedQty > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Warning: {stockToDelete.reservedQty} sheets are currently reserved for pending jobs.</span>
                </div>
              )}

              {deleteError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setStockToDelete(null);
                  setDeleteError(null);
                }}
                className="px-3.5 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  if (isDeleting) return;
                  if (role === 'VIEW ONLY') {
                    setDeleteError('Permission denied: View-only accounts cannot delete sizes.');
                    return;
                  }
                  try {
                    setIsDeleting(true);
                    setDeleteError(null);
                    const sizeName = stockToDelete.boardSize;
                    const stockId = stockToDelete.id;
                    await deleteStockItem(stockId);
                    setStockToDelete(null);
                    setDeleteSuccessMessage(`Board size ${sizeName} was successfully deleted from inventory.`);
                    if (toastTimerRef.current) {
                      clearTimeout(toastTimerRef.current);
                    }
                    toastTimerRef.current = setTimeout(() => {
                      setDeleteSuccessMessage((prev) => (prev?.includes(sizeName) ? null : prev));
                    }, 4000);
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Failed to delete board size';
                    setDeleteError(message);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>Deleting...</>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Delete Size
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
