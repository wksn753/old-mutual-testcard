/** Old Mutual Uganda payment services DEMO. No gateway, bank or investment API. */
const $ = (id) => document.getElementById(id);
const ICON_PATHS = {
  overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
  'trending-up':'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  receipt:'<path d="M7 3h10a2 2 0 0 1 2 2v16l-4-2-3 2-3-2-4 2V5a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 13h6"/>',
  'credit-card':'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  error:'<circle cx="12" cy="12" r="10"/><path d="M15 9 9 15m0-6 6 6"/>',
  'arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  lock:'<rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-8h.01"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'
};
function icon(name) { return `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] || ICON_PATHS.info}</svg>`; }
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const fmt = (amount, currency='UGX') => `${currency === 'USD' ? 'USD' : 'UGX'} ${Number(amount || 0).toLocaleString('en-UG', {minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0})}`;
const dateText = (d) => { const parsed = new Date(d); return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString('en-GB', {year:'numeric',month:'short',day:'2-digit'}) : '—'; };
const TEST_CARDS = Object.freeze({'4242424242424242':'Approved','4000000000000002':'Declined','4000000000003220':'Challenge'});
const FUNDS = ['Umbrella Fund', 'Money Market Fund', 'Balanced Fund', 'Dollar Fund'];
const FUND_DETAILS = {
  'Umbrella Fund':'Umbrella Fund Unit Trust Scheme · UGX deposits',
  'Money Market Fund':'Money Market Fund Unit Trust Scheme · UGX deposits',
  'Balanced Fund':'Balanced Fund Unit Trust Scheme · UGX deposits',
  'Dollar Fund':'Dollar Fund Unit Trust Scheme · USD deposits'
};
const STORE_KEY = 'om_payments_demo_v2';
const dateAgo = (days) => new Date(Date.now() - days*86400000).toISOString();
const SEED = [
  {id:'OM-SIM-2418',category:'OMIG',reference:'INV-DEMO-0031',name:'Demo Investor',product:'Money Market Fund',detail:'Additional deposit',currency:'UGX',amount:350000,status:'Approved',last4:'4242',date:dateAgo(0.5)},
  {id:'OM-SIM-2417',category:'INSURANCE',reference:'POL-DEMO-10482',name:'Demo Customer',product:'Insurance premium',detail:'Insurance premium',currency:'UGX',amount:185000,status:'Approved',last4:'4242',date:dateAgo(1.3)},
  {id:'OM-SIM-2416',category:'OMIG',reference:'INV-DEMO-0054',name:'Demo Investor',product:'Umbrella Fund',detail:'Initial deposit',currency:'UGX',amount:100000,status:'Approved',last4:'4242',date:dateAgo(2.4)},
  {id:'OM-SIM-2415',category:'INSURANCE',reference:'POL-DEMO-10311',name:'Demo Customer',product:'Policy renewal',detail:'Policy renewal',currency:'UGX',amount:95000,status:'Declined',last4:'0002',date:dateAgo(4.1)}
];
const fields = {};
let extAvailable = false, extGrid = null, gridStore = null, processing = false, pending = null;
let currentCategory = 'INSURANCE';
let lastFundCurrency = 'UGX';
function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(stored)) return stored.filter(t => t && typeof t.id === 'string' && ['Approved','Declined'].includes(t.status));
    // Preserve historical demo data from the first iteration without preserving card details.
    const old = JSON.parse(localStorage.getItem('om_card_demo_transactions_v1'));
    if (Array.isArray(old)) return old.filter(t => t && t.id).map(t => ({id:String(t.id),category:'INSURANCE',reference:String(t.policy || ''),name:'Demo Customer',product:String(t.type || 'Insurance premium'),detail:String(t.type || 'Insurance premium'),currency:'UGX',amount:Number(t.amount) || 0,status:t.status === 'Approved' ? 'Approved':'Declined',last4:String(t.last4 || ''),date:t.date || new Date().toISOString()}));
  } catch (_) { /* private mode or malformed storage */ }
  return [...SEED];
}
let history = readHistory();
function saveHistory() { try { localStorage.setItem(STORE_KEY, JSON.stringify(history.slice(0,150))); } catch (_) { /* storage not available */ } }
const fieldDefs = [
  {name:'policy',kind:'text',value:'POL-DEMO-10482',placeholder:'e.g. POL-DEMO-10482',max:60},
  {name:'ins-name',kind:'text',value:'Demo Customer',placeholder:'Policyholder full name',max:100},
  {name:'ins-email',kind:'email',value:'demo@example.com',placeholder:'name@example.com',max:150},
  {name:'type',kind:'select',value:'Insurance premium',options:['Insurance premium','Policy renewal','Policy top-up']},
  {name:'ins-amount',kind:'number',value:185000,placeholder:'Enter amount'},
  {name:'fund',kind:'select',value:'Umbrella Fund',options:FUNDS},
  {name:'investor',kind:'text',value:'INV-DEMO-0031',placeholder:'e.g. INV-DEMO-0031',max:60},
  {name:'contribution',kind:'select',value:'Additional deposit',options:['Initial deposit','Additional deposit']},
  {name:'investor-name',kind:'text',value:'Demo Investor',placeholder:'Account holder name',max:100},
  {name:'investor-email',kind:'email',value:'investor@example.com',placeholder:'name@example.com',max:150},
  {name:'invest-amount',kind:'number',value:350000,placeholder:'Enter deposit amount'},
  {name:'card',kind:'text',value:'',placeholder:'0000 0000 0000 0000',max:19},
  {name:'cardholder',kind:'text',value:'Demo Customer',placeholder:'As shown on the demo card',max:100},
  {name:'expiry',kind:'text',value:'',placeholder:'MM/YY',max:5},
  {name:'cvv',kind:'password',value:'',placeholder:'•••',max:4}
];
function getValue(name) { const c = fields[name]; return c ? (typeof c.getValue === 'function' ? c.getValue() : c.value) : ''; }
function setValue(name, v) { const c = fields[name]; if (c) { if (typeof c.setValue === 'function') c.setValue(v); else c.value = v; } }
const digits = (v) => String(v ?? '').replace(/\D/g,'');
const normCard = (v) => digits(v).slice(0,16).replace(/(.{4})/g,'$1 ').trim();
const normExpiry = (v) => { const s=digits(v).slice(0,4); return s.length>2?`${s.slice(0,2)}/${s.slice(2)}`:s; };
function updateField(name) {
  if (['ins-amount','invest-amount','type','fund'].includes(name)) updateSummary();
  if (name === 'fund') updateFund();
  clearError();
}
function renderNativeFields() {
  fieldDefs.forEach(def => {
    const mount = $(`field-${def.name}`); if (!mount) return;
    let control;
    if (def.kind === 'select') {
      control = document.createElement('select');
      def.options.forEach(o => control.add(new Option(o,o)));
    } else {
      control = document.createElement('input');
      control.type = def.kind === 'email' ? 'email' : def.kind === 'password' ? 'password' : def.kind === 'number' ? 'number' : 'text';
      control.placeholder = def.placeholder || '';
      if (def.max) control.maxLength = def.max;
      if (def.kind === 'number') { control.min='0'; control.step='any'; }
      if (['card','expiry','cvv'].includes(def.name)) control.inputMode='numeric';
    }
    control.id=`input-${def.name}`; control.name=def.name; control.className='native-field'; control.value=def.value;
    mount.replaceChildren(control);
    const label = document.querySelector(`label[for="field-${def.name}"]`); if (label) label.htmlFor=control.id;
    control.addEventListener('input', () => {
      if (def.name==='card') control.value=normCard(control.value);
      if (def.name==='expiry') control.value=normExpiry(control.value);
      if (def.name==='cvv') control.value=digits(control.value).slice(0,4);
      updateField(def.name);
    });
    control.addEventListener('change', () => updateField(def.name));
    fields[def.name]=control;
  });
}
function renderExtFields() {
  fieldDefs.forEach(def => {
    const config={renderTo:`field-${def.name}`,width:'100%',height:44,hideLabel:true,name:def.name,value:def.value,emptyText:def.placeholder||'',enableKeyEvents:true,
      listeners:{change:(field,value)=>{
        if (def.name==='card' && normCard(value)!==value) {field.setValue(normCard(value)); return;}
        if (def.name==='expiry' && normExpiry(value)!==value) {field.setValue(normExpiry(value)); return;}
        if (def.name==='cvv' && digits(value).slice(0,4)!==value) {field.setValue(digits(value).slice(0,4)); return;}
        updateField(def.name);
      }}
    };
    let kind='Ext.form.field.Text';
    if (def.kind==='number') {kind='Ext.form.field.Number'; Object.assign(config,{minValue:0,hideTrigger:true,mouseWheelEnabled:false,allowDecimals:true});}
    if (def.kind==='select') {kind='Ext.form.field.ComboBox'; Object.assign(config,{store:def.options,queryMode:'local',editable:false,forceSelection:true,triggerAction:'all'});}
    if (def.kind==='password') config.inputType='password';
    if (def.kind==='email') config.vtype='email';
    if (def.max) config.maxLength=def.max;
    const component = window.Ext.create(kind,config); fields[def.name]=component;
    const label=document.querySelector(`label[for="field-${def.name}"]`);
    if (label && component.inputEl?.dom?.id) label.htmlFor=component.inputEl.dom.id;
  });
}
function currencyForFund() {return getValue('fund')==='Dollar Fund'?'USD':'UGX';}
function categoryAmount() { return Number(getValue(currentCategory==='OMIG'?'invest-amount':'ins-amount')) || 0; }
function categoryCurrency() {return currentCategory==='OMIG'?currencyForFund():'UGX';}
function updateFund() {
  const fund=String(getValue('fund'));
  $('fund-description').textContent=FUND_DETAILS[fund]||'Choose a unit trust scheme.';
  const curr=currencyForFund();
  if (curr!==lastFundCurrency) {
    lastFundCurrency=curr;
    setValue('invest-amount',curr==='USD'?250:350000);
  }
  $('investment-amount-label').innerHTML=`Deposit amount (${curr}) <span>*</span>`;
  $('investment-amount-note').textContent=curr==='USD'?'Demo only: Dollar Fund amounts are in USD. No foreign exchange conversion or unit allocation occurs.':'Amounts are in UGX. No real money or units are transferred.';
  if (currentCategory==='OMIG') updateSummary();
}
function updateSummary() {
  const curr=categoryCurrency(), amount=categoryAmount();
  const prod=currentCategory==='OMIG'?String(getValue('fund')||'Unit trust deposit'):String(getValue('type')||'Insurance premium');
  $('summary-product').textContent=prod;
  $('summary-subproduct').textContent=currentCategory==='OMIG'?'Old Mutual Investment Group':'Old Mutual Insurance';
  $('summary-label').textContent=currentCategory==='OMIG'?'Deposit amount':'Premium amount';
  $('summary-premium').textContent=fmt(amount,curr);
  $('summary-fee').textContent=fmt(0,curr);
  $('summary-total').textContent=fmt(amount,curr);
  $('summary-currency').textContent=curr==='USD'?'Currency: US dollars (USD) — Dollar Fund demo':'Currency: Ugandan shillings (UGX)';
  if (!processing) $('pay-button-label').textContent=`Simulate ${fmt(amount,curr)}`;
}
function chooseCategory(category) {
  if (!['INSURANCE','OMIG'].includes(category)) return;
  currentCategory=category;
  $('insurance-fields').hidden=category!=='INSURANCE';
  $('investment-fields').hidden=category!=='OMIG';
  $('payment-title').innerHTML=category==='OMIG'?'OMIG unit trust deposit<span class="accent-dot">.</span>':'Insurance payment<span class="accent-dot">.</span>';
  $('payment-eyebrow').innerHTML=`OLD MUTUAL <span></span> ${category==='OMIG'?'INVESTMENT GROUP':'INSURANCE'}`;
  $('payment-subtitle').textContent=category==='OMIG'?'Deposit to your selected unit trust scheme using a sandbox test card.':'Pay a policy premium, renewal or top-up with a sandbox test card.';
  $('details-subtitle').textContent=category==='OMIG'?'Provide your investor number and choose a unit trust scheme.':'Tell us which policy you are paying for.';
  setValue('cardholder', getValue(category==='OMIG'?'investor-name':'ins-name'));
  clearError(); updateFund(); updateSummary();
  if (extAvailable) {
    const relevant=category==='OMIG'?['fund','investor','contribution','investor-name','investor-email','invest-amount']:['policy','ins-name','ins-email','type','ins-amount'];
    setTimeout(()=>relevant.forEach(n=>{try { fields[n]?.updateLayout?.(); } catch (_) {} }),0);
  }
}
function navigate(route) {
  if (!['overview','insurance','omig','transactions'].includes(route)) return;
  const page=(route==='insurance'||route==='omig')?'payment':route;
  if (page==='payment') chooseCategory(route==='omig'?'OMIG':'INSURANCE');
  document.querySelectorAll('.page-section').forEach(el=>el.classList.toggle('active',el.id===`page-${page}`));
  document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.route===route));
  $('breadcrumb-current').textContent=({overview:'Overview',insurance:'Insurance payments',omig:'OMIG investments',transactions:'Transactions'})[route];
  $('sidebar').classList.remove('open');
  if (page==='overview') renderMetrics();
  if (page==='transactions') {refreshTransactions(); if (extGrid) setTimeout(()=>extGrid.updateLayout(),60);}
  window.scrollTo({top:0,behavior:'instant'});
}
function clearError() {$('form-error').hidden=true; $('form-error').textContent='';}
function showError(s) {$('form-error').textContent=s; $('form-error').hidden=false; $('form-error').scrollIntoView({behavior:'smooth',block:'center'});}
function expiryValid(v) {
  const m=/^(0[1-9]|1[0-2])\/(\d{2})$/.exec(v);
  return !!m && new Date(2000+Number(m[2]),Number(m[1]),1)>new Date();
}
function paymentInput() {
  const invest=currentCategory==='OMIG';
  return {
    category:currentCategory,
    reference:String(getValue(invest?'investor':'policy')||'').trim(),
    name:String(getValue(invest?'investor-name':'ins-name')||'').trim(),
    email:String(getValue(invest?'investor-email':'ins-email')||'').trim(),
    product:String(getValue(invest?'fund':'type')||'').trim(),
    detail:String(getValue(invest?'contribution':'type')||'').trim(),
    amount:Number(getValue(invest?'invest-amount':'ins-amount')),
    currency:categoryCurrency(),
    card:digits(getValue('card')),
    cardholder:String(getValue('cardholder')||'').trim(),
    expiry:String(getValue('expiry')||'').trim(),
    cvv:String(getValue('cvv')||'').trim()
  };
}
function validate(p) {
  if (p.reference.length<5 || p.reference.length>60) return p.category==='OMIG'?'Enter a valid demo investor / client number (5–60 characters).':'Enter a valid policy number (5–60 characters).';
  if (p.name.length<2 || p.name.length>100) return 'Enter the full account or policyholder name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) || p.email.length>150) return 'Enter a valid email address for the demo receipt.';
  if (p.category==='OMIG' && (!FUNDS.includes(p.product) || !['Initial deposit','Additional deposit'].includes(p.detail))) return 'Select a unit trust and deposit type.';
  if (p.category==='INSURANCE' && !['Insurance premium','Policy renewal','Policy top-up'].includes(p.product)) return 'Select an insurance payment type.';
  if (!Number.isFinite(p.amount) || p.amount<=0 || (p.currency==='UGX'?!Number.isSafeInteger(p.amount)||p.amount>100000000: Math.abs(Math.round(p.amount*100)-p.amount*100)>1e-7 || p.amount>100000)) return p.currency==='UGX'?'Enter a whole UGX amount between 1 and 100,000,000.':'Enter a USD amount between 0.01 and 100,000 with up to 2 decimal places.';
  if (!Object.hasOwn(TEST_CARDS,p.card)) return 'Only the three displayed test card numbers are accepted. Do not enter a real card.';
  if (p.cardholder.length<2) return 'Enter the name on the test card.';
  if (!expiryValid(p.expiry)) return 'Enter a valid future card expiry as MM/YY.';
  if (!/^\d{3,4}$/.test(p.cvv)) return 'Enter a 3–4 digit test CVV.';
  return null;
}
function refId() {
  const random=typeof crypto!=='undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0,8).toUpperCase() : Math.random().toString(36).slice(2,10).toUpperCase();
  return `OM-SIM-${random}`;
}
function makeTransaction(p,status) {
  // Whitelist allowed receipt fields; do not persist PAN, expiry, CVV, or email.
  return {id:refId(),category:p.category,reference:p.reference,product:p.product,detail:p.detail,currency:p.currency,amount:p.amount,status,last4:p.card.slice(-4),date:new Date().toISOString()};
}
function record(t) { history.unshift(t); saveHistory(); renderMetrics(); refreshTransactions(); }
function forgetCard() { setValue('card','');setValue('expiry','');setValue('cvv',''); }
function setBusy(value) { processing=value; $('pay-button').disabled=value; $('pay-button-label').textContent=value?'Processing demo payment…':`Simulate ${fmt(categoryAmount(),categoryCurrency())}`; }
function startPayment() {
  if (processing || pending) return;
  clearError();
  const p=paymentInput(), err=validate(p);
  if (err) {showError(err);return;}
  const outcome=TEST_CARDS[p.card];
  const receipt=makeTransaction(p,outcome==='Challenge'?'Approved':outcome);
  // Card security: discard input before any delayed processing or OTP simulation.
  forgetCard(); setBusy(true);
  setTimeout(()=>{
    setBusy(false);
    if (outcome==='Challenge') {pending=receipt;openOTP();return;}
    record(receipt); showResult(receipt);
  },500);
}
function openOTP() {$('otp-error').textContent='';$('otp-input').value='';$('otp-modal').hidden=false;$('otp-input').focus();}
function closeOTP() {pending=null;$('otp-modal').hidden=true;$('otp-input').value='';}
function verifyOTP() {
  if (!pending) return;
  if ($('otp-input').value.trim()!=='123456') {$('otp-error').textContent='Incorrect demo code. Enter 123456.';return;}
  const receipt=pending;closeOTP();record(receipt);showResult(receipt);
}
/** A separate, branded A4 print sheet avoids printing any portal chrome or card fields. */
function renderPrintReceipt(t) {
  const investment=t.category==='OMIG';
  const status=t.status==='Approved'?'APPROVED (DEMO)':'DECLINED (DEMO)';
  const d=new Date(t.date);
  const printedDate=Number.isFinite(d.getTime())
    ? d.toLocaleString('en-GB',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Africa/Kampala'})+' EAT'
    : '—';
  const itemRows=[
    ['Transaction reference',t.id],
    ['Payment category',investment?'OMIG – Investment deposits':'Insurance premiums'],
    [investment?'Investor / client number':'Policy number',t.reference],
    [investment?'Unit trust scheme':'Payment type',t.product],
    [investment?'Deposit type':'Description',t.detail],
    ['Payment date',printedDate],
    ['Test card','•••• '+String(t.last4||'—')],
    ['Simulation status',status],
    ['Currency',t.currency==='USD'?'USD – United States dollar':'UGX – Uganda shilling'],
  ];
  const rows=itemRows.map(([key,value])=>`<tr><th scope="row">${esc(key)}</th><td>${esc(value)}</td></tr>`).join('');
  const title=investment?'UNIT TRUST DEPOSIT':'INSURANCE PAYMENT';
  const clientDescription=investment
    ? 'Old Mutual Investment Group (OMIG) — investment demo'
    : 'Old Mutual Insurance Uganda Limited — insurance demo';
  // Keep the insurance company legal name specific to insurance documents. Investment issuer details are not verified.
  const contactName=investment?'Old Mutual Uganda — OMIG payment demo':'Old Mutual Insurance Uganda Limited';
  $('print-receipt-sheet').innerHTML=`
    <div class="print-document">
      <header class="print-letterhead">
        <img class="print-wordmark" src="/brand/old-mutual-wordmark.png" alt="Old Mutual" />
        <div class="print-company-contact">
          <strong>${esc(contactName)}</strong>
          <span>Nakawa Business Park, Plot 3–5 New Port Bell Road</span>
          <span>P.O. Box 7185, Kampala, Uganda</span>
          <span>Tel: +256 414 332700, 0200 507200</span>
          <span>Toll Free: 0800132700</span>
          <span>info-gi@oldmutual.co.ug</span>
          <span>www.oldmutual.co.ug</span>
        </div>
      </header>
      <div class="print-document-heading">
        <div class="print-document-brand">OLD MUTUAL UGANDA · SIMULATED CARD CHECKOUT</div>
        <h1>PAYMENT DEMO RECEIPT</h1>
        <p>${esc(title)} · ${esc(clientDescription)}</p>
      </div>
      <div class="print-demo-warning"><strong>DEMONSTRATION ONLY</strong><span>No actual card charge, deposit, insurance settlement, or unit trust allocation occurred.</span></div>
      <table class="print-detail-table" aria-label="Demo receipt details">
        <thead><tr class="print-table-label"><th colspan="2">Payment details — ${esc(t.id)}</th></tr><tr class="print-green-heading"><th>FIELD</th><th>DETAILS</th></tr></thead>
        <tbody>${rows}<tr class="print-total-row"><th scope="row">${investment?'Deposit amount (simulated)':'Total amount (simulated)'}</th><td>${esc(fmt(t.amount,t.currency))}</td></tr></tbody>
      </table>
      <div class="print-disclaimer">
        <strong>Important:</strong> This document is a test-environment demonstration, not a tax invoice, proof of payment, an investment confirmation, an insurance policy receipt, or evidence of unit allocations.
        No funds were charged or transferred.
      </div>
      <footer class="print-document-footer"><span>Old Mutual Uganda · Payments portal demo</span><span>Reference: ${esc(t.id)}</span></footer>
    </div>`;
}
function printDemoReceipt(t) {
  renderPrintReceipt(t);
  // The printable sheet contains a local brand image and is deliberately separate from the modal.
  const logo=document.querySelector('#print-receipt-sheet .print-wordmark');
  if (logo && !logo.complete) {
    const printOnce=()=>window.print();
    logo.addEventListener('load',printOnce,{once:true});
    logo.addEventListener('error',printOnce,{once:true});
  } else window.print();
}
function showResult(t) {
  const ok=t.status==='Approved', target=t.category==='OMIG'?'investor account':'insurance policy';
  $('modal-content').innerHTML=`<div class="result-icon ${ok?'':'result-failed'}">${icon(ok?'check':'error')}</div><h2 id="result-title">${ok?'Demo payment approved':'Demo payment declined'}</h2><p class="dialog-copy">${ok?`This sandbox card payment was simulated successfully. No funds were collected or posted to any ${target}.`:'The sandbox simulated a declined card payment. Nothing has been charged.'}</p><div class="receipt-box"><div><span>Transaction reference</span><strong>${esc(t.id)}</strong></div><div><span>Service</span><strong>${t.category==='OMIG'?'OMIG investments':'Insurance'}</strong></div><div><span>${t.category==='OMIG'?'Investor number':'Policy number'}</span><strong>${esc(t.reference)}</strong></div><div><span>${t.category==='OMIG'?'Unit trust':'Payment type'}</span><strong>${esc(t.product)}</strong></div><div><span>${t.category==='OMIG'?'Deposit type':'Description'}</span><strong>${esc(t.detail)}</strong></div><div><span>Test card</span><strong>•••• ${esc(t.last4)}</strong></div><div><span>Status</span><strong>${esc(t.status)} (simulation)</strong></div><div class="receipt-amount"><span>Demo total</span><strong>${fmt(t.amount,t.currency)}</strong></div></div><p class="receipt-note">Not a proof of payment, allocation of units, or a bank receipt.</p><div class="result-actions"><button id="copy-reference" type="button">Copy reference</button><button id="print-receipt" type="button">Print demo receipt</button></div>`;
  $('result-modal').hidden=false;
  $('copy-reference').addEventListener('click', async ()=>{
    try {await navigator.clipboard.writeText(t.id);$('copy-reference').textContent='Copied';}
    catch(_) {$('copy-reference').textContent=t.id;}
  });
  $('print-receipt').addEventListener('click',()=>printDemoReceipt(t));
}
function normalizeHistory(t) {return {...t,category:t.category==='OMIG'?'OMIG':'INSURANCE',reference:String(t.reference||t.policy||''),product:String(t.product||t.type||'Insurance premium'),detail:String(t.detail||t.type||'Insurance premium'),currency:t.currency==='USD'?'USD':'UGX'};}
function filteredHistory() {
  const q=$('transaction-search').value.trim().toLowerCase(), category=$('transaction-category').value, status=$('transaction-status').value;
  return history.map(normalizeHistory).filter(t=>(category==='all'||t.category===category)&&(status==='all'||t.status===status)&&(!q||`${t.id} ${t.reference} ${t.product} ${t.name||''}`.toLowerCase().includes(q)));
}
function statusHtml(v) {return `<span class="status-tag ${v==='Approved'?'approved':'declined'}">${esc(v)}</span>`;}
function renderNativeGrid(rows) {
  const mount=$('transaction-grid');
  if (!rows.length) {mount.innerHTML='<div class="empty-grid">No demo transactions match your filters.</div>';return;}
  mount.innerHTML=`<table class="native-table"><thead><tr><th>Reference</th><th>Service</th><th>Account / policy</th><th>Product</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody>${rows.map(t=>`<tr><td><strong>${esc(t.id)}</strong></td><td>${t.category==='OMIG'?'OMIG':'Insurance'}</td><td>${esc(t.reference)}</td><td>${esc(t.product)}</td><td>${dateText(t.date)}</td><td><strong>${fmt(t.amount,t.currency)}</strong></td><td>${statusHtml(t.status)}</td></tr>`).join('')}</tbody></table>`;
}
function renderExtGrid() {
  gridStore=window.Ext.create('Ext.data.Store',{fields:['id','category','reference','product','date','amount','currency','status'],data:history.map(normalizeHistory)});
  extGrid=window.Ext.create('Ext.grid.Panel',{renderTo:'transaction-grid',width:'100%',height:390,border:false,store:gridStore,columnLines:false,rowLines:true,scrollable:true,viewConfig:{stripeRows:false,emptyText:'No demo transactions match your filters.',deferEmptyText:false},columns:[
    {text:'Reference',dataIndex:'id',minWidth:145,flex:1.35,renderer:v=>`<strong>${esc(v)}</strong>`},
    {text:'Service',dataIndex:'category',minWidth:85,flex:.8,renderer:v=>v==='OMIG'?'OMIG':'Insurance'},
    {text:'Account / policy',dataIndex:'reference',minWidth:135,flex:1.2,renderer:esc},
    {text:'Product',dataIndex:'product',minWidth:145,flex:1.3,renderer:esc},
    {text:'Date',dataIndex:'date',minWidth:106,flex:.8,renderer:dateText},
    {text:'Amount',dataIndex:'amount',minWidth:115,flex:1,renderer:(v,metadata,record)=>fmt(v,record.get('currency'))},
    {text:'Status',dataIndex:'status',minWidth:100,flex:.8,renderer:statusHtml}
  ]});
}
function refreshTransactions() {
  const rows=filteredHistory();$('transaction-count').textContent=`${rows.length} transaction${rows.length===1?'':'s'}`;
  if (extAvailable && gridStore) gridStore.loadData(rows,false);
  else renderNativeGrid(rows);
  renderRecent();
}
function renderMetrics() {
  const completed=history.map(normalizeHistory),approved=completed.filter(t=>t.status==='Approved'),ugx=approved.filter(t=>t.currency==='UGX'),usd=approved.filter(t=>t.currency==='USD');
  $('metric-count').textContent=String(completed.length);
  $('metric-volume').textContent=fmt(ugx.reduce((a,t)=>a+Number(t.amount||0),0),'UGX');
  $('metric-volume-note').textContent=usd.length?`Plus ${fmt(usd.reduce((a,t)=>a+Number(t.amount||0),0),'USD')} in USD deposits`:'Insurance and OMIG deposits';
  $('metric-rate').textContent=completed.length?`${Math.round(approved.length/completed.length*100)}%`:'0%';
}
function renderRecent() {
  $('recent-activity').innerHTML=history.length?history.slice(0,5).map(normalizeHistory).map(t=>`<div class="recent-row"><span class="recent-icon ${t.category==='OMIG'?'recent-omig':''}">${icon(t.category==='OMIG'?'trending-up':'shield')}</span><div class="recent-desc"><strong>${esc(t.product)}</strong><small>${esc(t.reference)} · ${dateText(t.date)}</small></div><div class="recent-amount"><strong>${fmt(t.amount,t.currency)}</strong><small>${t.status==='Approved'?'Approved':'Declined'}</small></div></div>`).join(''):'<p class="no-activity">No simulated payments yet.</p>';
}
function bindUI() {
  document.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.route)));
  document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>navigate(el.dataset.go)));
  $('menu-button').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  $('pay-button').addEventListener('click',startPayment);
  $('fill-test-card').addEventListener('click',()=>{setValue('card','4242 4242 4242 4242');setValue('expiry','12/29');setValue('cvv','123');setValue('cardholder',getValue(currentCategory==='OMIG'?'investor-name':'ins-name'));clearError();});
  ['transaction-search','transaction-category','transaction-status'].forEach(id=>$(id).addEventListener(id==='transaction-search'?'input':'change',refreshTransactions));
  document.querySelectorAll('[data-close-modal]').forEach(b=>b.addEventListener('click',()=>$('result-modal').hidden=true));
  $('result-modal').addEventListener('click',e=>{if(e.target===$('result-modal'))$('result-modal').hidden=true;});
  $('otp-verify').addEventListener('click',verifyOTP);
  $('otp-input').addEventListener('keydown',e=>{if(e.key==='Enter')verifyOTP();});
  $('otp-input').addEventListener('input',()=>{$('otp-input').value=digits($('otp-input').value).slice(0,6);});
  $('close-otp').addEventListener('click',closeOTP);$('otp-cancel').addEventListener('click',closeOTP);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('otp-modal').hidden)closeOTP();else $('result-modal').hidden=true;}});
}
function loadScript(url,timeout=2400) {
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=url;
    const timer=setTimeout(()=>{script.remove();reject(new Error('Ext JS loading timed out'));},timeout);
    script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('Unable to load Ext JS'));};document.head.appendChild(script);
  });
}
function attachTheme(url) {
  const link=document.createElement('link');link.rel='stylesheet';link.href=url;
  const ours=document.querySelector('link[href="/src/styles.css"]');
  if (ours) document.head.insertBefore(link,ours);else document.head.appendChild(link);
}
async function loadExt() {
  const candidates=[
    {js:'/ext/build/ext-all.js',css:'/ext/build/classic/theme-triton/resources/theme-triton-all.css'},
    {js:'https://cdn.sencha.com/ext/gpl/7.0.0/build/ext-all.js',css:'https://cdn.sencha.com/ext/gpl/7.0.0/build/classic/theme-triton/resources/theme-triton-all.css'}
  ];
  for (const candidate of candidates) {
    try {await loadScript(candidate.js); if(window.Ext?.onReady){attachTheme(candidate.css);return true;}}
    catch (_) {/* SDK unavailable; try another source */}
  }
  return false;
}
async function init() {
  bindUI();renderMetrics();renderRecent();
  const ready=await loadExt();
  if (ready) {
    try {
      await Promise.race([new Promise(resolve=>window.Ext.onReady(resolve)),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Ext JS ready timeout')),3500))]);
      extAvailable=true;renderExtFields();renderExtGrid();
      document.documentElement.dataset.ui='extjs';$('runtime-label').textContent='Ext JS Classic';
    } catch(err) {
      console.warn('Ext JS initialization unsuccessful; switching to native controls.',err);
      extAvailable=false;
      Object.keys(fields).forEach(n=>{try{fields[n]?.destroy?.();}catch(_){} delete fields[n];});
      fieldDefs.forEach(def=>{$(`field-${def.name}`).innerHTML='';});$('transaction-grid').innerHTML='';
      renderNativeFields();document.documentElement.dataset.ui='native-fallback';$('runtime-label').textContent='Native fallback';
    }
  } else {
    renderNativeFields();document.documentElement.dataset.ui='native-fallback';$('runtime-label').textContent='Native fallback';
  }
  chooseCategory('INSURANCE');refreshTransactions();renderMetrics();
}
init();
