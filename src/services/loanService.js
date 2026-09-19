import { apiRequest } from './api';
import { loanStore } from '../store/loanStore';
import { paymentStore } from '../store/paymentStore';

export const loanService = {
  getActiveLoan: async () => {
    const data = await apiRequest('/loans/active');
    // Sync backend data into local store so existing UI components re-render
    loanStore.setLoan(data.data);
    if (data.data.transactions) {
      paymentStore.setPayments(data.data.transactions);
    }
    return data.data;
  },
  getLoanOverdue: async (loanId) => {
    const data = await apiRequest(`/loans/${loanId}/overdue`);
    return data.data;
  },
};
