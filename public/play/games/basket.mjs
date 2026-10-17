import { BASKET_LEVELS, PRODUCTS, createBasketSession, money, formatAmount } from './basket-model.mjs';

const icon = kind => `<svg viewBox="0 0 40 56" fill="none" aria-hidden="true">${kind === 'milk' ? '<path d="M8 14 13 4h17l3 10v38H8Z" fill="#eee5ce" stroke="#8f9f9a" stroke-width="2"/><path d="M8 14h25M13 4l5 10v38" stroke="#8f9f9a" stroke-width="2"/><path d="M19 25h12v16H19Z" fill="#82bdb4"/><path d="m25 27-4 7a4 4 0 0 0 8 0Z" fill="#edf3e9"/>' : kind === 'rice' ? '<path d="M10 4h20l-2 6 7 36-4 6H9l-4-6 7-36Z" fill="#e3c185" stroke="#a08965" stroke-width="2"/><path d="M10 5h20M11 11h18M8 46h24" stroke="#a08965"/><rect x="10" y="20" width="20" height="20" rx="4" fill="#efead9"/><path d="m15 27 4 5m3-7 4 5m-10 4 4 3" stroke="#af9d6e" stroke-width="2"/>' : '<path d="M9 4h22l3 48H6Z" fill="#b98062" stroke="#805d50" stroke-width="2"/><path d="M9 9h22M7 46h26" stroke="#805d50"/><rect x="10" y="19" width="20" height="20" rx="3" fill="#dfd2b1"/><ellipse cx="20" cy="29" rx="5" ry="8" transform="rotate(30 20 29)" fill="#775345"/><path d="m21 22-2 14" stroke="#dfd2b1"/>'}</svg>`;
const basketIcon = '<svg viewBox="0 0 80 60" fill="none" aria-hidden="true"><path d="m10 20 7 34h46l7-34ZM23 20 34 5m23 15L46 5M8 20h64M26 28l3 19m11-19v19m14-19-3 19" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const dateLabel = date => `${Number(date.slice(8))} Oct`;

