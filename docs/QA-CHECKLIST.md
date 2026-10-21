# Manual QA — Old Mutual payments v5

This document covers test steps, not completed test results.

- [ ] `pnpm install` with registry access
- [ ] `pnpm typecheck`
- [ ] `pnpm build` (requires npm registry access only; no Google Fonts build fetch)
- [ ] Run at `http://localhost:3000`, check Century Gothic is used where installed (else local sans fallback)
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
- [ ] Print receipt to A4 / Save as PDF: Century Gothic 10pt body, Old Mutual logo and Uganda contact header
- [ ] Receipt clearly labeled as demo and not proof of payment / unit allocation

## v5.2 print regression

1. Simulate a test payment and keep the confirmation dialog open.
2. Click **Print demo receipt**. In Print Preview, verify only the branded receipt is visible: no backdrop, buttons, modal, or app sidebar.
3. Select **Save as PDF** and verify an A4 page with letterhead, green payment table, and important demo disclaimer.
4. Verify receipt table/body font is 10pt Century Gothic where that font is installed.
5. Cancel printing; ensure the on-screen confirmation dialog remains available.
6. Repeat for an OMIG USD deposit, insurance premium, and declined card.
7. Browser header/footer metadata can be disabled in Print Preview → More settings → Headers and footers.
