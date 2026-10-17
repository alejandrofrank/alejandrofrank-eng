const offer = (id, label, kind, amount, units, price, currency = 'USD', date = '2026-10-16', rate = null, rateDate = null) => ({ id, label, kind, amount, units, price, currency, date, rate, rateDate });
export const BASKET_LEVELS = [
  { title: 'The small-pack trap', brief: 'Fill the exact order for $7 or less. The smallest price tag is not always the cheapest way to fill a basket.', budget: 7, goal: { milk: 2, rice: 1 },
    hint: 'Two 1 L milk cartons and one 1 kg rice bag cost $6.60. Compare price per liter or kilogram.',
    offers: [offer('A', 'Milk carton', 'milk', 200, 'ml', .55), offer('B', 'Milk carton', 'milk', 1, 'L', 2.1), offer('C', 'Rice bag', 'rice', 500, 'g', 1.4), offer('D', 'Rice bag', 'rice', 1, 'kg', 2.4)] },
  { title: 'One basket, two currencies', brief: 'Fill the exact order for $6 or less. Convert each listing with its own dated rate. These exchange rates are invented for the puzzle.', budget: 6, goal: { milk: 2, rice: 1 },
    hint: 'Two Bs. 180 milk cartons at 100 Bs./USD plus one Bs. 220 rice bag at 100 Bs./USD cost $5.80.',
    offers: [offer('A', 'Milk carton', 'milk', 1, 'L', 2), offer('B', 'Milk carton', 'milk', 1, 'L', 180, 'VES', '2026-10-16', 100, '2026-10-16'), offer('C', 'Rice bag', 'rice', 1, 'kg', 2.5), offer('D', 'Rice bag', 'rice', 1, 'kg', 220, 'VES', '2026-10-16', 100, '2026-10-16')] },
  { title: 'Cheap is not enough', brief: 'Fill the exact order for $6 or less, using only observations and exchange rates dated 16 October. A stale bargain cannot support today’s comparison.', budget: 6, goal: { milk: 2, rice: 1 },
    hint: 'Choose two milk cartons from C and one rice bag from E. A and D are stale; B has a mismatched rate date.',
    offers: [offer('A', 'Milk carton', 'milk', 1, 'L', 1, 'USD', '2026-10-14'), offer('B', 'Milk carton', 'milk', 1, 'L', 120, 'VES', '2026-10-16', 100, '2026-10-14'), offer('C', 'Milk carton', 'milk', 1, 'L', 180, 'VES', '2026-10-16', 100, '2026-10-16'), offer('D', 'Rice bag', 'rice', 1, 'kg', 1, 'USD', '2026-10-14'), offer('E', 'Rice bag', 'rice', 1, 'kg', 2.3), offer('F', 'Rice bag', 'rice', 500, 'g', 1.3)] },
];

export function normalizeOffer(item) {
  const amount = item.amount / (['ml', 'g'].includes(item.units) ? 1000 : 1);
  const usd = item.currency === 'VES' ? item.price / item.rate : item.price;
  const valid = item.date === '2026-10-16' && (item.currency !== 'VES' || item.rateDate === item.date);
  return { amount, usd, unitPrice: usd / amount, valid,
    reason: item.date !== '2026-10-16' ? 'Observation is not from 16 October' : item.currency === 'VES' && item.rateDate !== item.date ? 'Exchange-rate date differs from observation' : 'Observation and conversion dates pass' };
}

export function evaluateBasket(index, quantities) {
  const level = BASKET_LEVELS[index];
  if (!level) throw new Error('Unknown basket level');
  if (!Array.isArray(quantities) || quantities.length !== level.offers.length || quantities.some(q => !Number.isInteger(q) || q < 0 || q > 12)) throw new Error('Invalid basket quantity');
  const amounts = { milk: 0, rice: 0 }; let total = 0;
  const ledger = level.offers.flatMap((item, i) => {
    const quantity = quantities[i]; if (!quantity) return [];
    const normalized = normalizeOffer(item);
    amounts[item.kind] += normalized.amount * quantity; total += normalized.usd * quantity;
    return [{ ...item, ...normalized, quantity, subtotal: normalized.usd * quantity }];
  });
  total = Math.round(total * 100) / 100;
  const exact = Object.keys(level.goal).every(kind => Math.abs(amounts[kind] - level.goal[kind]) < .000001);
  const invalid = ledger.filter(row => !row.valid);
  return { total, amounts, ledger, exact, invalid, won: exact && !invalid.length && total <= level.budget,
    issues: [!exact ? 'Fill exactly 2 L of milk and 1 kg of rice.' : '', total > level.budget ? `Basket exceeds the $${level.budget.toFixed(2)} budget.` : '', ...invalid.map(row => `${row.id}: ${row.reason}.`)].filter(Boolean) };
}