export function initBasketGame() {
  const root = document.getElementById('basket-game'); if (!root) return;
  const find = id => root.querySelector(`#bk-${id}`), session = createBasketSession();
  let drag = null;
  const levelSelect = find('level'), shelf = find('shelf'), basket = find('basket'), items = find('items');
  levelSelect.innerHTML = BASKET_LEVELS.map((level, i) => `<option value="${i}">${i + 1} · ${level.title}</option>`).join('');
  function update() {
    const s = session.state, p = s.preview, level = s.level;
    find('progress').textContent = `MARKET ${String(s.index + 1).padStart(2, '0')} / 04 · ${s.cleared.length} CLEARED`;
    find('order').innerHTML = Object.entries(level.goal).map(([kind, target]) => `<div class="bk-goal" data-state="${p.amounts[kind] === target ? 'exact' : p.amounts[kind] > target ? 'over' : 'short'}">${icon(kind)}<strong>${PRODUCTS[kind].name}</strong><small>${formatAmount(kind, p.amounts[kind])} / ${formatAmount(kind, target)}</small></div>`).join('');
    shelf.querySelectorAll('[data-offer]').forEach(card => {
      const i = Number(card.dataset.offer), left = level.offers[i].stock - s.quantities[i];
      card.dataset.picked = String(s.quantities[i] > 0);
      card.querySelector('[data-stock]').textContent = `${left} left · ${s.quantities[i]} in basket`;
      card.querySelector('button').disabled = s.finished || !left;
      card.querySelector('[draggable]').draggable = !s.finished && left > 0;
    });
    items.innerHTML = p.ledger.length ? p.ledger.map(row => `<div class="bk-item" data-item="${level.offers.findIndex(o => o.id === row.id)}">${icon(row.kind)}<span>${row.id} · ${row.quantity} × ${row.amount} ${row.units}<small>${row.label} · ${money(row.subtotal)}</small></span><button type="button" data-remove="${level.offers.findIndex(o => o.id === row.id)}" aria-label="Remove one ${row.id}, ${row.label}"${s.finished ? ' disabled' : ''}>−</button></div>`).join('') : `<div class="bk-empty">${basketIcon}Drop your groceries here<br>or tap Add on the shelf.</div>`;
    find('spaces').textContent = `${p.packs} / ${level.capacity} spaces`;
    find('slots').innerHTML = Array.from({ length: Math.max(level.capacity, p.packs) }, (_, i) => `<i data-filled="${i < p.packs}"></i>`).join('');
    find('slots').dataset.over = String(p.packs > level.capacity);
    find('subtotal').textContent = money(p.subtotal); find('fees').textContent = money(p.fees); find('total').textContent = money(p.total);
    find('budget').textContent = `${money(Math.round(level.budget * 100))} ceiling · delivery included`;
    root.querySelector('.bk-till').dataset.over = String(p.total > Math.round(level.budget * 100));
    find('checkout').disabled = s.finished;
    find('next').hidden = !s.verdict?.won || s.index === BASKET_LEVELS.length - 1;
    find('next').textContent = s.index < 3 ? `Next: ${BASKET_LEVELS[s.index + 1].title} →` : '';
    find('replay').hidden = !s.verdict?.won || s.index !== 3;
    const status = find('status'); status.dataset.outcome = s.verdict?.won ? 'won' : s.finished ? 'lost' : 'playing';
    status.textContent = s.verdict ? s.verdict.won ? `Order passed: ${money(p.total)}, ${p.packs}/${level.capacity} spaces. ${s.cleared.length === 4 ? 'All four markets cleared.' : `${s.cleared.length} of 4 markets cleared.`}` : `${s.verdict.issues.join(' ')} ${s.finished ? 'Three checks used. Empty the basket to retry.' : `${3 - s.attempts} checks left.`}` : `${level.title}: ${level.twist} ${3 - s.attempts} basket checks left.`;
    find('ledger').innerHTML = p.ledger.length ? p.ledger.map(row => `<div class="bk-receipt-row" data-valid="${row.valid}"><strong>${row.id} · ${row.label} · ${row.quantity} pack${row.quantity === 1 ? '' : 's'}</strong><br>${money(row.cents)} per pack · ${money(row.unitCents)} / ${PRODUCTS[row.kind].unit} · ${money(row.subtotal)}<small>${row.amount} ${row.units} → ${row.baseAmount} ${row.kind === 'milk' ? 'ml' : 'g'} · observed ${dateLabel(row.date)}${row.currency === 'VES' ? ` · ${row.price} Bs. ÷ ${row.rate} (${dateLabel(row.rateDate)} rate)` : ''}</small>${row.reasons.join(' · ')}</div>`).join('') + p.deliveries.map(d => `<div class="bk-receipt-row">${d.name} delivery: ${money(d.cents)}, charged once.</div>`).join('') : '<p>Add products to inspect their normalized prices and evidence.</p>';
  }
  function load(focus = false) {
    const s = session.state; drag = null; basket.dataset.drag = 'false'; levelSelect.value = String(s.index);
    find('title').textContent = `${s.index + 1}. ${s.level.title}`;
    find('brief').textContent = s.level.brief; find('rules').textContent = s.level.twist; find('hint').textContent = s.level.hint;
    find('receipt').open = false; find('help').open = false;
    shelf.innerHTML = s.level.offers.map((offer, i) => `<article class="bk-offer" data-offer="${i}"><div class="bk-product" draggable="true" data-drag-offer="${i}">${icon(offer.kind)}<strong>${offer.label}<small>${offer.id} · ${offer.amount} ${offer.units}</small></strong></div><div class="bk-ticket"><b>${offer.currency === 'VES' ? `${offer.price} Bs.` : money(Math.round(offer.price * 100))}</b><span>${s.level.stores[offer.store].name}</span></div><div class="bk-meta">Observed ${dateLabel(offer.date)}${offer.currency === 'VES' ? `<br>${offer.rate} Bs./USD · rate ${dateLabel(offer.rateDate)}` : ''}</div><footer><span data-stock></span><button type="button" data-delta="1" aria-label="Add ${offer.id}, ${offer.label}, ${offer.amount} ${offer.units}">Add +</button></footer></article>`).join('');
    update();
    if (focus) { find('title').focus({ preventScroll: true }); find('title').scrollIntoView?.({ block: 'start', behavior: 'auto' }); }
  }
  shelf.addEventListener('click', event => { const button = event.target.closest('[data-delta]'); if (!button) return; const i = Number(button.closest('[data-offer]').dataset.offer), focused = document.activeElement === button; if (session.change(i, 1)) { update(); if (focused && button.disabled) items.querySelector(`[data-remove="${i}"]`)?.focus({ preventScroll: true }); } });
  items.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]'); if (!button) return; const i = Number(button.dataset.remove);
    if (session.change(i, -1)) { update(); (items.querySelector(`[data-remove="${i}"]`) || shelf.querySelector(`[data-offer="${i}"] button`))?.focus({ preventScroll: true }); }
  });
  shelf.addEventListener('dragstart', event => {
    const pack = event.target.closest('[data-drag-offer]'), s = session.state;
    if (!pack || s.finished || s.quantities[Number(pack.dataset.dragOffer)] >= s.level.offers[Number(pack.dataset.dragOffer)].stock) { event.preventDefault(); return; }
    drag = { index: Number(pack.dataset.dragOffer), round: s.index }; if (event.dataTransfer) { event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('text/plain', 'Basket Run product'); }
  });
  shelf.addEventListener('dragend', () => { drag = null; basket.dataset.drag = 'false'; });
  basket.addEventListener('dragover', event => { if (!drag) return; event.preventDefault(); basket.dataset.drag = 'true'; if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; });
  basket.addEventListener('dragleave', event => { if (!basket.contains(event.relatedTarget)) basket.dataset.drag = 'false'; });
  basket.addEventListener('drop', event => { if (!drag) return; event.preventDefault(); const payload = drag; drag = null; basket.dataset.drag = 'false'; if (payload.round === session.state.index && session.change(payload.index, 1)) update(); });
  find('checkout').addEventListener('click', () => { session.check(); update(); const s = session.state; if (s.finished) (s.verdict?.won ? s.index < 3 ? find('next') : find('replay') : find('reset')).focus({ preventScroll: true }); });
  find('reset').addEventListener('click', () => { session.reset(); load(); });
  find('next').addEventListener('click', () => { if (session.next()) load(true); });
  find('replay').addEventListener('click', () => { session.restart(); load(true); });
  levelSelect.addEventListener('change', () => { session.select(Number(levelSelect.value)); load(true); });
  root.hidden = false; load();
}
