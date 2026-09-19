import { apiRequest } from './api';
import { paymentStore } from '../store/paymentStore';
import { loanStore } from '../store/loanStore';

export const paymentService = {
  getPayments: async (status = 'All', limit = 50, offset = 0) => {
    const query = `?status=${status}&limit=${limit}&offset=${offset}`;
    const data = await apiRequest(`/payments${query}`);
    paymentStore.setPayments(data.payments);
    return data;
  },

  getCalendar: async (year, month) => {
    const data = await apiRequest(`/payments/calendar?year=${year}&month=${month}`);
    return data;
  },

  makePayment: async (amount, method, paymentType) => {
    const data = await apiRequest('/payments', {
      method: 'POST',
      body: { amount, method, paymentType },
    });
    // Sync updated loan and new payment into local stores
    if (data.updatedLoan) {
      loanStore.syncFromBackend(data.updatedLoan);
    }
    if (data.transaction) {
      paymentStore.prependPayment(data.transaction);
    }
    return data;
  },

  getReceipt: async (transactionId) => {
    const data = await apiRequest(`/payments/${transactionId}/receipt`);
    return data.receipt;
  },

  getReceiptDownloadUrl: (transactionId) => {
    const { BASE_URL } = require('./api');
    return `${BASE_URL}/payments/${transactionId}/receipt/download`;
  },
};
