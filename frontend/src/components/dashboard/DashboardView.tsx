import React, { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { DashboardData, Transaction } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { formatApiError } from '../../services/api';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  AlertTriangle,
  Receipt,
  RefreshCw,
  Clock,
  ArrowRight,
  Mic,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenVoice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenVoice }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return <LoadingSpinner message="Reading ledger values from FastAPI..." size="lg" />;
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage
          title="Could Not Load Dashboard"
          message={error}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  const totalSales = data?.total_sales ?? data?.summary?.total_sales ?? 0;
  const totalReceived = data?.total_received ?? data?.summary?.total_received ?? 0;
  const totalPaid = data?.total_paid ?? data?.summary?.total_paid ?? 0;
  const productCount = data?.product_count ?? data?.products_count ?? data?.summary?.product_count ?? 0;

  let lowStockCount = 0;
  if (typeof data?.low_stock_products === 'number') {
    lowStockCount = data.low_stock_products;
  } else if (Array.isArray(data?.low_stock_products)) {
    lowStockCount = data.low_stock_products.length;
  } else if (typeof data?.low_stock_count === 'number') {
    lowStockCount = data.low_stock_count;
  } else if (typeof data?.summary?.low_stock_products === 'number') {
    lowStockCount = data.summary.low_stock_products;
  }

  const recentTransactions: Transaction[] = data?.recent_transactions || [];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto text-[#2D2320]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-4 border-b border-[#EDE4D8]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Real-Time Accounting
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
            Bahi Khata Overview
          </h2>
          <p className="text-xs text-[#7A6963] mt-0.5">
            Synchronized directly with PostgreSQL ledger via FastAPI /dashboard
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center px-3.5 py-2 border border-[#DED4C7] bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#55433E] text-xs font-medium rounded-full shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#8C7A74]" />
            Refresh
          </button>
          <button
            onClick={onOpenVoice}
            className="inline-flex items-center px-4 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full shadow-xs transition"
          >
            <Mic className="w-3.5 h-3.5 mr-1.5" />
            Voice Entry
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Warm Stitch Aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales */}
        <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C7A74] mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A74]">Total Sales</span>
            <div className="w-7 h-7 rounded-full bg-[#F4ECE6] text-[#9E6056] flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-editorial text-3xl font-bold text-[#2D2320]">
            ₹{Number(totalSales).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#8C7A74] mt-1">Recorded gross sales</p>
        </div>

        {/* Total Received */}
        <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C7A74] mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#758670]">Total Received</span>
            <div className="w-7 h-7 rounded-full bg-[#EBF1E9] text-[#758670] flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-editorial text-3xl font-bold text-[#4B6344]">
            ₹{Number(totalReceived).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#758670] mt-1">Cash / UPI inflow</p>
        </div>

        {/* Total Paid */}
        <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C7A74] mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#88544B]">Total Paid</span>
            <div className="w-7 h-7 rounded-full bg-[#F5ECE9] text-[#88544B] flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-editorial text-3xl font-bold text-[#7A3F35]">
            ₹{Number(totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-[#88544B] mt-1">Supplier outflow / expenses</p>
        </div>

        {/* Product Count */}
        <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C7A74] mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A74]">Products</span>
            <div className="w-7 h-7 rounded-full bg-[#F2EFF6] text-[#8B7F98] flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-serif-editorial text-3xl font-bold text-[#2D2320]">
            {productCount}
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-[11px] text-[#9E6056] hover:underline mt-1 inline-flex items-center font-medium"
          >
            Inventory catalog &rarr;
          </button>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-[#EDE4D8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C7A74] mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8C7A74]">Low Stock Alert</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${lowStockCount > 0 ? 'bg-[#F9ECEB] text-[#9E6056]' : 'bg-[#FAF7F2] text-[#A69792]'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`font-serif-editorial text-3xl font-bold ${lowStockCount > 0 ? 'text-[#8A4F46]' : 'text-[#2D2320]'}`}>
            {lowStockCount}
          </div>
          <p className="text-[11px] text-[#8C7A74] mt-1">Items below threshold</p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white border border-[#EDE4D8] rounded-3xl shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FCFAF7]">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-[#9E6056]" />
            <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320]">
              Recent Khata Entries
            </h3>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-[#9E6056] hover:text-[#864E46] inline-flex items-center"
          >
            View all ledger &rarr;
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-10 text-center text-[#8C7A74]">
            <Receipt className="w-8 h-8 mx-auto text-[#D5C6B5] mb-2" />
            <p className="font-serif-editorial text-lg text-[#3B2B27]">No ledger entries yet</p>
            <p className="text-xs text-[#8C7A74] mt-0.5">
              Record a voice bill or manual entry to start tracking transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[#8C7A74]">
                  <th className="py-3 px-5 font-semibold">Date &amp; Time</th>
                  <th className="py-3 px-5 font-semibold">Customer</th>
                  <th className="py-3 px-5 font-semibold">Type</th>
                  <th className="py-3 px-5 font-semibold">Direction</th>
                  <th className="py-3 px-5 font-semibold text-right">Amount</th>
                  <th className="py-3 px-5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EAE0]">
                {recentTransactions.map((tx) => {
                  const customerName =
                    typeof tx.customer === 'string'
                      ? tx.customer
                      : tx.customer?.name || tx.customer_name || 'Walk-in / Cash';

                  const direction = (tx.money_direction || tx.direction || '').toLowerCase();
                  const isInflow = direction === 'in' || direction === 'credit' || direction === 'incoming';

                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF7F2]/80 transition">
                      <td className="py-3.5 px-5 text-[#7A6963] whitespace-nowrap">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1.5 text-[#9E8B85]" />
                          {tx.date || tx.created_at
                            ? new Date(tx.date || tx.created_at!).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-[#2D2320]">{customerName}</td>
                      <td className="py-3.5 px-5 text-[#6D5C57] capitalize">
                        {tx.transaction_type || tx.type || 'Standard'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isInflow
                              ? 'bg-[#EBF1E9] text-[#4B6344]'
                              : 'bg-[#F5ECE9] text-[#7A3F35]'
                          }`}
                        >
                          {isInflow ? 'IN (+)' : 'OUT (-)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right font-serif-editorial text-base font-bold text-[#2D2320] whitespace-nowrap">
                        ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            (tx.payment_status || tx.status) === 'paid' || (tx.payment_status || tx.status) === 'completed'
                              ? 'bg-[#EBF1E9] text-[#4B6344]'
                              : 'bg-[#FAF3E8] text-[#865922]'
                          }`}
                        >
                          {tx.payment_status || tx.status || 'completed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;
