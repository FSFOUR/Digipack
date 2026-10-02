import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';

export const StockModule: React.FC = () => {
  const { role } = useAuth();
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
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Board Size
          </button>

          <button
            onClick={exportStockToCSV}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Download CSV for Excel"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          <label className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Import Excel
            <input type="file" accept=".csv,.xlsx" onChange={handleCSVUpload} className="hidden" />
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

        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 w-full md:w-auto shrink-0">
          <select
            value={filterGsm}
            onChange={(e) => setFilterGsm(e.target.value)}
            className="w-full min-w-0 px-1.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
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
            className="w-full min-w-0 px-1.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
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
            className="w-full min-w-0 px-1.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded text-[11px] sm:text-xs font-semibold focus:border-red-600 focus:outline-hidden truncate"
          >
            <option value="ALL">All Status</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="CRITICAL">Critical</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* MOBILE DEVICE VIEW: All stock size details in one view without scrolling to side */}
      <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
        {filteredStocks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
            No stock items found matching your filters.
          </div>
        ) : (
          filteredStocks.map((stock) => {
            const isCritical = stock.availableQty <= stock.minStock;
            const isLow = stock.availableQty <= stock.reorderLevel;

            return (
              <div
                key={`mob-${stock.id}`}
                className={`bg-white rounded-xl border p-3.5 shadow-xs transition-colors ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/20'
                    : isLow
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-neutral-200'
                }`}
              >
                {/* Header: Board Size, Ply, Reorder Badge, Location */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base font-black text-neutral-900 tracking-tight">
                        {stock.boardSize}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {stock.ply || '3ply'}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-rose-600 text-white font-bold rounded">
                          REORDER
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-neutral-600 font-semibold mt-0.5">
                      {stock.boardType} · {stock.gsm} GSM
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {stock.length} × {stock.width} cm · {stock.creasing}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-[10px] text-neutral-700 inline-block mb-1">
                      {stock.location}
                    </span>
                    <div className="text-[11px] text-neutral-500">
                      Rate: <span className="font-bold text-neutral-800">₹{stock.rate.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Numbers Grid (All metrics in one tab, zero horizontal scrolling) */}
                <div className="grid grid-cols-4 gap-1.5 py-2.5 border-b border-neutral-100 text-center">
                  <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-100">
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Opening</div>
                    <div className="text-xs font-black text-neutral-800 tabular-nums mt-0.5">
                      {stock.openingStock.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">IN</div>
                    <div className="text-xs font-black text-emerald-700 tabular-nums mt-0.5">
                      +{stock.inQty.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-rose-50/70 p-1.5 rounded-lg border border-rose-100">
                    <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">OUT</div>
                    <div className="text-xs font-black text-rose-700 tabular-nums mt-0.5">
                      -{stock.outQty.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-amber-50/70 p-1.5 rounded-lg border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Reserved</div>
                    <div className="text-xs font-black text-amber-700 tabular-nums mt-0.5">
                      {stock.reservedQty.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Available Stock & Action Buttons (Clean & fully accessible on mobile) */}
                <div className="pt-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Available Stock
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-base font-black tabular-nums ${
                          isCritical
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {stock.availableQty.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-500">sheets</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 block -mt-0.5">
                      Val: ₹{stock.totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedStock(stock);
                        setShowInModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                      title="Stock IN"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" /> IN
                    </button>

                    <button
                      onClick={() => {
                        setSelectedStock(stock);
                        setShowOutModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs"
                      title="Stock OUT"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5" /> OUT
                    </button>

                    {role === 'OWNER / ADMIN' && (
                      <button
                        onClick={() => {
                          setStockToDelete(stock);
                          setDeleteError(null);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-neutral-200"
                        title={`Delete ${stock.boardSize}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW: Full multi-column view on larger screens */}
      <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                <th className="p-3">Board Size</th>
                <th className="p-3">Specs & Type</th>
                <th className="p-3 text-right">Opening</th>
                <th className="p-3 text-right text-emerald-400">IN</th>
                <th className="p-3 text-right text-rose-400">OUT</th>
                <th className="p-3 text-right text-amber-400">Reserved</th>
                <th className="p-3 text-right">Available</th>
                <th className="p-3 text-right">Rate</th>
                <th className="p-3 text-right">Total Value</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredStocks.map((stock) => {
                const isCritical = stock.availableQty <= stock.minStock;
                const isLow = stock.availableQty <= stock.reorderLevel;

                return (
                  <tr
                    key={stock.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      isCritical ? 'bg-rose-50/40' : isLow ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="p-3 font-black text-sm text-neutral-900">
                      <div className="flex items-center gap-1.5">
                        <span>{stock.boardSize}</span>
                        {isCritical && (
                          <span className="text-[10px] px-1 bg-rose-600 text-white font-bold rounded">
                            REORDER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-normal block">
                        {stock.length} × {stock.width} cm
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-neutral-800">{stock.boardType}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          {stock.ply || '3ply'}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {stock.gsm} GSM · {stock.creasing}
                      </div>
                    </td>

                    <td className="p-3 text-right font-medium text-neutral-600 tabular-nums">
                      {stock.openingStock.toLocaleString()}
                    </td>

                    <td className="p-3 text-right font-bold text-emerald-700 tabular-nums">
                      +{stock.inQty.toLocaleString()}
                    </td>

                    <td className="p-3 text-right font-bold text-rose-700 tabular-nums">
                      -{stock.outQty.toLocaleString()}
                    </td>

                    <td className="p-3 text-right font-bold text-amber-700 tabular-nums">
                      {stock.reservedQty.toLocaleString()}
                    </td>

                    <td className="p-3 text-right tabular-nums">
                      <span
                        className={`text-sm font-black ${
                          isCritical
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-neutral-900'
                        }`}
                      >
                        {stock.availableQty.toLocaleString()}
                      </span>
                    </td>

                    <td className="p-3 text-right font-medium tabular-nums text-neutral-700">
                      ₹{stock.rate.toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-bold tabular-nums text-neutral-900">
                      ₹{stock.totalValue.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-[11px]">
                        {stock.location}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStock(stock);
                            setShowInModal(true);
                          }}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-[11px] flex items-center gap-0.5 shadow-xs"
                          title="Stock IN (Goods Receipt)"
                        >
                          <ArrowDownToLine className="w-3 h-3" /> IN
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStock(stock);
                            setShowOutModal(true);
                          }}
                          className="px-2 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] flex items-center gap-0.5 shadow-xs"
                          title="Stock OUT (Production Issue)"
                        >
                          <ArrowUpFromLine className="w-3 h-3" /> OUT
                        </button>

                        {role === 'OWNER / ADMIN' && (
                          <button
                            onClick={() => {
                              setStockToDelete(stock);
                              setDeleteError(null);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-0.5"
                            title={`Delete ${stock.boardSize} Master Size (Owner / Admin Only)`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Delete Confirmation Modal (Owner/Admin Only) */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 text-neutral-900">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-neutral-900">
                  Delete Board Size Master
                </h3>
                <p className="text-[11px] text-neutral-500 font-semibold">
                  Owner / Admin Authorization Required
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              Are you sure you want to permanently delete board size{' '}
              <strong className="text-neutral-900 font-black">{stockToDelete.boardSize}</strong> ({stockToDelete.length} × {stockToDelete.width} cm, {stockToDelete.ply || '3ply'}, {stockToDelete.gsm} GSM) from stock inventory?
            </p>

            {deleteError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <button
                type="button"
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
                onClick={async () => {
                  try {
                    if (role !== 'OWNER / ADMIN') {
                      setDeleteError('Permission denied: Only Owner or Admin can delete.');
                      return;
                    }
                    await deleteStockItem(stockToDelete.id);
                    setStockToDelete(null);
                    setDeleteError(null);
                  } catch (err: any) {
                    setDeleteError(err.message || 'Failed to delete board size');
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                Yes, Delete Size
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
