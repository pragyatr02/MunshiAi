import api from './api';
import { Customer, CustomerBalance, Transaction } from '../types';

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerPayload {
  name?: string;
  phone?: string;
  address?: string;
}

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const response = await api.get<Customer[] | { customers: Customer[] }>('/customers');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray((response.data as { customers?: Customer[] }).customers)) {
      return (response.data as { customers: Customer[] }).customers;
    }
    return [];
  },

  async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
    // Strictly name, phone, address - no age
    const response = await api.post<Customer>('/customers', {
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      address: payload.address.trim(),
    });
    return response.data;
  },

  async getCustomerById(id: string | number): Promise<Customer> {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  async updateCustomer(id: string | number, payload: UpdateCustomerPayload): Promise<Customer> {
    const response = await api.patch<Customer>(`/customers/${id}`, payload);
    return response.data;
  },

  async getCustomerBalance(id: string | number): Promise<CustomerBalance | number> {
    const response = await api.get<CustomerBalance | number | { balance: number; outstanding_balance?: number }>(`/customers/${id}/balance`);
    return response.data;
  },

  async getCustomerTransactions(id: string | number): Promise<Transaction[]> {
    const response = await api.get<Transaction[] | { transactions: Transaction[] }>(`/customers/${id}/transactions`);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray((response.data as { transactions?: Transaction[] }).transactions)) {
      return (response.data as { transactions: Transaction[] }).transactions;
    }
    return [];
  },
};

export default customerService;
