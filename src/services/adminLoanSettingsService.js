import { apiRequest } from './api';

export const adminLoanSettingsService = {
  getLoanSettings: async () => {
    return await apiRequest('/admin/settings/loan');
  },
  updateLoanSettings: async (settingsData) => {
    return await apiRequest('/admin/settings/loan', {
      method: 'PUT',
      body: settingsData,
    });
  },
};
