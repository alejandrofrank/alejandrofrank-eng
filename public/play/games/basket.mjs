import { BASKET_LEVELS, evaluateBasket } from './basket-model.mjs';

export function initBasketGame() {
  const root = document.getElementById('basket-game'); if (!root) return;
  const q = id => root.querySelector(`#bk-${id}`);
  let index = 0, quantities, attempts, finished;
  const money = value => `$${value.toFixed(2)}`;
  function update() {
    const result = evaluateBasket(index, quantities);
    q('total').textContent = money(result.total);
    q('amounts').textContent = `${Number(result.amounts.milk.toFixed(2))} / 2 L milk · ${Number(result.amounts.rice.toFixed(2))} / 1 kg rice`;
    root.querySelectorAll('[data-offer]').forEach(card => {
      const i = Number(card.dataset.offer); card.dataset.selected = String(quantities[i] > 0);
      card.querySelector('output').textContent = quantities[i];
      card.querySelector('[data-delta="-1"]').disabled = finished || quantities[i] === 0;
      card.querySelector('[data-delta="1"]').disabled = finished || quantities[i] === 12;
    });
    q('checkout').disabled = finished;
    q('ledger').innerHTML = result.ledger.length ? result.ledger.map(row => `<div class="bk-ledger-row" data-valid="${row.valid}"><strong>${row.quantity} × ${row.id} / ${row.label}</strong><br>${row.price.toFixed(2)} ${row.currency}${row.currency === 'VES' ? ` ÷ ${row.rate} Bs./USD (rate: ${row.rateDate})` : ''} = ${money(row.usd)} per pack<br>${row.amount} ${row.kind === 'milk' ? 'L' : 'kg'} per pack → ${money(row.unitPrice)} / ${row.kind === 'milk' ? 'L' : 'kg'}<br>Observed ${row.date} · ${row.reason}<br>Subtotal ${money(row.subtotal)}</div>`).join('') : '<p>Add a listing to trace its price.</p>';
  }
  function start(levelIndex) {
    index = levelIndex; const level = BASKET_LEVELS[index];
    quantities = level.offers.map(() => 0); attempts = 0; finished = false;
    q('level').value = String(index); q('title').textContent = level.title; q('brief').textContent = level.brief;
    q('hint').textContent = level.hint; q('budget').textContent = money(level.budget);
    q('next').hidden = true; q('status').dataset.outcome = '';
    q('status').textContent = 'Choose quantities with + and −. Three basket checks per market. Open the price trail whenever you need it.';
    q('shelf').innerHTML = level.offers.map((item, i) => `<article class="bk-offer" data-offer="${i}"><div class="bk-package" data-kind="${item.kind}" aria-hidden="true">${item.id}</div><div><h4>${item.id} / ${item.label}</h4><p class="bk-meta">${item.amount} ${item.units} per pack</p><p class="bk-price">${item.currency === 'USD' ? money(item.price) : `Bs. ${item.price}`}</p><p class="bk-meta">Observed ${item.date.slice(8)} Oct${item.rate ? `<br>${item.rate} Bs./USD · ${item.rateDate.slice(8)} Oct` : ''}</p></div><div class="bk-quantity"><button type="button" data-delta="-1" aria-label="Remove ${item.id} ${item.label}">−</button><output aria-label="${item.id} quantity">0</output><button type="button" data-delta="1" aria-label="Add ${item.id} ${item.label}">+</button></div></article>`).join('');
    update();
  }
  q('shelf').addEventListener('click', event => {
    const button = event.target.closest('[data-delta]'); if (!button || finished) return;
    const i = Number(button.closest('[data-offer]').dataset.offer);
    quantities[i] = Math.max(0, Math.min(12, quantities[i] + Number(button.dataset.delta))); update();
  });
  q('checkout').addEventListener('click', () => {
    if (finished) return;
    const result = evaluateBasket(index, quantities); attempts++; finished = result.won || attempts === 3;
    q('status').textContent = result.won ? `Basket cleared at ${money(result.total)}. Exact quantities, valid dates, within budget.` : `${result.issues.join(' ')} ${finished ? 'Three checks used. Empty the basket to retry.' : `${3 - attempts} checks left.`}`;
    q('status').dataset.outcome = result.won ? 'won' : finished ? 'lost' : '';
    q('next').hidden = !result.won || index === 2; update();
    if (finished) (q('next').hidden ? q('reset') : q('next')).focus();
  });
  q('reset').addEventListener('click', () => start(index));
  q('next').addEventListener('click', () => { start(index + 1); q('title').setAttribute('tabindex', '-1'); q('title').focus(); });
  q('level').addEventListener('change', () => start(Number(q('level').value)));
  start(0); root.hidden = false;
}
