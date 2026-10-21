export type PaymentCategory = "INSURANCE" | "OMIG";
export type PaymentStatus = "Approved" | "Declined";
export type Currency = "UGX" | "USD";
export type Transaction = {
  id: string;
  category: PaymentCategory;
  reference: string;
  product: string;
  detail: string;
  currency: Currency;
  amount: number;
  status: PaymentStatus;
  last4: string;
  date: string;
};

export const STORE_KEY = "om_payments_demo_v2";
export const FUNDS = ["Umbrella Fund", "Money Market Fund", "Balanced Fund", "Dollar Fund"] as const;
export const INSURANCE_TYPES = ["Insurance premium", "Policy renewal", "Policy top-up"] as const;
export const DEPOSIT_TYPES = ["Initial deposit", "Additional deposit"] as const;
export const TEST_CARDS = {
  "4242424242424242": "Approved",
  "4000000000000002": "Declined",
  "4000000000003220": "Challenge",
} as const;
export const digits = (value: string) => value.replace(/\D/g, "");
export const formatCard = (v: string) => digits(v).slice(0,16).replace(/(.{4})/g,"$1 ").trim();
export const formatExpiry = (v: string) => { const d=digits(v).slice(0,4); return d.length>2 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };
export const currencyForFund = (fund: string): Currency => fund === "Dollar Fund" ? "USD" : "UGX";
export function money(value: number, currency: Currency = "UGX") {
  return `${currency} ${Number(value || 0).toLocaleString("en-UG", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  })}`;
}
export function receiptDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day:"2-digit",month:"long",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"Africa/Kampala",
  }) + " EAT";
}
const seed = (days: number) => new Date(Date.now() - days*86400000).toISOString();
export function seedHistory(): Transaction[] {
  return [
    { id:"OM-SIM-2418",category:"OMIG",reference:"INV-DEMO-0031",product:"Money Market Fund",detail:"Additional deposit",currency:"UGX",amount:350000,status:"Approved",last4:"4242",date:seed(.5) },
    { id:"OM-SIM-2417",category:"INSURANCE",reference:"POL-DEMO-10482",product:"Insurance premium",detail:"Insurance premium",currency:"UGX",amount:185000,status:"Approved",last4:"4242",date:seed(1.3) },
    { id:"OM-SIM-2416",category:"OMIG",reference:"INV-DEMO-0054",product:"Umbrella Fund",detail:"Initial deposit",currency:"UGX",amount:100000,status:"Approved",last4:"4242",date:seed(2.4) },
    { id:"OM-SIM-2415",category:"INSURANCE",reference:"POL-DEMO-10311",product:"Policy renewal",detail:"Policy renewal",currency:"UGX",amount:95000,status:"Declined",last4:"0002",date:seed(4.1) },
  ];
}
function isTransaction(t: unknown): t is Transaction {
  if (!t || typeof t !== "object") return false;
  const r=t as Partial<Transaction>;
  return typeof r.id==="string" && typeof r.reference==="string" && typeof r.product==="string" && typeof r.amount==="number" && Number.isFinite(r.amount) && (r.status==="Approved"||r.status==="Declined") && (r.category==="OMIG"||r.category==="INSURANCE") && (r.currency==="UGX"||r.currency==="USD") && typeof r.date==="string" && Number.isFinite(Date.parse(r.date)) && typeof r.detail==="string" && typeof r.last4==="string";
}
export function loadHistory(): Transaction[] {
  try {
    const stored=JSON.parse(localStorage.getItem(STORE_KEY) ?? "null") as unknown;
    if (Array.isArray(stored)) return stored.filter(isTransaction).slice(0,150);
    const first=JSON.parse(localStorage.getItem("om_card_demo_transactions_v1") ?? "null") as unknown;
    if (Array.isArray(first)) return first.flatMap((entry):Transaction[] => {
      const t=entry as Record<string,unknown>;
      if (typeof t.id!=="string") return [];
      return [{id:t.id,category:"INSURANCE",reference:String(t.policy||""),product:String(t.type||"Insurance premium"),detail:String(t.type||"Insurance premium"),currency:"UGX",amount:Number(t.amount)||0,status:t.status==="Approved"?"Approved":"Declined",last4:String(t.last4||""),date:String(t.date||new Date().toISOString())}];
    });
  } catch { /* unavailable storage */ }
  return seedHistory();
}
export function saveHistory(history: Transaction[]) {
  try {localStorage.setItem(STORE_KEY,JSON.stringify(history.slice(0,150)));} catch {/* unavailable storage */}
}
export function newTransactionId() {
  const value = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().slice(0,8)
    : Math.random().toString(36).slice(2,10);
  return `OM-SIM-${value.toUpperCase()}`;
}
export function validExpiry(value: string) {
  const match=/^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const year=2000+Number(match[2]);
  const month=Number(match[1]);
  const now=new Date();
  return year>now.getFullYear() || (year===now.getFullYear() && month>=now.getMonth()+1);
}
