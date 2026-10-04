import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useErp } from '../../context/ErpDataContext';
import { Customer } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Building,
  Lock,
} from 'lucide-react';

export const CustomerModule: React.FC = () => {
  const { role } = useAuth();
  const isGuest = role === 'VIEW ONLY';
  const { customers, quotations, salesOrders, invoices, payments, addCustomer, updateCustomer } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newCustomerData, setNewCustomerData] = useState({
    customerId: `DP-CUST-${(customers.length + 1).toString().padStart(3, '0')}`,
    customerName: '',
    companyName: '',
    contactPerson: '',
    mobile: '+91 ',
    whatsapp: '+91 ',
    email: '',
    billingAddress: '',
    deliveryAddress: '',
    gstin: '32',
    state: 'Kerala',
    district: 'Malappuram',
    paymentTerms: '30 Days Credit',
    creditLimit: 200000,
    openingBalance: 0,
    status: 'ACTIVE' as const,
    notes: '',
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Customer transactions history
  const customerQuotes = quotations.filter((q) => q.customerId === activeCustomer?.id);
  const customerOrders = salesOrders.filter((s) => s.customerId === activeCustomer?.id);
  const customerInvoices = invoices.filter((i) => i.customerId === activeCustomer?.id);
  const customerPayments = payments.filter((p) => p.customerId === activeCustomer?.id);

  const totalBilled = customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = customerInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const currentOutstanding = activeCustomer?.openingBalance || 0;

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.customerName) return;
    const newId = await addCustomer(newCustomerData);
    setSelectedCustomerId(newId);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Customer Master & 360° Account Profile
          </h2>
          <p className="text-xs text-neutral-500">
            Client accounts, GST details, payment terms, and complete cross-module transaction histories
          </p>
        </div>

        <button
          onClick={() => {
            if (isGuest) {
              alert('Action locked: Adding customers is disabled in Guest (View Only) mode.');
              return;
            }
            setShowAddModal(true);
          }}
          disabled={isGuest}
          className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs ${
            isGuest
              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isGuest ? 'Locked in Guest Mode' : 'Add New Customer'}
        >
          {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4" />}
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Main Grid: Customer Directory List on Left, 360 Profile on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Customer Directory List */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden flex flex-col max-h-[750px]">
          <div className="p-3 border-b border-neutral-200 bg-neutral-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search customers, company, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:border-red-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-neutral-100">
            {filteredCustomers.map((cust) => {
              const isSelected = cust.id === activeCustomer?.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-red-50/50 border-l-4 border-l-red-600' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-neutral-900 truncate">
                      {cust.customerName}
                    </span>
                    <StatusBadge status={cust.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                    <Building className="w-3 h-3 text-neutral-400" />
                    {cust.companyName}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-600">
                    <span>Outstanding: <strong className="text-neutral-900">₹{cust.openingBalance.toLocaleString('en-IN')}</strong></span>
                    <span className="text-[10px] text-neutral-400">{cust.district}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer 360° Profile Details */}
        {activeCustomer && (
          <div className="lg:col-span-8 space-y-4">
            {/* Account Card */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-neutral-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {activeCustomer.customerId}
                    </span>
                    <StatusBadge status={activeCustomer.status} size="sm" />
                  </div>
                  <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                    {activeCustomer.customerName}
                  </h3>
                  <p className="text-xs text-neutral-600">{activeCustomer.companyName}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Outstanding Balance
                  </span>
                  <div className="text-2xl font-black text-rose-600 tabular-nums">
                    ₹{currentOutstanding.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Credit Limit: ₹{activeCustomer.creditLimit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                    Contact Person
                  </span>
                  <div className="font-bold text-neutral-900">{activeCustomer.contactPerson}</div>
                  <div className="flex items-center gap-1.5 text-neutral-600 mt-1">
                    <Phone className="w-3 h-3 text-neutral-400" /> {activeCustomer.mobile}
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-600 mt-0.5">
                    <Mail className="w-3 h-3 text-neutral-400" /> {activeCustomer.email}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                    Statutory & Payment Terms
                  </span>
                  <div>
                    GSTIN: <strong className="font-bold text-neutral-900">{activeCustomer.gstin}</strong>
                  </div>
                  <div className="mt-1">
                    Terms: <strong className="font-semibold text-neutral-800">{activeCustomer.paymentTerms}</strong>
                  </div>
                  <div className="mt-1 text-neutral-600">
                    Location: {activeCustomer.district}, {activeCustomer.state}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] block mb-1">
                    Delivery Address
                  </span>
                  <div className="text-neutral-700 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 inline mr-1 text-neutral-400" />
                    {activeCustomer.deliveryAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Ledger & 360 Transactions */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-red-600" /> Customer Transaction History
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-center text-xs">
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Quotations</span>
                  <strong className="text-base font-bold text-neutral-900">{customerQuotes.length}</strong>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Sales Orders</span>
                  <strong className="text-base font-bold text-neutral-900">{customerOrders.length}</strong>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Total Invoiced</span>
                  <strong className="text-base font-bold text-neutral-900">₹{totalBilled.toLocaleString('en-IN')}</strong>
                </div>
                <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Total Payments Received</span>
                  <strong className="text-base font-bold text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Invoices List */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                <div className="bg-neutral-100 p-2 font-bold text-neutral-700 border-b border-neutral-200 flex justify-between">
                  <span>Customer Invoices</span>
                  <span>Balance Pending</span>
                </div>
                <div className="divide-y divide-neutral-200">
                  {customerInvoices.length === 0 ? (
                    <div className="p-3 text-center text-neutral-500 text-xs">No invoices yet.</div>
                  ) : (
                    customerInvoices.map((inv) => (
                      <div key={inv.id} className="p-2.5 flex items-center justify-between hover:bg-neutral-50">
                        <div>
                          <div className="font-bold text-neutral-900">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-neutral-500">Date: {inv.date} · Due: {inv.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-neutral-900">₹{inv.totalAmount.toLocaleString('en-IN')}</div>
                          <div className="text-[11px] text-rose-600 font-semibold">
                            Balance: ₹{inv.balanceAmount.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-300 p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Create Customer Master Record</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter customer business credentials, GST details and credit limits.
            </p>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Customer / Party Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LEEMMAK / JAMSHER BAI"
                    value={newCustomerData.customerName}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, customerName: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Company Trade Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Leemmak Agro Products"
                    value={newCustomerData.companyName}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, companyName: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newCustomerData.contactPerson}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, contactPerson: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    value={newCustomerData.mobile}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, mobile: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={newCustomerData.gstin}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, gstin: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold uppercase focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">District</label>
                  <input
                    type="text"
                    value={newCustomerData.district}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, district: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={newCustomerData.paymentTerms}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, paymentTerms: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Billing Address</label>
                  <textarea
                    rows={2}
                    value={newCustomerData.billingAddress}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, billingAddress: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Delivery Address</label>
                  <textarea
                    rows={2}
                    value={newCustomerData.deliveryAddress}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, deliveryAddress: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
