"use client";

import * as React from "react";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2,
  ClipboardCheck, Copy, CreditCard, Info, LayoutDashboard, LockKeyhole,
  Menu, Printer, ReceiptText, Search, ShieldCheck, TrendingUp, Wallet, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { H1, H3, Muted } from "@/components/ui/typography";
import {
  currencyForFund, digits, formatCard, formatExpiry, FUNDS, INSURANCE_TYPES, DEPOSIT_TYPES,
  loadHistory, money, newTransactionId, receiptDate, saveHistory, TEST_CARDS,
  validExpiry, type Currency, type PaymentCategory, type Transaction
} from "@/lib/payments";
import { cn } from "@/lib/utils";

type Screen = "overview" | "insurance" | "omig" | "transactions";
type Step = 1 | 2 | 3;
type InsuranceForm = { policy: string; name: string; email: string; product: string; amount: string };
type InvestmentForm = { investor: string; name: string; email: string; fund: string; contribution: string; amount: string };
type CardForm = { card: string; name: string; expiry: string; cvv: string };
const initialInsurance: InsuranceForm = { policy:"POL-DEMO-10482", name:"Demo Customer",email:"demo@example.com",product:"Insurance premium",amount:"185000" };
const initialInvestment: InvestmentForm = { investor:"INV-DEMO-0031",name:"Demo Investor",email:"investor@example.com",fund:"Money Market Fund",contribution:"Additional deposit",amount:"350000" };
const initialCard: CardForm = { card:"",name:"Demo Customer",expiry:"",cvv:"" };
const navItems: { title: string;items: {key:Screen;label:string;icon:typeof LayoutDashboard}[] }[] = [
  {title:"Workspace",items:[{key:"overview",label:"Overview",icon:LayoutDashboard}]},
  {title:"Make a payment",items:[{key:"insurance",label:"Insurance payments",icon:ShieldCheck},{key:"omig",label:"OMIG investments",icon:TrendingUp}]},
  {title:"Reporting",items:[{key:"transactions",label:"Transactions",icon:ReceiptText}]},
];
const screenTitles:Record<Screen,string>={overview:"Overview",insurance:"Insurance payments",omig:"OMIG investments",transactions:"Transactions"};

