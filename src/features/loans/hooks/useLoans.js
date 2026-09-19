import { useState, useEffect } from 'react';
import { loanStore } from '../../../store/loanStore';

export const useLoans = () => {
  const [loan, setLoan] = useState(() => loanStore.getState());

  useEffect(() => {
    const unsubscribe = loanStore.subscribe((newLoan) => {
      setLoan(newLoan);
    });
    return unsubscribe;
  }, []);

  const makePayment = (amount) => {
    loanStore.makePayment(amount);
  };

  const resetLoan = () => {
    loanStore.resetStore();
  };

  return {
    loan,
    makePayment,
    resetLoan
  };
};
