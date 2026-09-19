import AsyncStorage from '@react-native-async-storage/async-storage';

const INITIAL_PAYMENTS = [
  { id: 'TX-009', emiNo: '009', date: '2026-05-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-008', emiNo: '008', date: '2026-04-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-007', emiNo: '007', date: '2026-03-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-006', emiNo: '006', date: '2026-02-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-005', emiNo: '005', date: '2026-01-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-004', emiNo: '004', date: '2025-12-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-003', emiNo: '003', date: '2025-11-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-002', emiNo: '002', date: '2025-10-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
  { id: 'TX-001', emiNo: '001', date: '2025-09-05', method: 'Auto-debit · HDFC ••4421', amount: 1240, status: 'Paid' },
];

let listeners = [];
let state = { payments: INITIAL_PAYMENTS };

AsyncStorage.getItem('nova_payments').then((json) => {
  if (json) {
    state = { payments: JSON.parse(json) };
    notify();
  }
});

const notify = () => {
  listeners.forEach((listener) => listener(state));
};

export const paymentStore = {
  getState() {
    return state;
  },
  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  addPayment(amount, method) {
    const nextEmiNo = String(state.payments.length + 1).padStart(3, '0');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const newPayment = {
      id: `TX-${nextEmiNo}`,
      emiNo: nextEmiNo,
      date: formattedDate,
      method: method || 'HDFC Bank ••4421',
      amount: parseFloat(amount),
      status: 'Paid',
    };

    state = { ...state, payments: [newPayment, ...state.payments] };
    AsyncStorage.setItem('nova_payments', JSON.stringify(state.payments));
    notify();
    return newPayment;
  },
  resetStore() {
    state = { payments: INITIAL_PAYMENTS };
    AsyncStorage.setItem('nova_payments', JSON.stringify(INITIAL_PAYMENTS));
    notify();
  },
  setPayments(paymentList) {
    state = { payments: paymentList };
    AsyncStorage.setItem('nova_payments', JSON.stringify(paymentList));
    notify();
  },
  prependPayment(transaction) {
    state = { ...state, payments: [transaction, ...state.payments] };
    AsyncStorage.setItem('nova_payments', JSON.stringify(state.payments));
    notify();
  },
};
