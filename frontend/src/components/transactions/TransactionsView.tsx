import React, { useState, useEffect, useCallback } from 'react';
import { transactionService, ProcessTransactionPayload } from '../../services/transactionService';
import { customerService } from '../../services/customerService';
import { Transaction, Customer } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { formatApiError } from '../../services/api';
import {
  Receipt,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  User as UserIcon,
} from 'lucide-react';

export const TransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // New transaction modal states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newTxCustomer, setNewTxCustomer] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxType, setNewTxType] = useState('sale');
  const [newTxDirection, setNewTxDirection] = useState<'in' | 'out'>('in');
  const [newTxDesc, setNewTxDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCustomers = async () => {
    try {
      const list = await customerService.getCustomers();
      setCustomers(list);
    } catch {
      // Ignore prefetch error
    }
  };

  useEffect(() => {
    fetchTransactions();
    loadCustomers();
  }, [fetchTransactions]);

  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this ledger entry?')) {
      return;
    }

    setDeletingId(id);
    try {
      await transactionService.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (selectedTx?.id === id) setSelectedTx(null);
    } catch (err) {
      alert(formatApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload: ProcessTransactionPayload = {
        customer_name: newTxCustomer,
        amount: Number(newTxAmount),
        transaction_type: newTxType,
        money_direction: newTxDirection,
        description: newTxDesc,
      };

      await transactionService.processTransaction(payload);
      setShowAddModal(false);
      setNewTxCustomer('');
      setNewTxAmount('');
      setNewTxDesc('');
      fetchTransactions();
    } catch (err) {
      setSubmitError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const cust =
      typeof tx.customer === 'string'
        ? tx.customer
        : tx.customer?.name || tx.customer_name || '';
    const matchesSearch =
      cust.toLowerCase().includes(search.toLowerCase()) ||
      (tx.description || '').toLowerCase().includes(search.toLowerCase()) ||
      String(tx.id).includes(search);

    const dir = (tx.money_direction || tx.direction || '').toLowerCase();
    const isIn = dir === 'in' || dir === 'credit' || dir === 'incoming';
    const isOut = dir === 'out' || dir === 'debit' || dir === 'outgoing';

    if (directionFilter === 'in') return matchesSearch && isIn;
    if (directionFilter === 'out') return matchesSearch && isOut;
    return matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 text-[#2D2320]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-4 border-b border-[#EDE4D8]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Official Ledger
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
            Bahi Khata Transactions
          </h2>
          <p className="text-xs text-[#7A6963] mt-0.5">
            Connected to FastAPI GET /transactions, POST /transactions/process, DELETE /transactions/:id
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTransactions}
            className="inline-flex items-center px-3.5 py-2 border border-[#DED4C7] bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#55433E] text-xs font-medium rounded-full shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#8C7A74]" />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setSubmitError(null);
            }}
            className="inline-flex items-center px-4 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9E8B85] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, item notes, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#8C7A74]" />
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="py-2.5 px-4 text-xs border border-[#DDD0C0] rounded-xl bg-white text-[#4A3834] focus:ring-[#9E6056] focus:border-[#9E6056]"
          >
            <option value="all">All Directions (IN / OUT)</option>
            <option value="in">Cash In / Credit (+)</option>
            <option value="out">Cash Out / Debit (-)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching transactions from FastAPI backend..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Transactions" message={error} onRetry={fetchTransactions} />
      ) : filteredTransactions.length === 0 ? (
        <EmptyState
          title={search ? 'No Matching Entries' : 'No Transactions Recorded Yet'}
          description={
            search
              ? 'Try adjusting your search criteria.'
              : 'Record a voice bill or create a manual entry to populate your ledger.'
          }
          actionLabel="Add Transaction"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="bg-white border border-[#EDE4D8] rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[#8C7A74]">
                  <th className="py-3.5 px-5 font-semibold">Date &amp; Time</th>
                  <th className="py-3.5 px-5 font-semibold">Customer</th>
                  <th className="py-3.5 px-5 font-semibold">Type</th>
                  <th className="py-3.5 px-5 font-semibold">Direction</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EAE0]">
                {filteredTransactions.map((tx) => {
                  const customerName =
                    typeof tx.customer === 'string'
                      ? tx.customer
                      : tx.customer?.name || tx.customer_name || 'Walk-in Customer';

                  const dir = (tx.money_direction || tx.direction || '').toLowerCase();
                  const isInflow = dir === 'in' || dir === 'credit' || dir === 'incoming';

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
                      <td className="py-3.5 px-5 font-semibold text-[#2D2320]">
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-3.5 h-3.5 text-[#9E8B85]" />
                          <span>{customerName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-[#6D5C57] capitalize">
                        {tx.transaction_type || tx.type || 'Standard'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isInflow
                              ? 'bg-[#EBF1E9] text-[#4B6344]'
                              : 'bg-[#F5ECE9] text-[#7A3F35]'
                          }`}
                        >
                          {isInflow ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 mr-0.5" /> IN
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 mr-0.5" /> OUT
                            </>
                          )}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 px-5 text-right font-serif-editorial text-base font-bold whitespace-nowrap ${
                          isInflow ? 'text-[#4B6344]' : 'text-[#2D2320]'
                        }`}
                      >
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
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1 text-[#8C7A74] hover:text-[#9E6056] hover:bg-[#F3ECE6] rounded-full transition"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={deletingId === tx.id}
                            className="p-1 text-[#8C7A74] hover:text-[#8A4F46] hover:bg-[#F9ECEB] rounded-full disabled:opacity-50 transition"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8] mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#9E6056]" />
                <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                  Ledger Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Transaction ID:</span>
                <span className="font-mono font-medium text-[#2D2320]">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Customer:</span>
                <span className="font-semibold text-[#2D2320]">
                  {typeof selectedTx.customer === 'string'
                    ? selectedTx.customer
                    : selectedTx.customer?.name || selectedTx.customer_name || 'Walk-in Customer'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Amount:</span>
                <span className="font-serif-editorial text-xl font-bold text-[#2D2320]">
                  ₹{Number(selectedTx.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Money Direction:</span>
                <span className="font-medium text-[#2D2320] uppercase">
                  {selectedTx.money_direction || selectedTx.direction || 'IN'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Transaction Type:</span>
                <span className="font-medium text-[#2D2320] capitalize">
                  {selectedTx.transaction_type || selectedTx.type || 'Sale'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Payment Status:</span>
                <span className="font-medium text-[#2D2320] capitalize">
                  {selectedTx.payment_status || selectedTx.status || 'Completed'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F2EAE0]">
                <span className="text-[#8C7A74]">Recorded Date:</span>
                <span className="font-medium text-[#2D2320]">
                  {selectedTx.date || selectedTx.created_at || 'N/A'}
                </span>
              </div>
              {selectedTx.description && (
                <div className="py-2">
                  <span className="text-[#8C7A74] block mb-1">Notes / Items:</span>
                  <p className="bg-[#FAF7F2] p-3 rounded-xl text-[#4A3834] text-xs">
                    {selectedTx.description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 bg-[#F2EAE0] hover:bg-[#EAE0D4] text-[#4A3834] text-xs font-semibold rounded-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8] mb-4">
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                New Ledger Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 bg-[#FBF5F4] border border-[#ECD3CE] text-[#7D3F37] text-xs p-3 rounded-xl">
                {submitError}
              </div>
            )}

            <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  list="customer-suggestions"
                  placeholder="e.g. Ramesh Kumar"
                  value={newTxCustomer}
                  onChange={(e) => setNewTxCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
                <datalist id="customer-suggestions">
                  {customers.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={newTxAmount}
                  onChange={(e) => setNewTxAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056] text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#55433E] mb-1">
                    Money Direction
                  </label>
                  <select
                    value={newTxDirection}
                    onChange={(e) => setNewTxDirection(e.target.value as 'in' | 'out')}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                  >
                    <option value="in">IN (Received / Sale)</option>
                    <option value="out">OUT (Paid / Expense)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#55433E] mb-1">
                    Type
                  </label>
                  <select
                    value={newTxType}
                    onChange={(e) => setNewTxType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                  >
                    <option value="sale">Sale</option>
                    <option value="payment_received">Payment Received</option>
                    <option value="purchase">Purchase</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5kg Basmati Rice, 2L Mustard Oil"
                  value={newTxDesc}
                  onChange={(e) => setNewTxDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#DDD0C0] text-[#55433E] rounded-full hover:bg-[#F2EAE0] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] rounded-full font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting to Backend...' : 'Submit to Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsView;
