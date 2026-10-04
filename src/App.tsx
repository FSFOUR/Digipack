import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErpDataProvider } from './context/ErpDataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickActionDrawer } from './components/layout/QuickActionDrawer';
import { UserApprovalModal } from './components/admin/UserApprovalModal';
import { AuthModal } from './components/auth/AuthModal';
import { ArrowDown, ArrowUp } from 'lucide-react';

// Modules
import { MisDashboard } from './components/dashboard/MisDashboard';
import { CustomerModule } from './components/customers/CustomerModule';
import { EnquiryModule } from './components/enquiry/EnquiryModule';
import { QuotationModule } from './components/quotation/QuotationModule';
import { SizeVisualizer2D } from './components/stock/SizeVisualizer2D';
import { SalesOrderModule } from './components/sales/SalesOrderModule';
import { StockModule } from './components/stock/StockModule';
import { MaterialRequirementModule } from './components/material/MaterialRequirementModule';
import { PurchaseModule } from './components/purchase/PurchaseModule';
import { JobCardModule } from './components/jobcard/JobCardModule';
import { ProductionModule } from './components/production/ProductionModule';
import { QcModule } from './components/qc/QcModule';
import { DispatchModule } from './components/dispatch/DispatchModule';
import { DocumentsModule } from './components/documents/DocumentsModule';
import { InvoiceModule } from './components/accounts/InvoiceModule';
import { PaymentModule } from './components/accounts/PaymentModule';
import { ProfitabilityModule } from './components/profitability/ProfitabilityModule';
import { HrModule } from './components/hr/HrModule';
import { MachineModule } from './components/machines/MachineModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuditLogView } from './components/admin/AuditLogView';
import { PasswordSecurityPage } from './components/auth/PasswordSecurityPage';

