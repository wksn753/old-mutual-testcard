# Manual QA — Old Mutual payments v5

This document covers test steps, not completed test results.

- [ ] `pnpm install` with registry access
- [ ] `pnpm typecheck`
- [ ] `pnpm build` with Google Fonts access (for `next/font/google`)
- [ ] Run at `http://localhost:3000`, check Geist fonts load
- [ ] Top-right Demo Environment badge absent; footer simulation disclosure present
- [ ] Desktop and mobile sidebar navigation, no horizontal overflow
- [ ] Insurance: required fields, integer UGX, continue to card step
- [ ] OMIG: all four funds, USD Dollar Fund, decimal validation, no cross-currency conversion
- [ ] Approved test card returns approved transaction and modal
- [ ] Declined test card returns declined transaction and modal
- [ ] OTP test card displays challenge; wrong code fails; `123456` succeeds
- [ ] Non-test card number is rejected; sensitive card inputs cleared after submission
- [ ] Search and filter transactions; click a row to view receipt
- [ ] Refresh and confirm local transaction history persists
- [ ] Print receipt to A4 / Save as PDF: Geist, Old Mutual logo and Uganda contact header
- [ ] Receipt clearly labeled as demo and not proof of payment / unit allocation
