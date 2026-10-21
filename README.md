# Old Mutual Uganda — Payments Portal Demo (v3.0)

An **Ext JS Classic + pnpm + Vite** frontend prototype covering **insurance card payments** and **Old Mutual Investment Group (OMIG) unit trust deposits**. It uses the two brand PNGs supplied for this demonstration.

> **DEMO / UNOFFICIAL:** This project is not an official Old Mutual website, payment provider, bank integration, or investment accounting system. It does not accept payments. Do not use real card numbers or personal account data.

## Quick start

Requirements: Node.js 20+ and pnpm. In this folder:

```bash
corepack enable
pnpm install
pnpm dev
```

Visit **http://localhost:5173**. On Windows, you can also use `START-WINDOWS.bat` after installing Node.js.

For a production-style frontend build:

```bash
pnpm build
pnpm preview
```

## What's new in v2

- **Old Mutual branding:** the actual uploaded wordmark and emblem are in `public/brand`; primary green `#009677`, neutral backgrounds and matching navigation.
- **Overview:** separate entry points for insurance payments and OMIG deposits, demo totals and recent activity.
- **Insurance:** policy number, policyholder name, email, payment type (premium / renewal / top-up) and UGX amount.
- **OMIG investments:** investor/client number, investor name and email, contribution type (initial/additional), scheme selector and deposit amount.
- **Four CMA-listed Ugandan OMIG unit trust schemes:** Umbrella Fund, Money Market Fund, Balanced Fund, Dollar Fund. The first three use UGX in this demo, and the Dollar Fund uses USD, with no FX conversion or cross-currency total.
- **Payment summary:** context-aware scheme / policy description, amount, zero *demo* fee and currency. Zero demo fees are **not** a claim about actual card processing charges.
- **Card scenarios:** simulated approved / declined / verification-required cards and a fixed demonstration OTP.
- **History:** filter by service or status and search by fund, investor/policy ref or payment ref; Ext JS grid when a compatible SDK is available, otherwise an accessible HTML table.
- **Branded A4 printable receipts (v3):** the supplied Old Mutual logo is printed at the top left, with a two-column company contact letterhead modelled after the supplied Travel Insurance KYC sample, a central receipt title, green table headings, policy/investor details, payment status and total. The entire portal UI and modal are excluded from printing. Explicitly marked as simulated and **NOT proof of payment or unit allocation**.

### Investment fund schemes

The scheme names are based on the [Uganda Capital Markets Authority's licensed-firms listing](https://cmauganda.co.ug/cma-licensed-firms/). The demonstration does not query Old Mutual investor accounts or verify product eligibility, minimum investment, fees, pricing, redemption terms or account ownership. These details must be implemented and approved separately before any live payment flow.

## Test cards

All tests use a *future* expiry (for example `12/29`, while still valid) and the CVV `123`. Use the **Fill test card** button for the approved scenario.

| Scenario | Sandbox card | Result |
| --- | --- | --- |
| Approved | `4242 4242 4242 4242` | Simulated approval |
| Declined | `4000 0000 0000 0002` | Simulated decline |
| Challenge | `4000 0000 0000 3220` | Enter demo OTP `123456` |

The UI accepts **only the three listed card sequences**. It deliberately has **no gateway, banking API, authentication, backend, real 3-D Secure or card tokenization**.

## Ext JS framework installation

The interface creates genuine `Ext.form.field.Text`, `Ext.form.field.Number`, `Ext.form.field.ComboBox` and `Ext.grid.Panel` controls **when Ext JS Classic is available**. However, Sencha Ext JS is separately licensed and is not redistributed in this project.

The runtime checks the following sources in order:

1. `/public/ext/build/ext-all.js` and corresponding Triton theme assets;
2. `https://cdn.sencha.com/ext/gpl/7.0.0/build/ext-all.js` with the corresponding theme, if accessible;
3. If neither is accessible, fully functional **native controls** as an offline-friendly fallback.

To reliably use Ext JS:

1. Obtain an appropriate Ext JS Classic SDK under the **correct license** (commercial or GPL subject to your own licensing obligations).
2. Copy the SDK's `build` directory into `public/ext/build`.
3. Verify that `public/ext/build/ext-all.js` and `public/ext/build/classic/theme-triton/resources/theme-triton-all.css` exist.
4. Start with `pnpm dev`; the footer should say `UI: Ext JS Classic` rather than `Native fallback`.

The hosted Sencha assets may be unavailable due to network, licensing or distribution changes. **pnpm handles the build tooling; it does not automatically install proprietary Ext JS.**

## Data and security

- Only simulated reference/account and non-sensitive payment metadata are saved to browser `localStorage` (maximum 150 records). Payment card PAN, expiry, CVV and receipt email **are not persisted**. Inputs are cleared before simulated processing and the simulated OTP retains only a sanitized transaction record.
- Demo receipts are printable but cannot be treated as evidence of a card charge, unit subscription, allocation, or posted deposit.
- The demonstration is entirely client-side; no authorization, tokenization, KYC/AML, server-side validation, reconciliation, idempotency, fraud controls, 3DS, webhooks or payment settlement are performed.
- **Production architecture:** integrate a compliant hosted/tokenized card checkout, authenticate/authorize investor access, confirm payment server-side, and allocate investment units only after independent settlement and investment-platform confirmation. Never collect/store raw PAN or CVV on your own server.
- Files in `public/brand` were supplied by the requester for this demo; confirm trademark/brand usage permission before public deployment.

## Project map

```text
old-mutual-card-demo/
  index.html                 Main screen markup
  src/main.js                Ext JS setup and simulated payment logic
  src/styles.css             Responsive Old Mutual themed design
  public/brand/              Supplied Old Mutual logos
  public/ext/                SDK placeholder (licensed framework not bundled)
  package.json               Vite and pnpm scripts
  START-WINDOWS.bat          Optional Windows launcher
  docs/                     Screenshots of portal and branded receipt
```
