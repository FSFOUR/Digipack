import React, { useMemo } from 'react';
import { useErp } from '../../context/ErpDataContext';
import { OrderProfitability } from '../../types/erp';
import {
  TrendingUp,
  Percent,
  CircleDollarSign,
  PieChart,
  BarChart,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const ProfitabilityModule: React.FC = () => {
  const { jobCards, salesOrders, invoices } = useErp();

  // Compute order profitability for all active and completed job cards
  const profitabilityList: OrderProfitability[] = useMemo(() => {
    return jobCards.map((jc) => {
      const so = salesOrders.find((s) => s.jobCardNo === jc.jobCardNo || s.id === jc.salesOrderId);
      const inv = invoices.find((i) => i.jobCardNo === jc.jobCardNo);

      const qty = jc.producedQty || jc.requiredQty;
      const salesRevenue = inv?.subtotal || (so ? (so.subtotal / so.items.length) : qty * 81.0);

      // Detailed manufacturing cost breakdown for Duplex 5-Ply boxes
      const boardCost = Math.round(qty * 18.5 * 100) / 100;
      const printingCost = jc.print === 'YES' ? Math.round(qty * 4.5 * 100) / 100 : 0;
      const glueCost = Math.round(qty * 2.2 * 100) / 100;
      const stitchingWireCost = Math.round(qty * 1.8 * 100) / 100;
      const packingCost = Math.round(qty * 1.5 * 100) / 100;
      const labourCost = Math.round(qty * 6.0 * 100) / 100;
      const freightCost = 450;
      const otherExpenses = Math.round(qty * 1.0 * 100) / 100;

      const totalCost =
        boardCost +
        printingCost +
        glueCost +
        stitchingWireCost +
        packingCost +
        labourCost +
        freightCost +
        otherExpenses;

      const grossProfit = salesRevenue - totalCost;
      const profitMarginPercent =
        salesRevenue > 0 ? Math.round((grossProfit / salesRevenue) * 1000) / 10 : 0;

      return {
        jobCardNo: jc.jobCardNo,
        soNumber: jc.soNumber || 'SO-DIRECT',
        customerName: jc.partyName,
        product: jc.itemName,
        salesRevenue,
        boardCost,
        printingCost,
        glueCost,
        stitchingWireCost,
        packingCost,
        labourCost,
        freightCost,
        otherExpenses,
        totalCost,
        grossProfit,
        profitMarginPercent,
      };
    });
  }, [jobCards, salesOrders, invoices]);

  const totalRev = profitabilityList.reduce((sum, p) => sum + p.salesRevenue, 0);
  const totalCost = profitabilityList.reduce((sum, p) => sum + p.totalCost, 0);
  const totalProfit = totalRev - totalCost;
  const overallMargin = totalRev > 0 ? Math.round((totalProfit / totalRev) * 1000) / 10 : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Job Order Profitability & Cost Accounting
          </h2>
          <p className="text-xs text-neutral-500">
            Real-time Gross Profit Margin % per Job Card · Raw Materials + Processing + Overhead breakdown
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Sales Value (Revenue)
          </span>
          <div className="text-2xl font-black text-neutral-900 tabular-nums">
            ₹{totalRev.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Manufacturing Costs
          </span>
          <div className="text-2xl font-black text-neutral-900 tabular-nums">
            ₹{totalCost.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Net Gross Profit
          </span>
          <div className="text-2xl font-black text-emerald-700 tabular-nums">
            ₹{totalProfit.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
            Overall Profit Margin %
          </span>
          <div className="text-2xl font-black text-red-600 tabular-nums">
            {overallMargin}%
          </div>
        </div>
      </div>

      {/* Profitability Detail Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-neutral-900 text-white font-bold text-xs flex justify-between items-center">
          <span>Job Card Costing Analysis</span>
          <span className="text-[11px] text-neutral-400 font-normal">Board + Inks + Glue + Wire + Labour</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-100 font-bold text-neutral-700 border-b border-neutral-200 text-[11px] uppercase">
                <th className="p-3">Job Card</th>
                <th className="p-3">Customer & Product</th>
                <th className="p-3 text-right">Revenue (₹)</th>
                <th className="p-3 text-right">Board Cost</th>
                <th className="p-3 text-right">Print + Glue + Wire</th>
                <th className="p-3 text-right">Labour & Pkg</th>
                <th className="p-3 text-right">Total Cost</th>
                <th className="p-3 text-right">Gross Profit</th>
                <th className="p-3 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {profitabilityList.map((p) => {
                const isHealthy = p.profitMarginPercent >= 20;

                return (
                  <tr key={p.jobCardNo} className="hover:bg-neutral-50 transition-colors">
                    <td className="p-3 font-black text-sm text-red-600">{p.jobCardNo}</td>
                    <td className="p-3">
                      <div className="font-bold text-neutral-900">{p.customerName}</div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-xs">{p.product}</div>
                    </td>
                    <td className="p-3 text-right font-black tabular-nums text-neutral-900 text-sm">
                      ₹{p.salesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-medium tabular-nums text-neutral-700">
                      ₹{p.boardCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-medium tabular-nums text-neutral-700">
                      ₹{(p.printingCost + p.glueCost + p.stitchingWireCost).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-medium tabular-nums text-neutral-700">
                      ₹{(p.labourCost + p.packingCost).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-bold tabular-nums text-neutral-900">
                      ₹{p.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right font-black tabular-nums text-emerald-700 text-sm">
                      ₹{p.grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                          isHealthy
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.profitMarginPercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
