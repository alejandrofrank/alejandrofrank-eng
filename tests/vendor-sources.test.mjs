import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('embedded engines match the reviewed, pinned source files', () => {
  const root = new URL('../public/play/', import.meta.url);
  const sources = JSON.parse(readFileSync(new URL('sources.json', root), 'utf8'));
  for (const source of sources) {
    const text = readFileSync(new URL(source.file, root), 'utf8').replaceAll('\r\n', '\n');
    assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256LF, source.file);
  }
});
