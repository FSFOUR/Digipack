import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  FileText,
  ClipboardList,
  Home,
} from 'lucide-react';

interface MobileNavProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  isOpenMenu?: boolean;
  onOpenHomeMenu?: () => void;
  onOpenQuickActions?: () => void;
  onOpenFullMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeModule,
  onSelectModule,
  isOpenMenu,
  onOpenHomeMenu,
  onOpenFullMenu,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-800 px-4 py-1.5 flex items-center justify-center text-neutral-400">
      <div className="w-full max-w-sm flex items-center justify-around">
        <button
          onClick={() => onSelectModule('dashboard')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
            activeModule === 'dashboard' ? 'text-red-500 font-bold' : 'hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>MIS</span>
        </button>

        <button
          onClick={() => onSelectModule('quotations')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
            activeModule === 'quotations' ? 'text-red-500 font-bold' : 'hover:text-white'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Quotes</span>
        </button>

        {/* Center Home button - tap to show main menu bar */}
        <button
          onClick={() => {
            if (onOpenHomeMenu) {
              onOpenHomeMenu();
            } else if (onOpenFullMenu) {
              onOpenFullMenu();
            } else {
              onSelectModule('dashboard');
            }
          }}
          className={`flex flex-col items-center justify-center -mt-4 w-12 h-12 rounded-full bg-red-600 text-white shadow-lg shadow-red-900/50 hover:bg-red-700 active:scale-95 transition-all ${
            isOpenMenu ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-black scale-105' : ''
          }`}
          title="Home - Show Main Menu Bar"
        >
          <Home className="w-6 h-6" />
        </button>

        <button
          onClick={() => onSelectModule('stock')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
            activeModule === 'stock' || activeModule === 'visualizer'
              ? 'text-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Stock</span>
        </button>

        <button
          onClick={() => onSelectModule('jobcards')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] font-medium transition-colors ${
            activeModule === 'jobcards' || activeModule === 'production'
              ? 'text-red-500 font-bold'
              : 'hover:text-white'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Jobs</span>
        </button>
      </div>
    </nav>
  );
};
