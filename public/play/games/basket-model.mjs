export const PRODUCTS = {
  milk: { name: 'Whole milk', unit: 'L', variant: 'whole' },
  rice: { name: 'White rice', unit: 'kg', variant: 'white' },
  coffee: { name: 'Ground coffee', unit: 'kg', variant: 'ground' },
};
const offer = (id, kind, amount, units, price, stock, extra = {}) => ({
  id, kind, amount, units, price, stock, label: PRODUCTS[kind].name, variant: PRODUCTS[kind].variant,
  currency: 'USD', date: '2026-10-16', store: 'market', ...extra,
});
const stores = { market: { name: 'Mercado', fee: 0 }, corner: { name: 'Corner', fee: 0 } };
export const BASKET_LEVELS = [
  { title: 'Make it fit', tag: 'Pack arithmetic', date: '2026-10-16', earliest: '2026-10-16',
    brief: 'The smallest packs cost less per unit, but your basket has only four spaces. Fill the exact order without buying extra.',
    twist: 'Each pack takes one basket space, whatever its size.', budget: 8.9, capacity: 4, goal: { milk: 2000, rice: 1000, coffee: 250 }, stores,
    hint: 'Milk needs at least two packs. That leaves one space for rice and one for coffee. Start with space, then check cost.',
    offers: [offer('A','milk',500,'ml',.85,4),offer('B','milk',1,'L',1.9,2),offer('C','rice',500,'g',1.05,2),offer('D','rice',1,'kg',2.4,1),offer('E','coffee',250,'g',2.6,1),offer('F','coffee',125,'g',1.15,2)] },
  { title: 'Delivery dilemma', tag: 'Shared costs', date: '2026-10-16', earliest: '2026-10-16',
    brief: 'Two stores. One fee per store used, even for a single pack. The cheapest individual listings can make the basket more expensive.',
    twist: 'Mercado delivery $0.40 · Corner delivery $1.60. Five spaces.', budget: 9.9, capacity: 5, goal: { milk: 1500, rice: 1000, coffee: 500 },
    stores: { market: { name: 'Mercado', fee: .4 }, corner: { name: 'Corner', fee: 1.6 } },
    hint: 'An all-Mercado order is cheap but takes six spaces. Before mixing stores, try grouping the whole order at Corner.',
    offers: [offer('A','milk',500,'ml',.8,3),offer('B','milk',1.5,'L',2.7,1,{store:'corner'}),offer('C','rice',1,'kg',2.2,1),offer('D','rice',1,'kg',1.6,1,{store:'corner'}),offer('E','coffee',250,'g',2,2),offer('F','coffee',500,'g',4,1,{store:'corner'})] },
  { title: 'Yesterday’s rate', tag: 'Stock + currency', date: '2026-10-17', earliest: '2026-10-16',
    brief: 'Observations from 16 or 17 October qualify. Each bolívar listing uses the rate from its own observation day. The large milk carton has only one pack left.',
    twist: 'Fictional rates: 16 Oct = 100 Bs./USD · 17 Oct = 125 Bs./USD.', budget: 9.3, capacity: 6, goal: { milk: 2000, rice: 1500, coffee: 250 }, stores,
    hint: 'Use the one large milk carton plus two small ones. Pair one large and one small rice bag. Convert the coffee with the 17 October rate.',
    offers: [offer('A','milk',1,'L',180,1,{currency:'VES',rate:100,rateDate:'2026-10-16'}),offer('B','milk',500,'ml',1,4,{date:'2026-10-17'}),offer('C','rice',1,'kg',250,1,{currency:'VES',date:'2026-10-17',rate:125,rateDate:'2026-10-17'}),offer('D','rice',500,'g',1.1,3,{date:'2026-10-17'}),offer('E','coffee',250,'g',300,1,{currency:'VES',date:'2026-10-17',rate:125,rateDate:'2026-10-17'}),offer('F','coffee',250,'g',2.5,1,{date:'2026-10-17'})] },
  { title: 'Too good to be true', tag: 'Full audit', date: '2026-10-17', earliest: '2026-10-17',
    brief: 'Only 17 October observations qualify. Get whole milk, white rice and ground coffee. Cheap lookalikes and an old rate are hiding among the listings.',
    twist: 'Five spaces. Mercado delivery $0.40 · Corner delivery $1.00. Inspect the evidence.', budget: 10.1, capacity: 5, goal: { milk: 1500, rice: 1000, coffee: 500 },
    stores: { market: { name: 'Mercado', fee: .4 }, corner: { name: 'Corner', fee: 1 } },
    hint: 'A is stale, B is skimmed, C carries the wrong rate date, and F is brown rice. The cheap milk needs three spaces; find coffee that fits in one.',
    offers: [offer('A','milk',1.5,'L',1.5,1,{date:'2026-10-15'}),offer('B','milk',1.5,'L',2.1,1,{variant:'skim',label:'Skimmed milk',date:'2026-10-17'}),offer('C','milk',1,'L',200,2,{currency:'VES',date:'2026-10-17',rate:100,rateDate:'2026-10-16'}),offer('D','milk',500,'ml',100,3,{currency:'VES',date:'2026-10-17',rate:125,rateDate:'2026-10-17'}),offer('E','rice',1,'kg',2.3,1,{date:'2026-10-17'}),offer('F','rice',1,'kg',1.3,1,{variant:'brown',label:'Brown rice',date:'2026-10-17',store:'corner'}),offer('G','coffee',500,'g',500,1,{currency:'VES',date:'2026-10-17',rate:125,rateDate:'2026-10-17',store:'corner'}),offer('H','coffee',250,'g',2.1,2,{date:'2026-10-17'}),offer('I','milk',1.5,'L',2.7,1,{date:'2026-10-17',store:'corner'})] },
];
export const money = cents => `$${(cents / 100).toFixed(2)}`;
export const formatAmount = (kind, base) => kind === 'milk' ? `${base / 1000} L` : base < 1000 ? `${base} g` : `${base / 1000} kg`;
export const orderText = level => Object.entries(level.goal).map(([kind, base]) => `${formatAmount(kind, base)} ${PRODUCTS[kind].name.toLowerCase()}`).join(' + ');

