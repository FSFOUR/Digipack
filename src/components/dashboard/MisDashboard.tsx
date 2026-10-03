import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  AlertTriangle,
  Boxes,
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  Receipt,
  CreditCard,
  PackageCheck,
  ChevronRight,
  ArrowUpRight,
  Wrench,
  Users,
  Eye,
  X,
} from 'lucide-react';

interface MisDashboardProps {
  onNavigate: (module: string) => void;
}

export const MisDashboard: React.FC<MisDashboardProps> = ({ onNavigate }) => {
  const { role } = useAuth();
  const [showGuestNotice, setShowGuestNotice] = useState(true);
  const {
    enquiries,
    quotations,
    salesOrders,
    materialRequirements,
    jobCards,
    finishedGoods,
    dispatches,
    invoices,
    boardStocks,
    purchaseOrders,
    attendance,
    machines,
  } = useErp();

  // Metrics Calculations
  const totalStockValue = boardStocks.reduce((sum, s) => sum + s.totalValue, 0);
  const lowStockItems = boardStocks.filter((s) => s.availableQty <= s.reorderLevel);
  const reorderCritical = boardStocks.filter((s) => s.availableQty <= s.minStock);

  const totalSalesRevenue = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceAmount, 0);
  const overdueInvoices = invoices.filter((i) => i.paymentStatus === 'OVERDUE' || (i.balanceAmount > 0 && new Date(i.dueDate) < new Date()));
  const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.balanceAmount, 0);

  const pendingQuotations = quotations.filter((q) => q.status === 'SENT' || q.status === 'DRAFT');
  const approvedQuotations = quotations.filter((q) => q.status === 'APPROVED' || q.status === 'CONVERTED');

  const pendingSalesOrders = salesOrders.filter((s) => s.status === 'CONFIRMED' || s.status === 'PLANNED');
  const inProductionJobs = jobCards.filter((j) => j.status === 'IN_PRODUCTION');
  const readyJobs = jobCards.filter((j) => j.status === 'READY' || j.status === 'PENDING');
  const completedJobs = jobCards.filter((j) => j.status === 'COMPLETED');

  const qcPendingJobs = jobCards.filter((j) => j.currentStage === 'QC' || j.status === 'QC_PENDING');
  const readyFinishedGoods = finishedGoods.filter((f) => f.availableQty > 0);
  const pendingDispatches = dispatches.filter((d) => d.status === 'READY' || d.status === 'LOADING');
  const completedDispatches = dispatches.filter((d) => d.status === 'DELIVERED');

  const pendingPurchases = purchaseOrders.filter((p) => p.status === 'APPROVED' || p.status === 'PENDING');
  const totalPayables = pendingPurchases.reduce((sum, p) => sum + p.amount, 0);

  const machinesBreakdown = machines.filter((m) => m.status === 'BREAKDOWN' || m.status === 'MAINTENANCE');
  const presentEmployees = attendance.filter((a) => a.status === 'PRESENT');

  // Interactive KPI Cards Data
  const kpiCards = [
    {
      label: 'Total Sales Revenue',
      value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`,
      sub: `${invoices.length} Invoices generated`,
      color: 'border-l-4 border-l-black',
      module: 'invoices',
      icon: TrendingUp,
    },
    {
      label: 'Outstanding Receivables',
      value: `₹${totalReceivables.toLocaleString('en-IN')}`,
      sub: `₹${totalOverdue.toLocaleString('en-IN')} Overdue`,
      color: 'border-l-4 border-l-amber-500',
      module: 'payments',
      icon: CreditCard,
    },
    {
      label: 'Board Stock Inventory',
      value: `₹${totalStockValue.toLocaleString('en-IN')}`,
      sub: `${boardStocks.length} Master sizes stocked`,
      color: 'border-l-4 border-l-red-600',
      module: 'stock',
      icon: Boxes,
    },
    {
      label: 'Low Stock Alerts',
      value: `${lowStockItems.length} Sizes`,
      sub: `${reorderCritical.length} Reorder required`,
      color: 'border-l-4 border-l-rose-600',
      module: 'stock',
      icon: AlertTriangle,
    },
    {
      label: 'Active Job Cards',
      value: `${inProductionJobs.length + readyJobs.length} Jobs`,
      sub: `${inProductionJobs.length} currently on floor`,
      color: 'border-l-4 border-l-blue-600',
      module: 'jobcards',
      icon: ClipboardList,
    },
    {
      label: 'Finished Goods Ready',
      value: `${readyFinishedGoods.reduce((sum, f) => sum + f.availableQty, 0)} Pcs`,
      sub: `${readyFinishedGoods.length} Production lots`,
      color: 'border-l-4 border-l-emerald-600',
      module: 'finishedgoods',
      icon: PackageCheck,
    },
  ];

  // Workflow Pipeline Stages with Total, Pending, Completed, Delayed counts
  const workflowStages = [
    { name: 'QUOTATION', total: quotations.length, pending: pendingQuotations.length, completed: approvedQuotations.length, module: 'quotations' },
    { name: 'MATERIAL', total: materialRequirements.length, pending: materialRequirements.filter((m) => m.status === 'SHORTAGE').length, completed: materialRequirements.filter((m) => m.status === 'SUFFICIENT').length, module: 'material' },
    { name: 'JOB CARD', total: jobCards.length, pending: readyJobs.length, completed: completedJobs.length, module: 'jobcards' },
    { name: 'PRODUCTION', total: jobCards.length, pending: inProductionJobs.length, completed: completedJobs.length, module: 'production' },
    { name: 'DISPATCH', total: dispatches.length, pending: pendingDispatches.length, completed: completedDispatches.length, module: 'dispatch' },
  ];

  return (
    <div className="space-y-6">
      {/* Guest Mode Explorer Notification */}
      {role === 'VIEW ONLY' && showGuestNotice && (
        <div className="bg-gradient-to-r from-blue-900/90 to-neutral-900 border border-blue-700/60 rounded-xl p-3.5 sm:p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <span>Welcome to DIGI PACK ERP — Guest Mode (View Only)</span>
              </p>
              <p className="text-[11px] sm:text-xs text-blue-200/80 mt-0.5">
                All manufacturing modules, 2D cutting visualizer, stock search, job cards, documents, and reports are fully functional to explore on all devices.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGuestNotice(false)}
            className="self-end sm:self-center text-xs text-blue-300 hover:text-white px-2.5 py-1 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>
      )}

      {/* Top Banner / Welcome */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            <span className="text-red-600">DIGI</span> <span className="text-white">PACK</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('visualizer')}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            2D Stock Check
          </button>
          <button
            onClick={() => onNavigate('quotations')}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Quotations
          </button>
          <button
            onClick={() => onNavigate('production')}
            className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Production Floor
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(card.module)}
              className={`p-4 bg-white rounded-lg border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-150 cursor-pointer ${card.color} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                  {card.label}
                </span>
                <Icon className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <div className="text-lg font-black text-neutral-900 tracking-tight tabular-nums">
                  {card.value}
                </div>
                <div className="text-[11px] text-neutral-500 font-medium mt-1 truncate">
                  {card.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Workflow Pipeline Tracker */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              End-to-End Manufacturing Workflow Pipeline
            </h3>
            <p className="text-xs text-neutral-500">
              Traceability from Customer Enquiry to Bank Payment. Click any stage to open its records.
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded">
            {workflowStages.length} Core Stages
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {workflowStages.map((stg, i) => (
            <div
              key={stg.name}
              onClick={() => onNavigate(stg.module)}
              className="p-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer transition-all duration-150 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 mb-1">
                  <span>#{i + 1}</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:text-red-600 transition-colors" />
                </div>
                <div className="text-xs font-bold text-neutral-900 group-hover:text-red-600 transition-colors leading-tight mb-2">
                  {stg.name}
                </div>
              </div>

              <div className="space-y-1 text-[11px] pt-1.5 border-t border-neutral-200/80">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total:</span>
                  <strong className="font-bold text-neutral-800 tabular-nums">{stg.total}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending:</span>
                  <strong className={`tabular-nums ${stg.pending > 0 ? 'text-amber-600 font-bold' : 'text-neutral-600'}`}>
                    {stg.pending}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Done:</span>
                  <strong className="text-emerald-700 font-bold tabular-nums">{stg.completed}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Grid: Today's Operations Counter + Live Job Status + Machine/Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: TODAY'S PRODUCTION & FLOOR SNAPSHOT */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-red-600" /> Today's Operations Status
            </h3>
            <button
              onClick={() => onNavigate('jobcards')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">New Enquiries Today</span>
              <strong className="font-bold text-neutral-900 tabular-nums">{enquiries.length}</strong>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Quotations Sent</span>
              <strong className="font-bold text-neutral-900 tabular-nums">{quotations.length}</strong>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Confirmed Sales Orders</span>
              <strong className="font-bold text-emerald-700 tabular-nums">{salesOrders.length}</strong>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Production Jobs In Progress</span>
              <strong className="font-bold text-amber-700 tabular-nums">{inProductionJobs.length}</strong>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Pending Dispatches</span>
              <strong className="font-bold text-neutral-900 tabular-nums">{pendingDispatches.length}</strong>
            </div>

            <div className="p-2.5 bg-neutral-50 rounded-lg flex items-center justify-between text-xs">
              <span className="text-neutral-600 font-medium">Machine Downtime Today</span>
              <strong className={`tabular-nums font-bold ${machinesBreakdown.length > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {machinesBreakdown.length > 0 ? `${machinesBreakdown.length} Machines Alert` : '0 hr (All Nominal)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Col 2: Active Job Cards in Production */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" /> Active Job Cards on Floor
            </h3>
            <button
              onClick={() => onNavigate('production')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Floor Plan <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {jobCards.slice(0, 3).map((jc) => (
              <div
                key={jc.id}
                onClick={() => onNavigate('jobcards')}
                className="p-3 border border-neutral-200 rounded-lg hover:border-neutral-400 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-600">{jc.jobCardNo}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                    {jc.currentStage}
                  </span>
                </div>
                <div className="font-bold text-xs text-neutral-900 truncate">{jc.partyName}</div>
                <div className="text-[11px] text-neutral-500 truncate mt-0.5">{jc.itemName}</div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600 pt-1.5 border-t border-neutral-100">
                  <span>Target: <strong>{jc.requiredQty} NOS</strong></span>
                  <span>Board: <strong>{jc.boardSize}</strong></span>
                  <span>Due: <strong>{jc.deliveryDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Low Stock & Reorder Requirements */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Reorder & Shortage Warnings
            </h3>
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Full Inventory <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500 bg-neutral-50 rounded-lg">
                All board sizes maintain healthy inventory above reorder level.
              </div>
            ) : (
              lowStockItems.slice(0, 3).map((stk) => (
                <div
                  key={stk.id}
                  className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-rose-950 flex items-center gap-1.5">
                      <span>Size: {stk.boardSize}</span>
                      <span className="text-[10px] px-1 bg-rose-200 text-rose-800 rounded font-semibold">
                        {stk.gsm} GSM
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-700 mt-0.5">
                      Available: <strong>{stk.availableQty} sheets</strong> (Min: {stk.minStock})
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('purchasing')}
                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold whitespace-nowrap"
                  >
                    Create PO
                  </button>
                </div>
              ))
            )}

            {/* Quick Summary Bar */}
            <div className="pt-2 text-xs text-neutral-600 flex justify-between border-t border-neutral-100">
              <span>Payables Pending:</span>
              <strong className="text-neutral-900 tabular-nums">₹{totalPayables.toLocaleString('en-IN')}</strong>
            </div>
            <div className="text-xs text-neutral-600 flex justify-between">
              <span>Staff on Duty:</span>
              <strong className="text-emerald-700 font-bold tabular-nums">6 / 6 Present</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
