# Old Mutual Uganda — Payments Portal (v5)

A responsive **Next.js App Router + TypeScript + shadcn/ui + Tailwind CSS v4 + Geist** demonstration of Old Mutual Uganda insurance and OMIG unit trust **simulated card payments**.

> **UNOFFICIAL DEMONSTRATION:** This is not a real Old Mutual payment channel. It does **not** connect to a payment gateway, bank, insurance system or investment account. **Do not enter real card, policy, investor, or personal information.** Branding was supplied by the requester for demonstration use.

## Quick start

Requirements: **Node.js 20.9+** and **pnpm**.

```bash
corepack enable
pnpm install
pnpm dev
```

Open **http://localhost:3000**.

```bash
pnpm typecheck
pnpm build
pnpm start
```

The first install/build requires registry access, and **`next/font/google` needs Google Fonts access at build time** to download and self-host Geist and Geist Mono. Once built, pages do not need to fetch the fonts in users' browsers.

## What changed from v4

The prior project was **Vite + Ext JS Classic with a native fallback**. Your new Next.js / shadcn / `next/font/google` requirements are incompatible with retaining that old Vite structure as-is. This v5 project is therefore a **framework migration**, replacing Ext JS with React and shadcn-style Radix UI controls. It is **not** an Ext JS project anymore.

- `app/layout.tsx`: imports `Geist` + `Geist_Mono` from `next/font/google`; sets variables `--font-geist-sans`, `--font-geist-mono`; adds both to body with `antialiased` and `display: "swap"`.
- `app/globals.css`: Tailwind **v4** `@theme inline` maps sans and mono families to Geist with system fallbacks; defines the current Old Mutual brand palette including `#009677`, semantic colors, and base typography.
- `components/ui/typography.tsx`: reusable **H1, H2, H3, Lead, P, Muted, InlineCode** with `cn()` and forwarding `className`/native element props.
- Reusable shadcn-style components: `Button`, `Input`, `Label`, `Select`, `Dialog`, `Badge`, and `Table`.
- Removed the top-right **Demo Environment** badge from the UI; a small footer disclaimer remains, as do clear warnings on the actual simulation and printed receipts.
- Typography refinements: Geist 600 headings, tighter tracking, less forced uppercase, 16px body line-height 1.6, readable 14px form text, and balanced headings.
- Current color palette, original uploaded logos, sidebar structure, insurance screens, OMIG flows, local history, and A4 branded receipt design are retained.

## Functionality

### Insurance

- Policy number, policyholder, email, amount (UGX)
- Premium, renewal, or top-up
- Step-by-step checkout and context-sensitive summary

### OMIG unit trusts

- Investor / client reference and name, email
- Umbrella Fund, Money Market Fund, Balanced Fund (**UGX**) and Dollar Fund (**USD**)
- Initial deposit / additional deposit
- Separate UGX and USD amounts; **no FX conversion or cross-currency totals**

The names are demo product choices, **not** proof of active fund eligibility, prices, minimums or account verification. Real investment funds can only be credited after independent confirmation by the relevant payment and investment systems.

### Sandbox card outcomes

| Scenario | Card number | Expiry | CVV | Result |
|---|---|---|---|---|
| Approved | `4242 4242 4242 4242` | `12/29` | `123` | Local simulated approval |
| Declined | `4000 0000 0000 0002` | `12/29` | `123` | Local simulated decline |
| Verification | `4000 0000 0000 3220` | `12/29` | `123` | Fixed test OTP `123456` |

Only these card sequences are accepted. Real card entry is rejected. PAN, expiry, CVV, and receipt email are **not sent to any backend or stored in history**. Payment simulations and challenges occur only in client-side memory. History is stored in browser `localStorage` at `om_payments_demo_v2` (maximum 150 entries), compatible with the v4 demo records.

### Transactions and receipts

- Overview with approved UGX volume, total records, success rate, and recent activity
- Search and filter by service/status; click a row to view the demo receipt
- Receipt modal with simulated status and transaction details
- **Branded A4 print layout:** supplied Old Mutual wordmark (left), Kampala contact block (right), centered heading, brand-green data header, amounts and disclaimer
- Click **Print demo receipt** and select **Save as PDF**. The print sheet uses the same `next/font` Geist family as the portal.

There is no real standalone PDF-generation backend. PDF output comes from the browser's print-to-PDF facility.

## Project structure

```text
app/
  layout.tsx               # next/font/google with Geist Sans and Geist Mono
  globals.css              # Tailwind v4, Old Mutual tokens, typography, responsive + print CSS
  page.tsx                 # App Router entry point
components/
  ui/                      # shadcn-style reusable primitives and typography
  portal/payments-portal.tsx
lib/
  payments.ts              # validations, demo fixtures, currency, local history, test cards
  utils.ts                 # cn helper
public/brand/              # Original user-supplied Old Mutual logos
components.json            # shadcn configuration
postcss.config.mjs         # Tailwind v4 PostCSS integration
```

## Checklist before deployment

1. Run `pnpm install`, `pnpm typecheck`, and `pnpm build` with network access.
2. Exercise insurance and OMIG payment flows at mobile and desktop breakpoints.
3. Confirm the 3 card outcomes, fixed OTP, rejection of non-test card numbers, transaction search/filter and browser persistence.
4. Verify print layout in Chrome or Edge using A4 / Save as PDF with **Background graphics** enabled.
5. Confirm the company legal entity/contact wording and use of brand assets with Old Mutual before distribution.

**Production is out of scope.** Live payments require an approved PCI-compliant hosted checkout, server-side payment verification, authentication, KYC/AML, transaction idempotency, reconciliation, webhooks, audit controls and investment unit-allocation confirmation. Never persist or handle raw cardholder PAN/CVV on application servers.
