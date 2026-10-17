// A deliberately small column-store puzzle, not a BigQuery estimator or SQL engine.
export const QUERY_FIELDS = Object.freeze([
  { id: 'product', label: 'Product', cost: 2 },
  { id: 'price', label: 'Price', cost: 1 },
  { id: 'notes', label: 'Notes', cost: 6 },
  { id: 'image', label: 'Image', cost: 9 },
]);

export const QUERY_PARTITIONS = Object.freeze([
  { id: '2026-10-14', label: '14 OCT', rows: [
    { id: '14-a', product: 'Coffee', price: '4.10', notes: 'Shelf A', image: 'coffee.jpg' },
    { id: '14-b', product: 'Rice', price: '2.20', notes: 'Shelf B', image: 'rice.jpg' },
  ] },
  { id: '2026-10-15', label: '15 OCT', rows: [
    { id: '15-a', product: 'Coffee', price: '4.20', notes: 'Shelf A', image: 'coffee.jpg' },
    { id: '15-b', product: 'Rice', price: '2.30', notes: 'Shelf B', image: 'rice.jpg' },
  ] },
  { id: '2026-10-16', label: '16 OCT', rows: [
    { id: '16-a', product: 'Coffee', price: '4.30', notes: 'Shelf A', image: 'coffee.jpg' },
    { id: '16-b', product: 'Rice', price: '2.40', notes: 'Shelf B', image: 'rice.jpg' },
  ] },
]);

export const QUERY_LEVELS = Object.freeze([
  {
    name: 'Cut the baggage',
    instruction: 'Deliver product + price for all six observations. Leave the bulky notes and images behind.',
    fields: ['product', 'price'], partitions: QUERY_PARTITIONS.map(partition => partition.id),
    limit: null, budget: 9,
    lesson: 'Six correct rows, fewer fields read. Column selection saves work without dropping the observations you need.',
  },
  {
    name: 'Find the right day',
    instruction: 'Deliver product + price for both observations on 16 October. The older dates are outside the request.',
    fields: ['product', 'price'], partitions: ['2026-10-16'],
    limit: null, budget: 3,
    lesson: 'A direct date filter excludes the older partitions before their selected columns are read.',
  },
  {
    name: 'The preview trap',
    instruction: 'Deliver only the alphabetically first product + price on 16 October. Keep the read budget at three units.',
    fields: ['product', 'price'], partitions: ['2026-10-16'],
    limit: 1, budget: 3,
    lesson: 'LIMIT trims the output after the read. Your date and column choices reduced the scan; returning one row did not.',
  },
]);

const allFields = QUERY_FIELDS.map(field => field.id);
const allPartitions = QUERY_PARTITIONS.map(partition => partition.id);
const allowedLimits = new Set([null, 1, 2, 4]);
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);

function normalizePlan(plan) {
  return {
    fields: allFields.filter(id => plan.fields?.includes(id)),
    partitions: allPartitions.filter(id => plan.partitions?.includes(id)),
    limit: allowedLimits.has(plan.limit) ? plan.limit : null,
  };
}

function readRows(plan) {
  // Fixed ordering models ORDER BY _PARTITIONDATE, product. Product is therefore
  // a read dependency even when the player leaves it out of the projection.
  const rows = QUERY_PARTITIONS.filter(partition => plan.partitions.includes(partition.id))
    .flatMap(partition => partition.rows.map(row => ({ ...row, day: partition.id })));
  return plan.limit === null ? rows : rows.slice(0, plan.limit);
}

export function evaluateQueryPlan(levelIndex, input) {
  const level = QUERY_LEVELS[levelIndex];
  if (!level) throw new RangeError('Unknown query puzzle level');
  const plan = normalizePlan(input);
  const valid = plan.fields.length > 0 && plan.partitions.length > 0;
  const readFields = valid ? allFields.filter(id => id === 'product' || plan.fields.includes(id)) : [];
  const blocks = QUERY_PARTITIONS.flatMap(partition => QUERY_FIELDS.map(field => ({
    partition: partition.id, field: field.id, cost: field.cost,
    scanned: valid && plan.partitions.includes(partition.id) && readFields.includes(field.id),
    target: level.partitions.includes(partition.id) && level.fields.includes(field.id),
  })));
  const scan = blocks.reduce((sum, block) => sum + (block.scanned ? block.cost : 0), 0);
  const rows = valid ? readRows(plan) : [];
  const targetRows = readRows(level);
  const fieldsMatch = same(plan.fields, level.fields);
  const rowsMatch = same(rows.map(row => row.id), targetRows.map(row => row.id));
  const withinBudget = scan <= level.budget;
  return {
    plan, valid, readFields, blocks, scan, rows, targetRows, fieldsMatch, rowsMatch, withinBudget,
    won: valid && fieldsMatch && rowsMatch && withinBudget,
    rowsRead: valid ? plan.partitions.length * 2 : 0,
    budget: level.budget,
  };
}

export function queryPlanSql(input) {
  const plan = normalizePlan(input);
  if (!plan.fields.length || !plan.partitions.length) return '-- Select at least one date and one output field.';
  const dateFilter = plan.partitions.length === allPartitions.length ? ''
    : `\nWHERE _PARTITIONDATE IN (${plan.partitions.map(day => `DATE '${day}'`).join(', ')})`;
  return `SELECT ${plan.fields.join(', ')}\nFROM demo.daily_prices${dateFilter}\nORDER BY _PARTITIONDATE, product${plan.limit === null ? '' : `\nLIMIT ${plan.limit}`};`;
}

export function createQueryPuzzle() {
  let index = 0;
  let plan;
  let result = null;
  let attempts = 0;
  const solved = new Set();
  function resetPlan() {
    plan = { fields: [...allFields], partitions: [...allPartitions], limit: null };
    result = null;
    attempts = 0;
  }
  resetPlan();
  return {
    get state() {
      return {
        index, total: QUERY_LEVELS.length, level: QUERY_LEVELS[index], attempts,
        solved: [...solved], result: result ? structuredClone(result) : null,
        preview: evaluateQueryPlan(index, plan),
      };
    },
    toggleField(id) {
      if (!allFields.includes(id)) return;
      plan.fields = plan.fields.includes(id) ? plan.fields.filter(field => field !== id) : [...plan.fields, id];
      result = null;
    },
    togglePartition(id) {
      if (!allPartitions.includes(id)) return;
      plan.partitions = plan.partitions.includes(id) ? plan.partitions.filter(day => day !== id) : [...plan.partitions, id];
      result = null;
    },
    setLimit(limit) {
      if (!allowedLimits.has(limit)) return;
      plan.limit = limit;
      result = null;
    },
    run() {
      result = evaluateQueryPlan(index, plan);
      attempts += 1;
      if (result.won) solved.add(index);
      return structuredClone(result);
    },
    next() {
      if (!result?.won || index === QUERY_LEVELS.length - 1) return false;
      index += 1;
      resetPlan();
      return true;
    },
    reset() { resetPlan(); },
    restart() { index = 0; solved.clear(); resetPlan(); },
  };
}