export function normalizeOffer(item, level) {
  const baseAmount = Math.round(item.amount * (['L', 'kg'].includes(item.units) ? 1000 : 1));
  const usableRate = item.currency !== 'VES' || Number.isFinite(item.rate) && item.rate > 0;
  const cents = usableRate ? Math.round(item.price * 100 / (item.currency === 'VES' ? item.rate : 1)) : 0;
  const reasons = [];
  if (item.date < level.earliest || item.date > level.date) reasons.push(`observation ${item.date.slice(8)} Oct is outside this market’s date window`);
  if (!usableRate) reasons.push('exchange rate is missing');
  else if (item.currency === 'VES' && item.rateDate !== item.date) reasons.push('exchange-rate date differs from observation');
  if (item.variant !== PRODUCTS[item.kind].variant) reasons.push(`${item.label.toLowerCase()} does not match the requested identity`);
  return { baseAmount, cents, unitCents: Math.round(cents * 1000 / baseAmount), valid: reasons.length === 0, reasons };
}

export function evaluateBasket(index, quantities) {
  const level = BASKET_LEVELS[index];
  if (!level) throw new RangeError('Unknown basket level');
  if (!Array.isArray(quantities) || quantities.length !== level.offers.length || quantities.some(q => !Number.isInteger(q) || q < 0 || q > 12)) throw new TypeError('Invalid basket quantity');
  const amounts = { milk: 0, rice: 0, coffee: 0 }; let subtotal = 0, packs = 0;
  const ledger = level.offers.flatMap((item, i) => {
    const quantity = quantities[i]; if (!quantity) return [];
    const normalized = normalizeOffer(item, level);
    amounts[item.kind] += normalized.baseAmount * quantity; subtotal += normalized.cents * quantity; packs += quantity;
    return [{ ...item, ...normalized, quantity, subtotal: normalized.cents * quantity }];
  });
  const deliveries = [...new Set(ledger.map(row => row.store))].map(id => ({ id, ...level.stores[id], cents: Math.round(level.stores[id].fee * 100) }));
  const fees = deliveries.reduce((sum, store) => sum + store.cents, 0), total = subtotal + fees;
  const exact = Object.keys(level.goal).every(kind => amounts[kind] === level.goal[kind]);
  const invalid = ledger.filter(row => !row.valid), overstock = ledger.filter(row => row.quantity > row.stock);
  const issues = [!exact ? `Fill exactly ${orderText(level)}.` : '', packs > level.capacity ? `${packs} packs need more than ${level.capacity} spaces. Try larger packs.` : '', total > Math.round(level.budget * 100) ? `${money(total)} exceeds the ${money(Math.round(level.budget * 100))} ceiling${fees ? `, including ${money(fees)} delivery` : ''}.` : '', ...overstock.map(row => `${row.id}: only ${row.stock} packs in stock.`), ...invalid.flatMap(row => row.reasons.map(reason => `${row.id}: ${reason}.`))].filter(Boolean);
  return { total, subtotal, fees, deliveries, packs, amounts, ledger, exact, invalid, overstock, won: issues.length === 0, issues };
}

export function createBasketSession() {
  let index = 0, quantities = [], attempts = 0, verdict = null;
  const cleared = new Set();
  const state = () => ({ index, level: BASKET_LEVELS[index], quantities: [...quantities], attempts, verdict: verdict ? structuredClone(verdict) : null, cleared: [...cleared], finished: Boolean(verdict?.won || attempts >= 3), preview: evaluateBasket(index, quantities) });
  function load(next) { if (!Number.isInteger(next) || !BASKET_LEVELS[next]) throw new RangeError('Unknown basket level'); index = next; quantities = BASKET_LEVELS[next].offers.map(() => 0); attempts = 0; verdict = null; }
  load(0);
  return {
    get state() { return state(); },
    change(i, delta) { if (state().finished || !Number.isInteger(i) || !quantities.hasOwnProperty(i) || ![-1, 1].includes(delta)) return false; const next = quantities[i] + delta; if (next < 0 || next > BASKET_LEVELS[index].offers[i].stock) return false; quantities[i] = next; verdict = null; return true; },
    check() { if (state().finished) return state(); attempts++; verdict = evaluateBasket(index, quantities); if (verdict.won) cleared.add(index); return state(); },
    next() { if (!verdict?.won || index >= BASKET_LEVELS.length - 1) return false; load(index + 1); return true; },
    select: load,
    reset() { load(index); },
    restart() { cleared.clear(); load(0); },
  };
}