function FormField({ id, label, note, required=true, children, className }: {
  id:string;label:string;note?:string;required?:boolean;children:React.ReactNode;className?:string;
}) {
  return <div className={className}><Label htmlFor={id}>{label}{required && <span className="text-primary" aria-hidden="true">*</span>}</Label>{children}{note && <p className="portal-field-note">{note}</p>}</div>;
}
function DropField({ id, label, value, options, onChange, note, className }: {
  id:string;label:string;value:string;options:readonly string[];onChange:(v:string)=>void;note?:string;className?:string;
}) {
  return <FormField id={id} label={label} note={note} className={className}><Select value={value} onValueChange={onChange}><SelectTrigger id={id} aria-label={label}><SelectValue /></SelectTrigger><SelectContent>{options.map(option=><SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></FormField>;
}
function Stepper({ step }: {step:Step}) {
  return <div className="portal-steps" aria-label={`Step ${step} of 3`}>
    {(["Payment details", "Card verification", "Confirmation"] as const).map((name,i)=><React.Fragment key={name}>
      {i>0 && <div className="portal-step-line" aria-hidden="true" />}
      <div className={cn("portal-step",step===i+1&&"current",step>i+1&&"done")} aria-current={step===i+1?"step":undefined}>
        <span className="portal-step-number">{step>i+1?<Check size={14}/>:String(i+1).padStart(2,"0")}</span><span>{name}</span>
      </div>
    </React.Fragment>)}
  </div>;
}
function PaymentStatusBadge({ status }: {status:Transaction["status"]}) {
  return <Badge className={status==="Approved"?"portal-status-approved":"portal-status-declined"}>{status}</Badge>;
}
function ReceiptPrint({ t }: {t:Transaction}) {
  const investment=t.category==="OMIG";
  const rows:[string,string][]=[
    ["Transaction reference",t.id],
    ["Payment category",investment?"OMIG — investment deposit":"Insurance payment"],
    [investment?"Investor / client number":"Policy number",t.reference],
    [investment?"Unit trust fund":"Payment type",t.product],
    [investment?"Deposit type":"Description",t.detail],
    ["Payment date",receiptDate(t.date)],
    ["Test card","•••• " + t.last4],
    ["Simulation status",t.status.toUpperCase()+" (DEMO)"],
    ["Currency",t.currency],
  ];
  return <article className="portal-receipt-print" aria-label="Branded printable simulated payment receipt">
    <header className="receipt-letterhead">
      <Image src="/brand/old-mutual-wordmark.png" alt="Old Mutual" width={265} height={58} priority />
      <div className="receipt-contact">
        <strong>{investment?"Old Mutual Uganda — OMIG demonstration":"Old Mutual Insurance Uganda Limited"}</strong>
        <span>Nakawa Business Park, Plot 3–5 New Port Bell Road</span>
        <span>P.O. Box 7185 Kampala, Uganda</span>
        <span>Tel: +256 414 332700, 0200 507200</span>
        <span>Toll Free: 0800132700</span>
        <span>info-gi@oldmutual.co.ug</span>
        <span>www.oldmutual.co.ug</span>
      </div>
    </header>
    <section className="receipt-document-title"><p>OLD MUTUAL UGANDA / PAYMENTS</p><h1>PAYMENT DEMO RECEIPT</h1><p>{investment?"UNIT TRUST DEPOSIT":"INSURANCE PAYMENT"} · {t.id}</p></section>
    <div className="receipt-demo-strip"><strong>DEMONSTRATION ONLY</strong><span>No actual card payment, insurance settlement, or unit allocation occurred.</span></div>
    <table className="receipt-data-table"><thead><tr className="receipt-table-green"><th>PAYMENT DETAILS</th><th>{t.id}</th></tr></thead><tbody>
      {rows.map(([key,value])=><tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>)}
      <tr className="receipt-amount"><th scope="row">{investment?"Deposit amount (simulated)":"Total amount (simulated)"}</th><td>{money(t.amount,t.currency)}</td></tr>
    </tbody></table>
    <p className="receipt-legal"><strong>Important:</strong> This document is not a tax invoice, receipt of actual funds, proof of payment, insurance settlement, investment confirmation, or unit allocation. Only predefined test card numbers are supported; this document is generated locally in the demonstration environment.</p>
    <footer className="receipt-bottom"><span>Old Mutual Uganda · Unofficial payments portal prototype</span><span>Reference: {t.id}</span></footer>
  </article>;
}

export function PaymentsPortal() {
  const [screen,setScreen]=React.useState<Screen>("overview");
  const [sidebarOpen,setSidebarOpen]=React.useState(false);
  const [step,setStep]=React.useState<Step>(1);
  const [ins,setIns]=React.useState<InsuranceForm>(initialInsurance);
  const [invest,setInvest]=React.useState<InvestmentForm>(initialInvestment);
  const [card,setCard]=React.useState<CardForm>(initialCard);
  const [history,setHistory]=React.useState<Transaction[]>([]);
  const [hydrated,setHydrated]=React.useState(false);
  const [error,setError]=React.useState("");
  const [busy,setBusy]=React.useState(false);
  const [pending,setPending]=React.useState<Transaction|null>(null);
  const [otp,setOtp]=React.useState("");
  const [otpError,setOtpError]=React.useState("");
  const [receipt,setReceipt]=React.useState<Transaction|null>(null);
  const [resultOpen,setResultOpen]=React.useState(false);
  const [search,setSearch]=React.useState("");
  const [serviceFilter,setServiceFilter]=React.useState("all");
  const [statusFilter,setStatusFilter]=React.useState("all");
  const [copied,setCopied]=React.useState(false);
  const category:PaymentCategory=screen==="omig"?"OMIG":"INSURANCE";
  const isInvestment=category==="OMIG";
  const currency:Currency=isInvestment?currencyForFund(invest.fund):"UGX";
  const rawAmount=isInvestment?invest.amount:ins.amount;
  const amount=Number(rawAmount)||0;
  const currentReference=isInvestment?invest.investor:ins.policy;
  const currentProduct=isInvestment?invest.fund:ins.product;
  const currentDetail=isInvestment?invest.contribution:ins.product;
  const currentName=isInvestment?invest.name:ins.name;
  const currentEmail=isInvestment?invest.email:ins.email;

  React.useEffect(()=>{setHistory(loadHistory());setHydrated(true);},[]);
  const navigate=(next:Screen)=>{
    setScreen(next);setSidebarOpen(false);setStep(1);setError("");setCard(initialCard);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const updateIns=(key:keyof InsuranceForm,value:string)=>{setIns(old=>({...old,[key]:value}));setError("");};
  const updateInvest=(key:keyof InvestmentForm,value:string)=>{setInvest(old=>({...old,[key]:value}));setError("");};
  const updateCard=(key:keyof CardForm,value:string)=>{setCard(old=>({...old,[key]:value}));setError("");};
  const commit=(t:Transaction)=>{
    setHistory(previous=>{const next=[t,...previous].slice(0,150);saveHistory(next);return next;});
    setReceipt(t);setCopied(false);setResultOpen(true);setStep(3);
  };
  const validDetails=()=>{
    if(currentReference.trim().length<5||currentReference.trim().length>60) return `Enter a valid demo ${isInvestment?"investor / client":"policy"} number (5–60 characters).`;
    if(currentName.trim().length<2||currentName.trim().length>100) return "Enter a valid policyholder or investor name.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)||currentEmail.length>150) return "Enter a valid demo receipt email address.";
    if(isInvestment&&(!FUNDS.some(f=>f===invest.fund)||!DEPOSIT_TYPES.some(d=>d===invest.contribution))) return "Select a unit trust and deposit type.";
    if(!isInvestment&&!INSURANCE_TYPES.some(t=>t===ins.product)) return "Select a valid insurance payment type.";
    if(!Number.isFinite(amount)||amount<=0||(currency==="UGX"? !Number.isSafeInteger(amount)||amount>100000000 : Math.abs(Math.round(amount*100)-amount*100)>1e-7||amount>100000)) return currency==="UGX"?"Enter a whole UGX amount from 1 to 100,000,000.":"Enter a USD amount from 0.01 to 100,000 with up to 2 decimals.";
    return "";
  };
  const continueToCard=()=>{const message=validDetails();if(message){setError(message);return;}setError("");setCard(old=>({...old,name:currentName}));setStep(2);window.scrollTo({top:0,behavior:"smooth"});};
  const simulate=()=>{
    if(busy||pending)return;
    const outcome=TEST_CARDS[digits(card.card) as keyof typeof TEST_CARDS];
    if(!outcome) {setError("Only the three listed sandbox test cards are accepted. Please do not enter a real card number.");return;}
    if(card.name.trim().length<2){setError("Enter the name on the demonstration card.");return;}
    if(!validExpiry(card.expiry)){setError("Enter a valid future expiry in MM/YY format.");return;}
    if(!/^\d{3,4}$/.test(card.cvv)){setError("Enter the 3–4 digit sandbox CVV.");return;}
    const validation=validDetails();if(validation){setError(validation);setStep(1);return;}
    setError("");setBusy(true);
    const t:Transaction={id:newTransactionId(),category,reference:currentReference.trim(),product:currentProduct,detail:currentDetail,currency,amount,status:outcome==="Declined"?"Declined":"Approved",last4:digits(card.card).slice(-4),date:new Date().toISOString()};
    // Delete raw card number, expiry and CVV from state BEFORE processing (no persistence or network call).
    setCard({card:"",name:card.name,expiry:"",cvv:""});
    window.setTimeout(()=>{setBusy(false);if(outcome==="Challenge"){setPending(t);setOtp("");setOtpError("");}else{commit(t);}},300);
  };
  const verifyOtp=()=>{if(!pending)return;if(otp!=="123456"){setOtpError("Incorrect demo code. Use 123456.");return;}const t=pending;setPending(null);setOtp("");commit(t);};
  const copyReference=async()=>{if(!receipt)return;try{await navigator.clipboard.writeText(receipt.id);setCopied(true);}catch{setCopied(false);}};
  const printReceipt=()=>{
    // Scope print-only CSS to the explicit receipt action. Normal browser Print still prints the portal.
    document.documentElement.classList.add("receipt-print-mode");
    window.addEventListener("afterprint",()=>document.documentElement.classList.remove("receipt-print-mode"),{once:true});
    window.print();
  };
  const viewReceipt=(t:Transaction)=>{setReceipt(t);setCopied(false);setResultOpen(true);};
  const filtered=history.filter(t=>(serviceFilter==="all"||t.category===serviceFilter)&&(statusFilter==="all"||t.status===statusFilter)&&`${t.id} ${t.reference} ${t.product} ${t.detail}`.toLowerCase().includes(search.toLowerCase()));
  const approved=history.filter(t=>t.status==="Approved");
  const approvedCount=approved.length;
  const totalHistory=history.length;
  const conversion=totalHistory?Math.round(approvedCount*100/totalHistory):0;
  const ugxTotal=approved.filter(t=>t.currency==="UGX").reduce((total,t)=>total+t.amount,0);

  const table=(records:Transaction[],compact=false)=><Table><TableHeader><TableRow>
    <TableHead>Reference</TableHead><TableHead>Service</TableHead><TableHead>Product</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Date</TableHead>
  </TableRow></TableHeader><TableBody>
  {records.length?records.map(t=><TableRow key={`${t.id}-${t.date}`} className="cursor-pointer" onClick={()=>viewReceipt(t)} title="View demo receipt">
    <TableCell><button type="button" className="font-mono text-xs font-medium text-primary hover:underline" onClick={e=>{e.stopPropagation();viewReceipt(t);}}>{t.id}</button><div className="mt-1 text-xs text-muted-foreground">{t.reference}</div></TableCell>
    <TableCell>{t.category==="OMIG"?"OMIG investments":"Insurance"}</TableCell>
    <TableCell className="max-w-40 truncate">{t.product}</TableCell>
    <TableCell className="whitespace-nowrap font-medium">{money(t.amount,t.currency)}</TableCell><TableCell><PaymentStatusBadge status={t.status}/></TableCell>
    <TableCell className="whitespace-nowrap text-right text-muted-foreground">{new Date(t.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</TableCell>
  </TableRow>):<TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">{compact?"No demo transactions yet.":"No transactions match your filters."}</TableCell></TableRow>}
  </TableBody></Table>;

  return <>
    <div className="portal-shell">
      <div className={cn("portal-backdrop",sidebarOpen&&"open")} onClick={()=>setSidebarOpen(false)} aria-hidden="true" />
      <aside className={cn("portal-sidebar",sidebarOpen&&"open")} aria-label="Primary navigation">
        <div className="portal-brand"><Image src="/brand/old-mutual-wordmark.png" alt="Old Mutual" width={212} height={47} priority/><small>UGANDA&nbsp;&nbsp;—&nbsp;&nbsp;PAYMENTS</small></div>
        <nav className="portal-menu" aria-label="Payment portal sections">
          {navItems.map(group=><div className="portal-menu-group" key={group.title}><h2 className="portal-menu-title">{group.title}</h2>
            {group.items.map(item=>{const Icon=item.icon;return <button key={item.key} type="button" className={cn("portal-link",screen===item.key&&"active")} onClick={()=>navigate(item.key)} aria-current={screen===item.key?"page":undefined}><Icon strokeWidth={1.8}/><span>{item.label}</span></button>;})}
          </div>)}
        </nav>
        <div className="portal-sidebar-foot"><div className="portal-side-note"><Image src="/brand/old-mutual-emblem.png" alt="Old Mutual emblem" width={29} height={31}/><strong className="mt-2 block text-xs font-semibold">Every payment, one place.</strong><p>Insurance and investment demo payments in a single workspace.</p></div></div>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar"><div className="flex min-w-0 items-center gap-3">
          <Button size="icon" variant="ghost" className="portal-mobile-toggle" aria-label="Open navigation" onClick={()=>setSidebarOpen(true)}><Menu/></Button>
          <div className="portal-crumb"><span>Old Mutual</span><span className="slash">/</span><strong>{screenTitles[screen]}</strong></div>
        </div><div className="portal-topbar-right"><span className="hidden text-xs text-muted-foreground sm:inline">Uganda</span><span className="portal-avatar" aria-label="Demo user">OM</span></div></header>
        <main className="portal-content">
          {screen==="overview" && <>
            <div className="portal-overline"><span>Payments</span><span className="dash"/><span>Overview</span></div>
            <H1 className="text-[36px] sm:text-[42px]">Payments overview</H1>
            <p className="portal-subtitle">Insurance premiums and investment contributions, all in one place.</p>
            <div className="portal-stats">
              <div className="portal-panel portal-stat"><div className="portal-stat-label">Approved demo volume · UGX</div><div className="portal-stat-value">{hydrated?money(ugxTotal):"—"}</div><Muted className="mt-1">USD deposits tracked separately</Muted></div>
              <div className="portal-panel portal-stat"><div className="portal-stat-label">Transactions</div><div className="portal-stat-value">{hydrated?totalHistory:"—"}</div><Muted className="mt-1">Local demonstration history</Muted></div>
              <div className="portal-panel portal-stat"><div className="portal-stat-label">Approval rate</div><div className="portal-stat-value">{hydrated?`${conversion}%`:"—"}</div><Muted className="mt-1">Simulated outcomes only</Muted></div>
            </div>
            <div className="portal-quick-links">
              <button type="button" onClick={()=>navigate("insurance")} className="portal-panel portal-quick-link"><div><div className="portal-icon-tile mb-4"><ShieldCheck size={20}/></div><H3>Insurance payment</H3><p>Premiums, renewals and top-ups</p></div><ArrowUpRight className="size-5 text-primary"/></button>
              <button type="button" onClick={()=>navigate("omig")} className="portal-panel portal-quick-link"><div><div className="portal-icon-tile mb-4"><TrendingUp size={20}/></div><H3>OMIG investments</H3><p>Unit trust deposits in UGX or USD</p></div><ArrowUpRight className="size-5 text-primary"/></button>
            </div>
            <div className="portal-panel portal-table-panel mt-7"><div className="portal-table-header"><div><h2 className="portal-table-heading">Recent transactions</h2><p className="portal-table-muted">Latest simulated payments</p></div><Button size="sm" variant="outline" onClick={()=>navigate("transactions")}>View all <ArrowRight/></Button></div>{table(history.slice(0,5),true)}</div>
          </>}
          {(screen==="insurance"||screen==="omig") && <>
            <div className="portal-overline"><span>Old Mutual</span><span className="dash"/><span>{isInvestment?"Investments":"Insurance"}</span></div>
            <H1 className="text-[36px] sm:text-[42px]">{isInvestment?"OMIG investment deposit":"Insurance payment"}<span className="text-primary">.</span></H1>
            <p className="portal-subtitle">{isInvestment?"Make a simulated deposit to an OMIG unit trust fund.":"Pay a policy premium, renewal or top-up with a sandbox test card."}</p>
            <Stepper step={step}/>
            <div className="portal-payment-grid">
              <section className="portal-panel portal-form-pad" aria-label={step===1?"Payment details":step===2?"Card details":"Confirmation"}>
                {step===1 && <>
                  <div className="portal-sectionhead"><div className="portal-section-icon">01</div><div><h2>Payment details</h2><p>{isInvestment?"Select a unit trust and identify the investor account.":"Tell us which policy you are paying for."}</p></div></div>
                  {isInvestment?<div className="portal-input-grid">
                    <DropField id="fund" label="Unit trust fund" value={invest.fund} options={FUNDS} onChange={v=>{updateInvest("fund",v);updateInvest("amount",v==="Dollar Fund"?"250":"350000");}} className="portal-col-2" note={invest.fund==="Dollar Fund"?"USD-denominated demonstration; no currency conversion.":"UGX-denominated demonstration."}/>
                    <FormField id="investor" label="Investor / client number" className="portal-col-2"><Input id="investor" value={invest.investor} maxLength={60} onChange={e=>updateInvest("investor",e.target.value)} placeholder="INV-DEMO-0031"/></FormField>
                    <FormField id="investor-name" label="Investor name"><Input id="investor-name" value={invest.name} maxLength={100} onChange={e=>updateInvest("name",e.target.value)}/></FormField>
                    <FormField id="investor-email" label="Email for receipt"><Input id="investor-email" type="email" value={invest.email} maxLength={150} onChange={e=>updateInvest("email",e.target.value)}/></FormField>
                    <DropField id="contribution" label="Deposit type" value={invest.contribution} options={DEPOSIT_TYPES} onChange={v=>updateInvest("contribution",v)}/>
                    <FormField id="invest-amount" label={`Amount (${currency})`}><Input id="invest-amount" inputMode="decimal" type="number" min="0" step={currency==="USD"?"0.01":"1"} value={invest.amount} onChange={e=>updateInvest("amount",e.target.value)}/></FormField>
                  </div>:<div className="portal-input-grid">
                    <FormField id="policy" label="Policy number" className="portal-col-2"><Input id="policy" value={ins.policy} maxLength={60} onChange={e=>updateIns("policy",e.target.value)} placeholder="POL-DEMO-10482"/></FormField>
                    <FormField id="ins-name" label="Policyholder name"><Input id="ins-name" value={ins.name} maxLength={100} onChange={e=>updateIns("name",e.target.value)}/></FormField>
                    <FormField id="ins-email" label="Email for receipt"><Input id="ins-email" type="email" value={ins.email} maxLength={150} onChange={e=>updateIns("email",e.target.value)}/></FormField>
                    <DropField id="insurance-type" label="Payment type" value={ins.product} options={INSURANCE_TYPES} onChange={v=>updateIns("product",v)}/>
                    <FormField id="ins-amount" label="Amount (UGX)"><Input id="ins-amount" type="number" inputMode="numeric" min="1" step="1" value={ins.amount} onChange={e=>updateIns("amount",e.target.value)}/></FormField>
                  </div>}
                  {error && <p role="alert" className="portal-field-error">{error}</p>}
                  <Button className="mt-7 w-full sm:w-auto" onClick={continueToCard}>Continue to card verification <ArrowRight/></Button>
                </>}
                {step===2 && <>
                  <div className="portal-sectionhead"><div className="portal-section-icon"><CreditCard size={20}/></div><div><h2>Card verification</h2><p>Complete this payment with a simulated test card.</p></div></div>
                  <div className="portal-card-hint"><strong>Test cards only.</strong> Approved: <code className="font-mono">4242 4242 4242 4242</code>. Declined: <code className="font-mono">4000 0000 0000 0002</code>. OTP: <code className="font-mono">4000 0000 0000 3220</code>. Never enter a real card.</div>
                  <div className="portal-input-grid mt-6">
                    <FormField id="card-number" label="Test card number" className="portal-col-2"><Input id="card-number" inputMode="numeric" autoComplete="off" value={card.card} maxLength={19} placeholder="0000 0000 0000 0000" onChange={e=>updateCard("card",formatCard(e.target.value))}/></FormField>
                    <FormField id="card-holder" label="Cardholder name" className="portal-col-2"><Input id="card-holder" maxLength={100} autoComplete="off" value={card.name} onChange={e=>updateCard("name",e.target.value)}/></FormField>
                    <FormField id="expiry" label="Expiry (MM/YY)"><Input id="expiry" inputMode="numeric" placeholder="12/29" autoComplete="off" maxLength={5} value={card.expiry} onChange={e=>updateCard("expiry",formatExpiry(e.target.value))}/></FormField>
                    <FormField id="cvv" label="Test CVV"><Input id="cvv" type="password" inputMode="numeric" autoComplete="off" maxLength={4} placeholder="•••" value={card.cvv} onChange={e=>updateCard("cvv",digits(e.target.value).slice(0,4))}/></FormField>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3"><Button size="sm" variant="outline" onClick={()=>setCard({card:"4242 4242 4242 4242",name:currentName,expiry:"12/29",cvv:"123"})}>Fill approved test card</Button><span className="text-xs text-muted-foreground">OTP demo code: 123456</span></div>
                  {error && <p role="alert" className="portal-field-error">{error}</p>}
                  <div className="mt-7 flex flex-wrap gap-3"><Button variant="outline" onClick={()=>{setStep(1);setError("");}}><ArrowLeft/> Back</Button><Button disabled={busy} onClick={simulate}><LockKeyhole/>{busy?"Simulating…":`Simulate ${money(amount,currency)}`} <ArrowRight/></Button></div>
                </>}
                {step===3 && <>
                  <div className="portal-sectionhead"><div className="portal-section-icon"><ClipboardCheck size={21}/></div><div><h2>Simulation complete</h2><p>Review your transaction details or begin another demo.</p></div></div>
                  {receipt&&<div className="rounded-md bg-muted px-5 py-4"><div className="flex items-center justify-between gap-3"><span className="text-sm text-muted-foreground">Latest transaction</span><PaymentStatusBadge status={receipt.status}/></div><p className="mt-3 font-mono text-sm">{receipt.id}</p><p className="mt-1 text-xl font-semibold">{money(receipt.amount,receipt.currency)}</p></div>}
                  <div className="mt-6 flex flex-wrap gap-3"><Button onClick={()=>{setStep(1);setCard(initialCard);setError("");}}>New demo payment <ArrowRight/></Button>{receipt&&<Button variant="outline" onClick={()=>setResultOpen(true)}><ReceiptText/> View receipt</Button>}</div>
                </>}
              </section>
              <aside className="portal-panel portal-summary" aria-label="Order summary">
                <div className="portal-overline !mb-0">Your payment</div><h2 className="mt-1 text-lg font-semibold tracking-tight">Order summary</h2>
                <div className="portal-summary-head"><div className="portal-icon-tile">{isInvestment?<Wallet size={20}/>:<ReceiptText size={20}/>}</div><div><p className="text-sm font-medium">{currentProduct}</p><p className="mt-0.5 text-xs text-muted-foreground">{isInvestment?"Old Mutual Investment Group":"Old Mutual Insurance"}</p></div></div>
                <div className="portal-amount-row"><span>{isInvestment?"Deposit amount":"Premium amount"}</span><strong>{money(amount,currency)}</strong></div>
                <div className="portal-amount-row"><span>Demo processing fee</span><strong>{money(0,currency)}</strong></div>
                <div className="portal-total"><span>Total to simulate</span><strong>{money(amount,currency)}</strong></div>
                <p className="portal-summary-hint">{currency==="UGX"?"Currency: Ugandan shillings":"Currency: United States dollars"}</p>
                <div className="portal-help"><Info size={15}/><p>Demo calculations only. The displayed zero fee does not represent live processing charges, insurance coverage or investment pricing.</p></div>
              </aside>
            </div>
          </>}
          {screen==="transactions"&&<>
            <div className="portal-overline"><span>Old Mutual</span><span className="dash"/><span>Reporting</span></div>
            <H1 className="text-[36px] sm:text-[42px]">Transaction history</H1><p className="portal-subtitle">Search, filter, and print receipts for simulated payments.</p>
            <div className="portal-panel portal-table-panel mt-8"><div className="portal-table-header"><div><h2 className="portal-table-heading">All transactions</h2><p className="portal-table-muted">Stored locally in this browser only · {hydrated?filtered.length:0} results</p></div>
              <div className="portal-table-filters"><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground"/><Input aria-label="Search transactions" placeholder="Search references…" className="h-10 w-48 pl-9" value={search} onChange={e=>setSearch(e.target.value)}/></div>
                <Select value={serviceFilter} onValueChange={setServiceFilter}><SelectTrigger aria-label="Filter by service" className="h-10 w-36"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All services</SelectItem><SelectItem value="INSURANCE">Insurance</SelectItem><SelectItem value="OMIG">OMIG</SelectItem></SelectContent></Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger aria-label="Filter by status" className="h-10 w-36"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Declined">Declined</SelectItem></SelectContent></Select>
              </div>
            </div>{table(filtered)}<div className="px-6 py-4 text-xs text-muted-foreground">Transactions are simulated and are not bank or investment records.</div></div>
          </>}
        </main>
        <footer className="portal-footer"><span>Old Mutual Uganda · Unofficial demonstration prototype</span><span>No real payments, settlement or investment allocations</span></footer>
      </div>
    </div>
    <Dialog open={Boolean(pending)} onOpenChange={open=>{if(!open){setPending(null);setOtp("");setOtpError("");}}}>
      <DialogContent><DialogHeader><div className="portal-icon-tile mb-4"><LockKeyhole size={20}/></div><DialogTitle>Verify demo payment</DialogTitle><DialogDescription>Enter the fixed demonstration code to approve this simulated card payment.</DialogDescription></DialogHeader>
        <div className="mt-6"><Label htmlFor="demo-otp">Demo one-time code</Label><Input id="demo-otp" inputMode="numeric" maxLength={6} autoComplete="off" placeholder="6-digit code" value={otp} onChange={e=>{setOtp(digits(e.target.value).slice(0,6));setOtpError("");}}/><p className="mt-2 text-xs text-muted-foreground">Use <strong className="font-mono">123456</strong> to continue.</p>{otpError&&<p role="alert" className="portal-field-error">{otpError}</p>}</div>
        <Button className="mt-5 w-full" onClick={verifyOtp}>Verify demo payment <ArrowRight/></Button>
      </DialogContent>
    </Dialog>
    <Dialog open={resultOpen && Boolean(receipt)} onOpenChange={setResultOpen}>
      {receipt&&<DialogContent><DialogHeader><div className={cn("portal-icon-tile mb-4",receipt.status==="Declined"&&"!bg-red-50 !text-red-600")}>{receipt.status==="Approved"?<CheckCircle2 size={22}/>:<XCircle size={22}/>}</div><DialogTitle>{receipt.status==="Approved"?"Demo payment approved":"Demo payment declined"}</DialogTitle><DialogDescription>{receipt.status==="Approved"?"The sandbox transaction was approved. No funds were charged or posted.":"The sandbox transaction was declined. No funds were charged."}</DialogDescription></DialogHeader>
        <dl className="mt-6 divide-y divide-border rounded-md border border-border px-4">
          {[["Transaction reference",receipt.id],["Service",receipt.category==="OMIG"?"OMIG investments":"Insurance"],[receipt.category==="OMIG"?"Investor number":"Policy number",receipt.reference],[receipt.category==="OMIG"?"Fund":"Payment type",receipt.product],["Test card","•••• "+receipt.last4],["Status",receipt.status+" (simulation)"],["Total",money(receipt.amount,receipt.currency)]].map(([label,value])=><div key={label} className="flex items-start justify-between gap-4 py-2.5 text-sm"><dt className="text-muted-foreground">{label}</dt><dd className="text-right font-medium break-all">{value}</dd></div>)}
        </dl><Muted className="mt-4">Not proof of payment, a tax invoice, policy coverage, or unit allocation.</Muted>
        <div className="mt-6 flex flex-wrap gap-3"><Button variant="outline" onClick={copyReference}>{copied?<Check/>:<Copy/>}{copied?"Copied":"Copy reference"}</Button><Button onClick={printReceipt}><Printer/> Print demo receipt</Button></div>
      </DialogContent>}
    </Dialog>
    {receipt&&<ReceiptPrint t={receipt}/>}
  </>;
}
