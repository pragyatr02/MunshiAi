import React, { useState, useEffect, useCallback } from 'react';
import { customerService } from '../../services/customerService';
import { Customer, CustomerBalance, Transaction } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { PageId } from '../layout/Navbar';
import { formatApiError } from '../../services/api';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Wallet,
  Receipt,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Mic,
  Plus,
  RefreshCw,
  Edit3,
  X,
} from 'lucide-react';

interface CustomerDetailPageProps {
  customerId: string | number | null;
  onNavigate: (page: PageId) => void;
  onPreloadVoiceForCustomer?: (customerName: string) => void;
}

export const CustomerDetailPage: React.FC<CustomerDetailPageProps> = ({
  customerId,
  onNavigate,
  onPreloadVoiceForCustomer,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [balance, setBalance] = useState<CustomerBalance | number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Customer Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (!customer) return;
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditAddress(customer.address);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setEditError(null);
    setEditSubmitting(true);

    try {
      const updated = await customerService.updateCustomer(customerId, {
        name: editName.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      });
      setCustomer(updated);
      setShowEditModal(false);
    } catch (err) {
      setEditError(formatApiError(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchCustomerDetails = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);

    try {
      const [custData, balData, txData] = await Promise.all([
        customerService.getCustomerById(customerId),
        customerService.getCustomerBalance(customerId).catch(() => null),
        customerService.getCustomerTransactions(customerId).catch(() => []),
      ]);

      setCustomer(custData);
      setBalance(balData);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  if (!customerId) {
    return (
      <div className="py-12 text-center text-[#7A6963]">
        <p className="font-serif-editorial text-2xl text-[#2D2320]">No customer selected</p>
        <button
          onClick={() => onNavigate('customers')}
          className="mt-4 px-5 py-2 rounded-full bg-[#9E6056] text-[#FAF7F2] text-xs font-semibold"
        >
          &larr; Return to Customers List
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Fetching customer khata and transactions..." size="lg" />;
  }

  if (error || !customer) {
    return (
      <div className="py-8 px-4 max-w-4xl mx-auto">
        <ErrorMessage
          title="Could Not Load Customer Details"
          message={error || 'Customer not found.'}
          onRetry={fetchCustomerDetails}
        />
        <div className="text-center mt-4">
          <button
            onClick={() => onNavigate('customers')}
            className="text-xs text-[#9E6056] font-semibold hover:underline"
          >
            &larr; Back to Customers Directory
          </button>
        </div>
      </div>
    );
  }

  // Calculate real balance from backend response
  let displayBalance: number = 0;
  if (typeof balance === 'number') {
    displayBalance = balance;
  } else if (balance && typeof balance.outstanding_balance === 'number') {
    displayBalance = balance.outstanding_balance;
  } else if (balance && typeof balance.balance === 'number') {
    displayBalance = balance.balance;
  } else if (customer.outstanding_balance !== undefined) {
    displayBalance = customer.outstanding_balance;
  } else if (customer.balance !== undefined) {
    displayBalance = customer.balance;
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 text-[#2D2320]">
      {/* Top Navigation & Back Action */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDE4D8]">
        <button
          onClick={() => onNavigate('customers')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8C7A74] hover:text-[#2D2320] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomerDetails}
            className="inline-flex items-center px-3.5 py-1.5 border border-[#DED4C7] bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#55433E] text-xs font-medium rounded-full shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-[#8C7A74]" />
            Refresh
          </button>
          <button
            onClick={() => {
              if (onPreloadVoiceForCustomer) {
                onPreloadVoiceForCustomer(customer.name);
              }
              onNavigate('voice');
            }}
            className="inline-flex items-center px-4 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full shadow-xs transition"
          >
            <Mic className="w-3.5 h-3.5 mr-1.5" />
            <span>Voice Bill for {customer.name}</span>
          </button>
        </div>
      </div>

      {/* Customer Profile Card - Refined Stationery Aesthetic */}
      <div className="bg-white border border-[#EDE4D8] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-6 border-b border-[#F2EAE0]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#F4ECE6] text-[#9E6056] flex items-center justify-center font-serif-editorial text-3xl font-bold shadow-xs">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block mb-0.5">
                Customer Record
              </span>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-[#2D2320]">
                {customer.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A6963] mt-1.5">
                <span className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-[#9E8B85]" />
                  {customer.phone || 'No phone recorded'}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#9E8B85]" />
                  {customer.address || 'No address recorded'}
                </span>
                <button
                  onClick={handleOpenEdit}
                  className="inline-flex items-center space-x-1 text-[#9E6056] hover:underline font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real Outstanding Balance Box */}
          <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl p-5 text-right min-w-[200px]">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C7A74] block">
              Outstanding Udhaar Balance
            </span>
            <div
              className={`font-serif-editorial text-3xl sm:text-4xl font-bold mt-1 ${
                displayBalance > 0
                  ? 'text-[#8A4F46]'
                  : displayBalance < 0
                  ? 'text-[#4B6344]'
                  : 'text-[#2D2320]'
              }`}
            >
              ₹{Number(Math.abs(displayBalance)).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
            <span className="text-[10px] font-semibold text-[#8C7A74] block mt-0.5">
              {displayBalance > 0
                ? 'Amount Due from Customer'
                : displayBalance < 0
                ? 'Advance Balance'
                : 'Khata Settled'}
            </span>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#9E6056] block">
                Ledger History
              </span>
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                Past Transactions
              </h3>
            </div>
            <span className="text-xs text-[#8C7A74]">
              {transactions.length} entries recorded
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center text-[#8C7A74]">
              <Receipt className="w-8 h-8 mx-auto text-[#D5C6B5] mb-2" />
              <p className="font-serif-editorial text-lg text-[#3B2B27]">No transactions recorded yet</p>
              <p className="text-xs text-[#8C7A74] mt-0.5">
                Record a voice bill or manual entry to start {customer.name}&rsquo;s ledger history.
              </p>
            </div>
          ) : (
            <div className="border border-[#EDE4D8] rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#EDE4D8] bg-[#FAF7F2] text-[#8C7A74]">
                    <th className="py-3.5 px-5 font-semibold">Date &amp; Time</th>
                    <th className="py-3.5 px-5 font-semibold">Transaction Type</th>
                    <th className="py-3.5 px-5 font-semibold">Direction</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Amount</th>
                    <th className="py-3.5 px-5 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EAE0]">
                  {transactions.map((tx) => {
                    const dir = (tx.money_direction || tx.direction || '').toLowerCase();
                    const isInflow = dir === 'in' || dir === 'credit' || dir === 'incoming';

                    return (
                      <tr key={tx.id} className="hover:bg-[#FAF7F2]/80 transition">
                        <td className="py-3.5 px-5 text-[#7A6963] whitespace-nowrap">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-[#9E8B85]" />
                            {tx.date || tx.created_at
                              ? new Date(tx.date || tx.created_at!).toLocaleString('en-IN', {
                                  dateStyle: 'medium',
                                  timeStyle: 'short',
                                })
                              : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-[#2D2320] font-medium capitalize">
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
                        <td className="py-3.5 px-5 text-right font-serif-editorial text-base font-bold text-[#2D2320] whitespace-nowrap">
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              (tx.payment_status || tx.status) === 'paid' ||
                              (tx.payment_status || tx.status) === 'completed'
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

      {/* Edit Customer Modal - Strictly Name, Phone, Address */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8] mb-4">
              <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                Edit Customer Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 bg-[#FAF4F3] border border-[#ECD3CE] text-[#7D3F37] text-xs p-3 rounded-xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Customer Name <span className="text-[#9E6056]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Phone Number <span className="text-[#9E6056]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Address / Locality <span className="text-[#9E6056]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Shop 4, Main Bazaar, Old Delhi"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-[#DDD0C0] text-[#55433E] rounded-full hover:bg-[#F2EAE0] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] rounded-full font-semibold disabled:opacity-50"
                >
                  {editSubmitting ? 'Updating via PATCH...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
