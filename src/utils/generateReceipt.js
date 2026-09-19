export const generateReceiptText = (payment, loan, user) => {
  const border = '='.repeat(45);
  const divider = '-'.repeat(45);
  
  return `${border}
              HIDEL FINANCE SERVICES
             EMI REPAYMENT RECEIPT
${border}
Receipt Date:   ${payment.date}
Receipt ID:     REC-${payment.id}
Transaction ID: ${payment.id}
Status:         SUCCESSFUL (PAID)
${divider}
CUSTOMER INFORMATION:
Customer Name:  ${user?.name || 'Aarav Shah'}
Customer ID:    ${user?.customerId || 'NV-48211'}
Email Address:  ${user?.email || 'aarav.shah@example.com'}

LOAN DETAILS:
Loan Reference: ${loan?.id || 'LN-48211'}
Loan Type:      ${loan?.type || 'Personal Loan'}
Interest Rate:  ${loan?.interestRate || 8.4}% Fixed APR

TRANSACTION DETAILS:
EMI installment: #${payment.emiNo}
Payment Method:  ${payment.method}
Total Amount:    $${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}

Breakdown:
  - Principal:   $${(payment.amount * 0.79).toLocaleString(undefined, { minimumFractionDigits: 2 })}
  - Interest:    $${(payment.amount * 0.17).toLocaleString(undefined, { minimumFractionDigits: 2 })}
  - Fees & Misc: $${(payment.amount * 0.04).toLocaleString(undefined, { minimumFractionDigits: 2 })}
${divider}
Disclaimer:
This is a computer-generated transaction receipt and 
does not require a physical signature. For support, 
please contact support@novafin.example.
${border}
Thank you for banking with Hidel Finance.
`;
};
