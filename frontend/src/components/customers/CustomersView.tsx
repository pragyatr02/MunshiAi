import React, { useState, useEffect, useCallback } from 'react';
import { customerService, CreateCustomerPayload } from '../../services/customerService';
import { Customer, CustomerBalance, Transaction } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { formatApiError } from '../../services/api';
import {
  Users,
  UserPlus,
  Phone,
  MapPin,
  RefreshCw,
  Search,
  Receipt,
  X,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Add customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Customer Detail View state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerBalance, setCustomerBalance] = useState<CustomerBalance | number | null>(null);
  const [customerTxHistory, setCustomerTxHistory] = useState<Transaction[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleOpenDetail = async (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomer(customer);
    setDetailLoading(true);
    setDetailError(null);

    try {
      const [balResult, txResult] = await Promise.allSettled([
        customerService.getCustomerBalance(customer.id),
        customerService.getCustomerTransactions(customer.id),
      ]);

      if (balResult.status === 'fulfilled') {
        setCustomerBalance(balResult.value);
      }
      if (txResult.status === 'fulfilled') {
        setCustomerTxHistory(txResult.value);
      }
    } catch (err) {
      setDetailError(formatApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      // Strictly name, phone, address - no age
      const payload: CreateCustomerPayload = {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };
      const created = await customerService.createCustomer(payload);
      setCustomers((prev) => [created, ...prev]);
      setShowAddModal(false);
      setName('');
      setPhone('');
      setAddress('');
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8 text-[#2D2320]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 pb-4 border-b border-[#EDE4D8]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9E6056] block mb-1">
            Grahak Khata
          </span>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2320]">
            Customers &amp; Udhaar Book
          </h2>
          <p className="text-xs text-[#7A6963] mt-0.5">
            Track individual customer credit, contact details, and ledger history.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCustomers}
            className="inline-flex items-center px-3.5 py-2 border border-[#DED4C7] bg-[#FAF7F2] hover:bg-[#F2EAE1] text-[#55433E] text-xs font-medium rounded-full shadow-2xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-[#8C7A74]" />
            Refresh
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setFormError(null);
            }}
            className="inline-flex items-center px-4 py-2 bg-[#9E6056] hover:bg-[#864E46] text-[#FAF7F2] text-xs font-semibold rounded-full shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9E8B85] absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by customer name, phone number, address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DDD0C0] rounded-xl focus:ring-[#9E6056] focus:border-[#9E6056]"
        />
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching customer records..." />
      ) : error ? (
        <ErrorMessage title="Failed to Load Customers" message={error} onRetry={fetchCustomers} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title={search ? 'No Matching Customers' : 'No Customers Registered Yet'}
          description={
            search
              ? 'Try searching with a different name or phone number.'
              : 'Add your regular store customers to manage their udhaar balance.'
          }
          actionLabel="Register Customer"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => {
            const balance =
              customer.outstanding_balance ?? customer.balance ?? null;

            return (
              <div
                key={customer.id}
                onClick={() => handleOpenDetail(customer)}
                className="bg-white border border-[#EDE4D8] rounded-2xl p-5 hover:border-[#9E6056] hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif-editorial text-xl font-bold text-[#2D2320]">
                        {customer.name}
                      </h3>
                      <div className="flex items-center text-xs text-[#7A6963] mt-1">
                        <Phone className="w-3 h-3 mr-1 text-[#9E8B85]" />
                        <span>{customer.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#F4ECE6] text-[#9E6056] flex items-center justify-center font-serif-editorial text-sm font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-start text-xs text-[#7A6963] mt-2.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#9E8B85] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.address || 'No address provided'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F2EAE0] flex items-center justify-between text-xs">
                  <span className="text-[#8C7A74]">Udhaar Balance:</span>
                  <span
                    className={`font-serif-editorial text-base font-bold ${
                      balance !== null && balance > 0
                        ? 'text-[#8A4F46]'
                        : balance !== null && balance < 0
                        ? 'text-[#4B6344]'
                        : 'text-[#2D2320]'
                    }`}
                  >
                    {balance !== null
                      ? `₹${Number(Math.abs(balance)).toLocaleString('en-IN')}`
                      : 'View Balance'}
                    {balance !== null && balance > 0 && ' (Due)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Detail & Khata History Modal */}
      {selectedCustomerId && selectedCustomer && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8] max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-[#EDE4D8]">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-[#F4ECE6] text-[#9E6056] flex items-center justify-center font-serif-editorial text-2xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-[#7A6963] mt-0.5">
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1 text-[#9E8B85]" />
                      {selectedCustomer.phone}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-[#9E8B85]" />
                      {selectedCustomer.address}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-4 space-y-4">
              {detailLoading ? (
                <LoadingSpinner message="Fetching balance and transaction history..." size="sm" />
              ) : detailError ? (
                <ErrorMessage message={detailError} />
              ) : (
                <>
                  <div className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-full bg-[#F4ECE6] text-[#9E6056]">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A74]">
                          Outstanding Udhaar Balance
                        </div>
                        <div className="font-serif-editorial text-3xl font-bold text-[#2D2320]">
                          {(() => {
                            let bal: number | null = null;
                            if (typeof customerBalance === 'number') {
                              bal = customerBalance;
                            } else if (customerBalance && typeof customerBalance.outstanding_balance === 'number') {
                              bal = customerBalance.outstanding_balance;
                            } else if (customerBalance && typeof customerBalance.balance === 'number') {
                              bal = customerBalance.balance;
                            } else if (selectedCustomer.outstanding_balance !== undefined) {
                              bal = selectedCustomer.outstanding_balance;
                            } else if (selectedCustomer.balance !== undefined) {
                              bal = selectedCustomer.balance;
                            }
                            if (bal === null) return '₹0.00';
                            return `₹${Number(bal).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                            })}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] font-bold text-[#8C7A74] uppercase tracking-wider flex items-center">
                        <Receipt className="w-3.5 h-3.5 mr-1 text-[#9E8B85]" />
                        Ledger History
                      </h4>
                      <span className="text-xs text-[#8C7A74]">
                        {customerTxHistory.length} transactions
                      </span>
                    </div>

                    {customerTxHistory.length === 0 ? (
                      <div className="bg-[#FAF7F2] rounded-xl p-6 text-center text-xs text-[#7A6963]">
                        No recorded transactions for this customer.
                      </div>
                    ) : (
                      <div className="border border-[#EDE4D8] rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF7F2] text-[#8C7A74] border-b border-[#EDE4D8] font-semibold">
                            <tr>
                              <th className="py-2.5 px-4">Date</th>
                              <th className="py-2.5 px-4">Type</th>
                              <th className="py-2.5 px-4">Direction</th>
                              <th className="py-2.5 px-4 text-right">Amount</th>
                              <th className="py-2.5 px-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F2EAE0]">
                            {customerTxHistory.map((tx) => {
                              const dir = (tx.money_direction || tx.direction || '').toLowerCase();
                              const isInflow = dir === 'in' || dir === 'credit' || dir === 'incoming';

                              return (
                                <tr key={tx.id} className="hover:bg-[#FAF7F2]">
                                  <td className="py-2.5 px-4 text-[#7A6963]">
                                    {tx.date || tx.created_at
                                      ? new Date(tx.date || tx.created_at!).toLocaleDateString('en-IN')
                                      : 'N/A'}
                                  </td>
                                  <td className="py-2.5 px-4 text-[#2D2320] capitalize">
                                    {tx.transaction_type || tx.type || 'Standard'}
                                  </td>
                                  <td className="py-2.5 px-4">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isInflow
                                          ? 'bg-[#EBF1E9] text-[#4B6344]'
                                          : 'bg-[#F5ECE9] text-[#7A3F35]'
                                      }`}
                                    >
                                      {isInflow ? 'IN (+)' : 'OUT (-)'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-serif-editorial text-base font-bold text-[#2D2320]">
                                    ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                                  </td>
                                  <td className="py-2.5 px-4 text-center text-[#7A6963] capitalize">
                                    {tx.payment_status || tx.status || 'completed'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#EDE4D8] flex justify-end">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-5 py-2 bg-[#F2EAE0] hover:bg-[#EAE0D4] text-[#4A3834] text-xs font-semibold rounded-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal - Strictly name, phone, address. NO AGE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#2D2320]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-lg border border-[#EDE4D8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8] mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#9E6056]" />
                <h3 className="font-serif-editorial text-2xl font-bold text-[#2D2320]">
                  Register Customer
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9E8B85] hover:text-[#2D2320] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-[#FBF5F4] border border-[#ECD3CE] text-[#7D3F37] text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#55433E] mb-1">
                  Customer Name <span className="text-[#9E6056]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  {submitting ? 'Saving to FastAPI...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
