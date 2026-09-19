import api from './api';

export const adminLoanService = {
  getAllLoans: async () => {
    const response = await api.get('/admin/loans');
    return response.data;
  },

  createLoan: async (loanData) => {
    const response = await api.post('/admin/loans', loanData);
    return response.data;
  },

  updateLoan: async (loanId, loanData) => {
    const response = await api.put(`/admin/loans/${loanId}`, loanData);
    return response.data;
  },

  deleteLoan: async (loanId) => {
    const response = await api.delete(`/admin/loans/${loanId}`);
    return response.data;
  }
};
