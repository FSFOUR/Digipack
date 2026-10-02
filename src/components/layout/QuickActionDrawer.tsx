import React from 'react';
import {
  FileQuestion,
  FileText,
  Sparkles,
  ShoppingCart,
  ClipboardList,
  Cpu,
  ArrowDownToLine,
  ArrowUpFromLine,
  Navigation,
  Receipt,
  CreditCard,
  X,
} from 'lucide-react';

interface QuickActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionKey: string) => void;
}

export const QuickActionDrawer: React.FC<QuickActionDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    { key: 'new-enquiry', label: 'New Customer Enquiry', icon: FileQuestion, color: 'text-blue-500' },
    { key: 'new-quotation', label: 'New Quotation', icon: FileText, color: 'text-red-500' },
    { key: 'visualizer', label: 'Check Stock (2D Visualizer)', icon: Sparkles, color: 'text-amber-500' },
    { key: 'new-order', label: 'New Sales Order', icon: ShoppingCart, color: 'text-emerald-500' },
    { key: 'new-jobcard', label: 'Create Job Card', icon: ClipboardList, color: 'text-purple-500' },
    { key: 'production', label: 'Production Update', icon: Cpu, color: 'text-orange-500' },
    { key: 'stock-in', label: 'Stock IN (Receive Board)', icon: ArrowDownToLine, color: 'text-teal-500' },
    { key: 'stock-out', label: 'Stock OUT (Issue Board)', icon: ArrowUpFromLine, color: 'text-rose-500' },
    { key: 'dispatch', label: 'New Dispatch Challan', icon: Navigation, color: 'text-indigo-500' },
    { key: 'invoice', label: 'Create Invoice', icon: Receipt, color: 'text-cyan-500' },
    { key: 'payment', label: 'Record Customer Payment', icon: CreditCard, color: 'text-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-5 text-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full"></span>
              DIGI PACK Quick Actions
            </h3>
            <p className="text-xs text-neutral-400">One-tap manufacturing workflow actions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.key}
                onClick={() => {
                  onSelectAction(act.key);
                  onClose();
                }}
                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 transition-colors text-left group"
              >
                <div className={`p-2 rounded bg-neutral-900 group-hover:scale-105 transition-transform ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-neutral-200 group-hover:text-white">
                  {act.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
