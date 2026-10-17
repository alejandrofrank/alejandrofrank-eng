import { createQueryPuzzle, QUERY_FIELDS, QUERY_PARTITIONS, queryPlanSql } from './query-model.mjs';

export function initQueryGame() {
  const root = document.getElementById('query-game');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const game = createQueryPuzzle();
  const byId = id => root.querySelector(`#qg-${id}`);
  const fields = [...root.querySelectorAll('[data-qg-field]')];
  const partitions = [...root.querySelectorAll('[data-qg-partition]')];
  const cells = [...root.querySelectorAll('[data-qg-cell]')];
  const maxScan = QUERY_PARTITIONS.length * QUERY_FIELDS.reduce((sum, field) => sum + field.cost, 0);

  function render() {
    const { index, total, level, preview, result, solved } = game.state;
    byId('progress').textContent = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    byId('heading').textContent = level.name;
    byId('instruction').textContent = level.instruction;
    byId('scan').textContent = `${preview.scan} u`;
    byId('scan').dataset.over = String(!preview.withinBudget);
    byId('cap').textContent = `${level.budget} u`;
    byId('rows').textContent = `${preview.rows.length} / ${preview.targetRows.length}`;
    byId('meter-fill').style.width = `${preview.scan / maxScan * 100}%`;
    byId('meter-cap').style.left = `${level.budget / maxScan * 100}%`;
    byId('limit').value = preview.plan.limit === null ? 'all' : String(preview.plan.limit);
    fields.forEach(button => button.setAttribute('aria-pressed', String(preview.plan.fields.includes(button.dataset.qgField))));
    partitions.forEach(button => button.setAttribute('aria-pressed', String(preview.plan.partitions.includes(button.dataset.qgPartition))));
    cells.forEach(cell => {
      const block = preview.blocks.find(item => `${item.partition}/${item.field}` === cell.dataset.qgCell);
      cell.dataset.scanned = String(block.scanned);
      cell.dataset.target = String(block.target);
      cell.querySelector('.qg-cell-cost').textContent = block.cost;
      cell.setAttribute('aria-label', `${block.partition}, ${block.field}: ${block.cost} scan units. ${block.scanned ? 'Will read.' : 'Skipped.'}${block.target ? ' Required block.' : ''}`);
    });
    byId('sql').textContent = queryPlanSql(preview.plan);
    byId('trace').textContent = `${preview.blocks.filter(block => block.scanned).length} blocks read · ${preview.rowsRead} source rows considered · ${preview.rows.length} rows returned. ${preview.scan} fictional scan units. This is a plan preview, not a warehouse run.`;
    renderOutput(preview);
    const won = result?.won;
    byId('result').dataset.outcome = result ? (won ? 'won' : 'retry') : 'ready';
    byId('result-title').textContent = !result ? 'Keep the answer. Cut the read.'
      : won ? (solved.length === total ? 'Three plans solved.' : 'Plan accepted.')
      : !result.valid ? 'Nothing to read yet.'
      : !result.fieldsMatch ? 'The output fields do not match.'
      : !result.rowsMatch ? 'The requested observations do not match.'
      : 'Correct output, too much reading.';
    byId('result-detail').textContent = !result ? 'Match the requested rows and fields within the budget.'
      : won ? `${result.scan} / ${level.budget} units. ${level.lesson}`
      : !result.valid ? 'Keep at least one date and one field selected.'
      : !result.fieldsMatch ? `Return exactly product and price. ${!result.withinBudget ? `The plan also exceeds the budget by ${result.scan - level.budget} units.` : 'Check the column buttons above.'}`
      : !result.rowsMatch ? `You returned ${result.rows.length} rows; the request needs ${result.targetRows.length} specific rows. Check dates and the output limit.`
      : `The plan reads ${result.scan} units against a budget of ${level.budget}. LIMIT trims output, not this read footprint.`;
    byId('next').hidden = !won;
    byId('next').textContent = index === total - 1 ? 'Replay three challenges ↻' : 'Next challenge →';
  }

  function renderOutput(preview) {
    const table = byId('output');
    const header = document.createElement('tr');
    const displayFields = ['day', ...preview.plan.fields];
    displayFields.forEach(id => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = id === 'day' ? 'Source date*' : id;
      header.append(th);
    });
    table.tHead.replaceChildren(header);
    table.tBodies[0].replaceChildren(...preview.rows.map(row => {
      const tr = document.createElement('tr');
      displayFields.forEach(id => {
        const td = document.createElement('td');
        td.textContent = row[id];
        tr.append(td);
      });
      return tr;
    }));
    table.caption.textContent = 'Current plan preview · fictional records · *date shown for provenance, not selected output';
  }

  fields.forEach(button => button.addEventListener('click', () => { game.toggleField(button.dataset.qgField); render(); }));
  partitions.forEach(button => button.addEventListener('click', () => { game.togglePartition(button.dataset.qgPartition); render(); }));
  byId('limit').addEventListener('change', event => { game.setLimit(event.target.value === 'all' ? null : Number(event.target.value)); render(); });
  byId('run').addEventListener('click', () => { game.run(); render(); });
  byId('reset').addEventListener('click', () => { game.reset(); render(); });
  byId('next').addEventListener('click', () => {
    if (game.state.index === game.state.total - 1) game.restart();
    else game.next();
    render();
    // Advancing hides the triggering button; place keyboard focus in the new task.
    byId('heading').focus({ preventScroll: true });
  });
  render();
  root.hidden = false;
}
