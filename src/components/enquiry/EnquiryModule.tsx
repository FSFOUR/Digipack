import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { CustomerEnquiry } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileQuestion,
  Plus,
  Phone,
  User,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface EnquiryModuleProps {
  onNavigateToQuotation?: () => void;
}

export const EnquiryModule: React.FC<EnquiryModuleProps> = ({ onNavigateToQuotation }) => {
  const { enquiries, customers, addEnquiry, updateEnquiryStatus } = useErp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.customerName || 'LEEMMAK / JAMSHER BAI',
    contactPerson: 'Jamsher Bai',
    mobile: '+91 9847 123 456',
    product: 'Duplex Master Box 5PLY',
    boxDescription: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
    requiredQuantity: 200,
    requiredSize: '69 x 39 x 17.5 cm',
    boardSpecification: 'Duplex 300 GSM Golden Shade',
    gsm: 300,
    creasing: 'NON-CREASING' as const,
    printingRequirement: 'YES' as const,
    folding: 'YES' as const,
    gluing: 'YES' as const,
    stitching: 'YES' as const,
    requiredDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    remarks: 'Customer requested samples of Golden Shade Duplex board.',
    assignedSalesPerson: 'Shafi',
    status: 'NEW' as const,
  });

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEnquiry(formData);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-red-600" />
            Customer Enquiries
          </h2>
          <p className="text-xs text-neutral-500">
            Lead capture · Box Specifications · Fast Quotation Conversion
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" /> New Customer Enquiry
        </button>
      </div>

      {/* Enquiry List */}
      {/* MOBILE VIEW: Cards without horizontal side scrolling */}
      <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
        {enquiries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
            No open enquiries recorded yet.
          </div>
        ) : (
          enquiries.map((enq) => (
            <div
              key={`mob-enq-${enq.id}`}
              className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
            >
              {/* Header: Enquiry No, Date, Status */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                <div>
                  <span className="font-black text-sm text-red-600 block">{enq.enquiryNo}</span>
                  <span className="text-[10px] text-neutral-400 font-medium">{enq.date} · Due: {enq.requiredDeliveryDate}</span>
                </div>
                <StatusBadge status={enq.status} size="sm" />
              </div>

              {/* Customer & Box Description */}
              <div>
                <div className="font-bold text-xs text-neutral-900">{enq.customerName}</div>
                <div className="text-[11px] text-neutral-500">{enq.contactPerson} ({enq.mobile})</div>
                <div className="text-xs font-semibold text-neutral-800 mt-1">{enq.boxDescription}</div>
              </div>

              {/* Specs & Required Qty */}
              <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Board Spec</span>
                  <span className="font-semibold text-neutral-800">{enq.boardSpecification}</span>
                  <div className="text-[10px] text-neutral-500">{enq.gsm} GSM · {enq.creasing}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-neutral-500 block">Required Qty</span>
                  <span className="font-black text-sm text-neutral-900 tabular-nums">
                    {enq.requiredQuantity.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                {onNavigateToQuotation && (
                  <button
                    onClick={onNavigateToQuotation}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 shadow-xs"
                  >
                    Quote <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-900 text-white font-bold tracking-wider uppercase text-[11px]">
                <th className="p-3">Enquiry No.</th>
                <th className="p-3">Date</th>
                <th className="p-3">Customer & Contact</th>
                <th className="p-3">Product Description</th>
                <th className="p-3 text-right">Required Qty</th>
                <th className="p-3">Board Spec & GSM</th>
                <th className="p-3">Required Delivery</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-neutral-500 text-xs">
                    No open enquiries recorded yet. Click "New Customer Enquiry" above.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-black text-sm text-red-600">{enq.enquiryNo}</td>
                    <td className="p-3 font-medium text-neutral-600">{enq.date}</td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{enq.customerName}</div>
                      <div className="text-[11px] text-neutral-500">{enq.contactPerson} ({enq.mobile})</div>
                    </td>
                    <td className="p-3 font-medium text-neutral-800 truncate max-w-xs">{enq.boxDescription}</td>
                    <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                      {enq.requiredQuantity.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{enq.boardSpecification}</div>
                      <div className="text-[11px] text-neutral-500">{enq.gsm} GSM · {enq.creasing}</div>
                    </td>
                    <td className="p-3 font-semibold text-neutral-800">{enq.requiredDeliveryDate}</td>
                    <td className="p-3">
                      <StatusBadge status={enq.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      {onNavigateToQuotation && (
                        <button
                          onClick={onNavigateToQuotation}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white rounded font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          Quote <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-300 p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 mb-1">New Customer Enquiry</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Record customer box specifications, required quantities and delivery deadlines.
            </p>

            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Customer / Party Name</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      const cust = customers.find((c) => c.id === e.target.value);
                      setFormData({
                        ...formData,
                        customerId: e.target.value,
                        customerName: cust?.customerName || '',
                        contactPerson: cust?.contactPerson || '',
                        mobile: cust?.mobile || '',
                      });
                    }}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Box Description & Shade</label>
                <textarea
                  rows={2}
                  required
                  value={formData.boxDescription}
                  onChange={(e) => setFormData({ ...formData, boxDescription: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Required Qty (NOS)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.requiredQuantity}
                    onChange={(e) => setFormData({ ...formData, requiredQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Required Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 69 x 39 x 17.5 cm"
                    value={formData.requiredSize}
                    onChange={(e) => setFormData({ ...formData, requiredSize: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Board GSM</label>
                  <select
                    value={formData.gsm}
                    onChange={(e) => setFormData({ ...formData, gsm: parseInt(e.target.value) || 300 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  >
                    <option value="250">250 GSM</option>
                    <option value="280">280 GSM</option>
                    <option value="300">300 GSM</option>
                    <option value="320">320 GSM</option>
                    <option value="350">350 GSM</option>
                    <option value="400">400 GSM</option>
                  </select>
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider shadow-xs"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
