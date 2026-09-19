import { useState, useEffect } from 'react';
import { paymentStore } from '../../../store/paymentStore';

export const usePayments = () => {
  const [paymentState, setPaymentState] = useState(() => paymentStore.getState());

  useEffect(() => {
    const unsubscribe = paymentStore.subscribe((newPaymentState) => {
      setPaymentState(newPaymentState);
    });
    return unsubscribe;
  }, []);

  const addPayment = (amount, method) => {
    return paymentStore.addPayment(amount, method);
  };

  const resetPayments = () => {
    paymentStore.resetStore();
  };

  return {
    payments: paymentState.payments,
    addPayment,
    resetPayments
  };
};
