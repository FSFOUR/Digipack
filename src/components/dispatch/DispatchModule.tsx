import React, { useState } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { useAuth } from '../../context/AuthContext';
import { DispatchRecord, FinishedGoodsItem } from '../../types/erp';
import { StatusBadge } from '../common/StatusBadge';
import {
  Navigation,
  PackageCheck,
  Plus,
  Truck,
  CheckCircle2,
  FileCheck,
  MapPin,
  Phone,
  User,
  Lock,
} from 'lucide-react';

export const DispatchModule: React.FC = () => {
  const {
    finishedGoods,
    dispatches,
    customers,
    salesOrders,
    jobCards,
    createDispatch,
    updateDispatchStatus,
  } = useErp();
  const { profile, role } = useAuth();
  const isGuest = role === 'VIEW ONLY';

  const [activeTab, setActiveTab] = useState<'DISPATCHES' | 'FINISHED_GOODS'>('DISPATCHES');
  const [showAddModal, setShowAddModal] = useState(false);
  const [podModalRecord, setPodModalRecord] = useState<DispatchRecord | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerId: customers[0]?.id || '',
    customerName: customers[0]?.customerName || 'LEEMMAK / JAMSHER BAI',
    salesOrderId: salesOrders[0]?.id || '',
    soNumber: salesOrders[0]?.soNumber || 'DP-SO-2026-0001',
    jobCardNo: jobCards[0]?.jobCardNo || 'DP-JC-2026-0001',
    product: 'LM 104×100 NOS – 69×39×17.5 CMOD 5PLY – Golden Shade',
    quantity: 200,
    vehicleNo: 'KL 10 AV 4421 (Tata 407)',
    driverName: 'Musthafa K.',
    driverPhone: '+91 9847 443 322',
    deliveryAddress: 'Warehouse Unit 4, Kakkanchery, Malappuram, Kerala - 673634',
    status: 'READY' as const,
    dispatchStaff: profile?.fullName || 'Shafi',
  });

  const [podNotes, setPodNotes] = useState('');
  const [signatureName, setSignatureName] = useState('');

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDispatch(formData);
      setShowAddModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error in Dispatch');
    }
  };

  const handleSavePod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podModalRecord) return;
    await updateDispatchStatus(podModalRecord.id, 'POD_RECEIVED', podNotes, signatureName);
    setPodModalRecord(null);
    setPodNotes('');
    setSignatureName('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-red-600" />
            Finished Goods Warehouse & Dispatch / Delivery
          </h2>
          <p className="text-xs text-neutral-500">
            Finished Goods Stock · Vehicle Tracking · Delivery Challan & Proof of Delivery (POD)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('DISPATCHES')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'DISPATCHES' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Dispatches ({dispatches.length})
            </button>
            <button
              onClick={() => setActiveTab('FINISHED_GOODS')}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                activeTab === 'FINISHED_GOODS' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Finished Goods ({finishedGoods.length})
            </button>
          </div>

          <button
            onClick={() => {
              if (isGuest) {
                alert('Action locked: Creating dispatch challans is disabled in Guest (View Only) mode.');
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
            title={isGuest ? 'Locked in Guest Mode' : 'New Dispatch Challan'}
          >
            {isGuest ? <Lock className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4" />}
            <span>New Dispatch Challan</span>
          </button>
        </div>
      </div>

      {/* Dispatches List */}
      {activeTab === 'DISPATCHES' && (
        <>
          {/* MOBILE VIEW: Cards without horizontal side scrolling */}
          <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
            {dispatches.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
                No dispatch records found.
              </div>
            ) : (
              dispatches.map((d) => (
                <div
                  key={`mob-dis-${d.id}`}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  {/* Header: Dispatch No, Date, Status */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <span className="font-black text-sm text-red-600 block">{d.dispatchNo}</span>
                      <span className="text-[10px] text-neutral-400 font-medium">{d.date}</span>
                    </div>
                    <StatusBadge status={d.status} size="sm" />
                  </div>

                  {/* Customer, SO, Job & Product */}
                  <div>
                    <div className="font-bold text-xs text-neutral-900">{d.customerName}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      SO: <span className="font-semibold text-neutral-700">{d.soNumber}</span> · Job: <span className="font-semibold text-neutral-700">{d.jobCardNo}</span>
                    </div>
                    <div className="text-xs font-semibold text-neutral-800 mt-1">{d.product}</div>
                  </div>

                  {/* Qty, Vehicle & Driver */}
                  <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Quantity</span>
                      <span className="font-black text-sm text-neutral-900 tabular-nums">
                        {d.quantity.toLocaleString()} <span className="text-[10px] font-normal text-neutral-500">NOS</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Vehicle</span>
                      <span className="font-bold text-neutral-800 text-[11px] block truncate">{d.vehicleNo}</span>
                      <span className="text-[10px] text-neutral-500 block truncate">{d.driverName}</span>
                    </div>
                    {d.deliveryAddress && (
                      <div className="col-span-2 pt-1 border-t border-neutral-200/50">
                        <span className="text-[10px] font-bold uppercase text-neutral-500 block">Destination</span>
                        <span className="text-[11px] text-neutral-600 line-clamp-1">{d.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-100">
                    {d.status !== 'POD_RECEIVED' && d.status !== 'DELIVERED' ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => {
                            if (isGuest) {
                              alert('Action locked in Guest (View Only) mode.');
                              return;
                            }
                            updateDispatchStatus(d.id, 'DISPATCHED');
                          }}
                          disabled={isGuest}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 ${
                            isGuest
                              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          {isGuest && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                          <span>Mark Out</span>
                        </button>
                        <button
                          onClick={() => {
                            if (isGuest) {
                              alert('Action locked in Guest (View Only) mode.');
                              return;
                            }
                            setPodModalRecord(d);
                          }}
                          disabled={isGuest}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 ${
                            isGuest
                              ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isGuest && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                          <span>Record POD</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 py-1">
                        <CheckCircle2 className="w-4 h-4" /> POD Verified
                      </span>
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
                    <th className="p-3">Dispatch No.</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer & SO</th>
                    <th className="p-3">Product Description</th>
                    <th className="p-3 text-right">Qty (NOS)</th>
                    <th className="p-3">Vehicle & Driver</th>
                    <th className="p-3">Delivery Address</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {dispatches.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-black text-sm text-red-600">{d.dispatchNo}</td>
                      <td className="p-3 font-medium text-neutral-600">{d.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{d.customerName}</div>
                        <div className="text-[11px] text-neutral-500">SO: {d.soNumber} · Job: {d.jobCardNo}</div>
                      </td>
                      <td className="p-3 font-medium text-neutral-800 truncate max-w-xs">{d.product}</td>
                      <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                        {d.quantity.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-neutral-900">{d.vehicleNo}</div>
                        <div className="text-[11px] text-neutral-500">{d.driverName} ({d.driverPhone})</div>
                      </td>
                      <td className="p-3 text-[11px] text-neutral-600 truncate max-w-xs">
                        {d.deliveryAddress}
                      </td>
                      <td className="p-3">
                        <StatusBadge status={d.status} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        {d.status !== 'POD_RECEIVED' && d.status !== 'DELIVERED' ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                if (isGuest) {
                                  alert('Action locked in Guest (View Only) mode.');
                                  return;
                                }
                                updateDispatchStatus(d.id, 'DISPATCHED');
                              }}
                              disabled={isGuest}
                              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                                isGuest
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                            >
                              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
                              <span>Mark Out</span>
                            </button>
                            <button
                              onClick={() => {
                                if (isGuest) {
                                  alert('Action locked in Guest (View Only) mode.');
                                  return;
                                }
                                setPodModalRecord(d);
                              }}
                              disabled={isGuest}
                              className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                                isGuest
                                  ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isGuest && <Lock className="w-3 h-3 text-amber-600" />}
                              <span>Record POD</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> POD Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Finished Goods Inventory Tab */}
      {activeTab === 'FINISHED_GOODS' && (
        <>
          {/* MOBILE VIEW: Finished Goods Cards without side scrolling */}
          <div className="block lg:hidden space-y-3 w-full max-w-full overflow-hidden">
            {finishedGoods.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-neutral-200 text-neutral-400 font-medium text-xs">
                No finished goods in stock.
              </div>
            ) : (
              finishedGoods.map((fg) => (
                <div
                  key={`mob-fg-${fg.id}`}
                  className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs space-y-3"
                >
                  {/* Header: FG Lot ID, Job Card, Status */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-100">
                    <div>
                      <span className="font-bold text-xs text-neutral-900 block">{fg.fgId}</span>
                      <span className="text-[10px] text-red-600 font-bold">Job: {fg.jobCardNo}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded font-semibold text-[10px] text-neutral-700">
                        {fg.storageLocation}
                      </span>
                      <StatusBadge status={fg.dispatchStatus} size="sm" />
                    </div>
                  </div>

                  {/* Customer & Product */}
                  <div>
                    <div className="font-bold text-xs text-neutral-900">{fg.customerName}</div>
                    <div className="text-xs font-semibold text-neutral-800 mt-1">{fg.product}</div>
                  </div>

                  {/* Quantities 3-Column Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">QC Approved</span>
                      <span className="font-bold text-neutral-800 tabular-nums">{fg.quantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-neutral-500 block">Dispatched</span>
                      <span className="font-medium text-neutral-600 tabular-nums">{fg.dispatchedQty}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 block">Available</span>
                      <span className="font-black text-sm text-emerald-700 tabular-nums">{fg.availableQty}</span>
                    </div>
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
                    <th className="p-3">FG Lot ID</th>
                    <th className="p-3">Job Card</th>
                    <th className="p-3">Customer / Party Name</th>
                    <th className="p-3">Product Description</th>
                    <th className="p-3 text-right">Total QC Approved</th>
                    <th className="p-3 text-right">Dispatched Qty</th>
                    <th className="p-3 text-right">Available in FG</th>
                    <th className="p-3">Storage Location</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {finishedGoods.map((fg) => (
                    <tr key={fg.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-3 font-bold text-neutral-900">{fg.fgId}</td>
                      <td className="p-3 font-bold text-red-600">{fg.jobCardNo}</td>
                      <td className="p-3 font-bold text-neutral-900">{fg.customerName}</td>
                      <td className="p-3 font-medium text-neutral-800">{fg.product}</td>
                      <td className="p-3 text-right font-medium tabular-nums">{fg.quantity}</td>
                      <td className="p-3 text-right font-medium tabular-nums text-neutral-600">
                        {fg.dispatchedQty}
                      </td>
                      <td className="p-3 text-right font-black tabular-nums text-sm text-emerald-700">
                        {fg.availableQty}
                      </td>
                      <td className="p-3 font-semibold text-neutral-700">{fg.storageLocation}</td>
                      <td className="p-3">
                        <StatusBadge status={fg.dispatchStatus} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* New Dispatch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-neutral-300 p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <Truck className="w-5 h-5 text-red-600" />
              Generate Dispatch Challan & Vehicle Note
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Connects to Customer, Job Card, and checks Finished Goods availability.
            </p>

            <form onSubmit={handleCreateDispatch} className="space-y-3 text-xs">
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
                        deliveryAddress: cust?.deliveryAddress || formData.deliveryAddress,
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
                  <label className="block font-bold text-neutral-700 mb-1">Job Card Reference</label>
                  <select
                    value={formData.jobCardNo}
                    onChange={(e) => {
                      const jc = jobCards.find((j) => j.jobCardNo === e.target.value);
                      setFormData({
                        ...formData,
                        jobCardNo: e.target.value,
                        product: jc?.itemName || formData.product,
                        quantity: jc?.producedQty || jc?.requiredQty || 200,
                      });
                    }}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                  >
                    {jobCards.map((j) => (
                      <option key={j.id} value={j.jobCardNo}>
                        {j.jobCardNo} — {j.partyName.slice(0, 16)} ({j.producedQty} pcs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Product Description</label>
                <input
                  type="text"
                  required
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Quantity to Dispatch (NOS)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-bold text-sm focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded font-semibold text-xs focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Vehicle No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KL 10 AV 4421"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold uppercase focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Driver Mobile</label>
                  <input
                    type="text"
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs font-semibold focus:border-red-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Destination / Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
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
                  Confirm Dispatch Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proof of Delivery (POD) Modal */}
      {podModalRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-300 p-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2 mb-1">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              Proof of Delivery (POD) Receipt
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Dispatch No: {podModalRecord.dispatchNo} · {podModalRecord.customerName}
            </p>

            <form onSubmit={handleSavePod} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Received by Customer Signature / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jamsher Bai (Store Manager)"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-sm font-semibold focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Delivery Notes / Condition</label>
                <textarea
                  rows={2}
                  placeholder="e.g. All 200 boxes verified undamaged. Stamped delivery copy received."
                  value={podNotes}
                  onChange={(e) => setPodNotes(e.target.value)}
                  className="w-full p-2 bg-neutral-50 border border-neutral-300 rounded text-xs focus:border-red-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setPodModalRecord(null)}
                  className="px-3 py-1.5 rounded text-neutral-600 hover:bg-neutral-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold uppercase tracking-wider"
                >
                  Record Verified Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