const MainAppContent: React.FC = () => {
  const { profile, role, isApproved } = useAuth();

  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Stable open by default for laptops and tablets
    }
    return true;
  });
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [userApprovalOpen, setUserApprovalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const el = mainScrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 100;
    const isNearTop = el.scrollTop < 120;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 100;

    setShowScrollBottom(isScrollable && !isNearBottom);
    setShowScrollTop(isScrollable && !isNearTop);
  }, []);

  useEffect(() => {
    const el = mainScrollRef.current;
    if (!el) return;

    // Reset scroll when active module changes
    el.scrollTo({ top: 0, behavior: 'instant' });

    const timeout = setTimeout(checkScrollPosition, 200);
    el.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      clearTimeout(timeout);
      el.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, [activeModule, checkScrollPosition]);

  const scrollToBottom = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const scrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Quick Action routing
  const handleQuickAction = (actionKey: string) => {
    if (actionKey === 'new-enquiry') setActiveModule('enquiries');
    else if (actionKey === 'new-quotation') setActiveModule('quotations');
    else if (actionKey === 'visualizer') setActiveModule('visualizer');
    else if (actionKey === 'new-order') setActiveModule('orders');
    else if (actionKey === 'new-jobcard') setActiveModule('jobcards');
    else if (actionKey === 'production') setActiveModule('production');
    else if (actionKey === 'stock-in' || actionKey === 'stock-out') setActiveModule('stock');
    else if (actionKey === 'dispatch') setActiveModule('dispatch');
    else if (actionKey === 'documents') setActiveModule('documents');
    else if (actionKey === 'invoice') setActiveModule('invoices');
    else if (actionKey === 'payment') setActiveModule('payments');
  };

  return (
    <div className="h-screen bg-neutral-100 flex font-sans text-neutral-900 antialiased selection:bg-red-600 selection:text-white overflow-hidden pb-16 lg:pb-0">
      {/* Backdrop when menu bar is open (Mobile only) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Main Menu Bar (Sidebar - Stable on Laptops & Tablets) */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          // Only close drawer on mobile screens; keep stable on laptops and tablets!
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        onClose={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setSidebarOpen(false);
          }
        }}
      />

      {/* Main Workspace: Top Bar + Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Navbar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
          onOpenQuickAction={() => setQuickActionOpen(true)}
          onOpenUserApproval={() => setUserApprovalOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Full-width scrollable viewport with always-visible right-side scrollbar */}
        <div
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden custom-app-scrollbar bg-neutral-100 relative flex flex-col"
        >
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {activeModule === 'dashboard' && <MisDashboard onNavigate={setActiveModule} />}
            {activeModule === 'customers' && <CustomerModule />}
            {activeModule === 'enquiries' && (
              <EnquiryModule onNavigateToQuotation={() => setActiveModule('quotations')} />
            )}
            {activeModule === 'quotations' && (
              <QuotationModule onNavigateToOrders={() => setActiveModule('orders')} />
            )}
            {activeModule === 'visualizer' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-200">
                  <h2 className="text-base font-black text-neutral-900">
                    Duplex Board 2D Cutting Visualizer & Stock Search
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Search complete factory stock, rank top 5 zero-wastage orientations, and reserve sheets.
                  </p>
                </div>
                <SizeVisualizer2D />
              </div>
            )}
            {activeModule === 'orders' && (
              <SalesOrderModule onNavigateToJobCards={() => setActiveModule('jobcards')} />
            )}
            {activeModule === 'stock' && <StockModule />}
            {activeModule === 'material' && (
              <MaterialRequirementModule
                onNavigateToPurchasing={() => setActiveModule('purchasing')}
              />
            )}
            {activeModule === 'purchasing' && <PurchaseModule />}
            {activeModule === 'jobcards' && (
              <JobCardModule onNavigateToProduction={() => setActiveModule('production')} />
            )}
            {activeModule === 'production' && <ProductionModule />}
            {activeModule === 'qc' && <QcModule />}
            {activeModule === 'finishedgoods' && <DispatchModule />}
            {activeModule === 'dispatch' && <DispatchModule />}
            {activeModule === 'documents' && <DocumentsModule />}
            {activeModule === 'invoices' && <InvoiceModule />}
            {activeModule === 'payments' && <PaymentModule />}
            {activeModule === 'profitability' && <ProfitabilityModule />}
            {activeModule === 'hr' && <HrModule />}
            {activeModule === 'machines' && <MachineModule />}
            {activeModule === 'reports' && <ReportsModule />}
            {activeModule === 'admin' && <AdminDashboard onNavigate={setActiveModule} />}
            {activeModule === 'audit' && <AuditLogView />}
            {(activeModule === 'password-reset' || activeModule === 'security') && (
              <PasswordSecurityPage onNavigate={setActiveModule} />
            )}
          </main>
        </div>

        {/* Right-Side Floating Scroll Navigation Controls */}
        <div className="fixed right-4 bottom-20 lg:bottom-6 z-40 flex flex-col gap-2 pointer-events-none">
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              title="Scroll to Top"
              className="pointer-events-auto p-2.5 bg-neutral-900/90 hover:bg-neutral-900 text-white rounded-full shadow-lg border border-neutral-700/80 transition-all hover:scale-110 active:scale-95 flex items-center justify-center backdrop-blur-xs group"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          )}

          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              title="Scroll to Bottom"
              className="pointer-events-auto p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg border border-red-500/80 transition-all hover:scale-110 active:scale-95 flex items-center justify-center backdrop-blur-xs group"
            >
              <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileNav
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        isOpenMenu={sidebarOpen}
        onOpenHomeMenu={() => setSidebarOpen((prev) => !prev)}
        onOpenQuickActions={() => setQuickActionOpen(true)}
        onOpenFullMenu={() => setSidebarOpen(true)}
      />

      {/* Quick Action Drawer */}
      <QuickActionDrawer
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSelectAction={handleQuickAction}
      />

      {/* User Approval Modal for Manager */}
      <UserApprovalModal
        isOpen={userApprovalOpen}
        onClose={() => setUserApprovalOpen(false)}
      />

      {/* Staff Auth / Login Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ErpDataProvider>
        <MainAppContent />
      </ErpDataProvider>
    </AuthProvider>
  );
}
