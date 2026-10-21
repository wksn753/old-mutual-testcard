# Old Mutual payments demo — manual smoke test

1. Run `pnpm install` and `pnpm dev`. Open `http://localhost:5173`.
2. Check uploaded wordmark and emblem on the overview and green brand styles.
3. Insurance payments: submit approved test card; receipt must show insurance and policy reference.
4. OMIG investments: switch between Umbrella, Money Market, Balanced, and Dollar Fund; currency changes to USD for Dollar Fund and back to UGX for the others.
5. Submit OMIG deposit with approved test card; receipt must show investor number, scheme, deposit type, currency.
6. Try decline card `4000 0000 0000 0002`: expect Declined, nothing charged.
7. Try challenge card `4000 0000 0000 3220`: wrong OTP rejected; `123456` approves; cancellation records no transaction.
8. Reject unknown card sequences and malformed expiry / CVV, missing refs, invalid UGX decimal amounts, excessive USD amounts.
9. Transactions: search by fund/reference and filter by OMIG/Insurance and Approved/Declined.
10. Reload page: history should remain locally while full card number / expiry / CVV / receipt email are not stored.
11. Check narrow/mobile screen sizes and responsive navigation.
12. If Sencha SDK is supplied, verify `UI: Ext JS Classic` and the form controls and grid layout correctly; otherwise verify the `Native fallback` works.
13. Print a demo receipt. It must clearly say no real money was moved and cannot act as proof of payment.
