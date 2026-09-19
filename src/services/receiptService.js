import { generateReceiptText } from '../utils/generateReceipt';

export const receiptService = {
  downloadReceipt: (payment, loan, user) => {
    try {
      const text = generateReceiptText(payment, loan, user);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_EMI_${payment.emiNo}.txt`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to download receipt:', error);
      return false;
    }
  }
};
