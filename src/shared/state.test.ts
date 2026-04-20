import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { FORMATS, customFormat } from './presets.js';
import {
  MAX_HISTORY,
  adjustLife,
  adjustPoison,
  createGame,
  deserialize,
  isDefeated,
  resetGame,
  serialize,
  undo,
} from './state.js';

test('createGame seeds Standard 1v1 with 20 life', () => {
  const g = createGame('1v1', FORMATS.standard);
  assert.equal(g.players.length, 2);
  assert.equal(g.players[0].lifeTotal, 20);
  assert.equal(g.players[0].poisonCounters, 0);
  assert.equal(g.history.length, 0);
});

test('createGame respects Commander preset and custom names', () => {
  const g = createGame('4p', FORMATS.commander, ['Alice', 'Bob', '', 'Dave']);
  assert.equal(g.players.length, 4);
  assert.equal(g.players[0].lifeTotal, 40);
  assert.equal(g.players[0].name, 'Alice');
  assert.equal(g.players[2].name, 'Player 3');
});

test('createGame with customFormat honors starting life', () => {
  const g = createGame('1v1', customFormat(25));
  assert.equal(g.players[0].lifeTotal, 25);
});

test('adjustLife applies delta and records history', () => {
  const g = createGame();
  const next = adjustLife(g, 1, -3);
  assert.equal(next.players[0].lifeTotal, 17);
  assert.equal(next.history.length, 1);
  assert.equal(next.history[0].kind, 'life');
});

test('adjustPoison clamps at zero and records history', () => {
  const g = createGame();
  const after = adjustPoison(adjustPoison(g, 1, 2), 1, -5);
  assert.equal(after.players[0].poisonCounters, 0);
});

test('undo reverses the last action', () => {
  const g = createGame();
  const stepped = adjustLife(adjustLife(g, 1, -5), 2, +3);
  const back = undo(stepped);
  assert.equal(back.players[1].lifeTotal, 20);
  assert.equal(back.history.length, 1);
});

test('history cap enforces MAX_HISTORY', () => {
  let g = createGame();
  for (let i = 0; i < MAX_HISTORY + 5; i++) g = adjustLife(g, 1, -1);
  assert.equal(g.history.length, MAX_HISTORY);
});

test('resetGame restores starting life but keeps names', () => {
  const g = adjustLife(createGame('1v1', FORMATS.commander, ['Ana', 'Bo']), 1, -10);
  const fresh = resetGame(g);
  assert.equal(fresh.players[0].lifeTotal, 40);
  assert.equal(fresh.players[0].name, 'Ana');
  assert.equal(fresh.history.length, 0);
});

test('isDefeated triggers on zero life or lethal poison', () => {
  assert.equal(isDefeated({ id: 1, name: 'x', lifeTotal: 0, poisonCounters: 0 }, FORMATS.standard), true);
  assert.equal(isDefeated({ id: 1, name: 'x', lifeTotal: 20, poisonCounters: 10 }, FORMATS.standard), true);
  assert.equal(isDefeated({ id: 1, name: 'x', lifeTotal: 5, poisonCounters: 3 }, FORMATS.standard), false);
});

test('serialize/deserialize round-trips', () => {
  const g = adjustPoison(createGame('3p'), 2, +2);
  const parsed = deserialize(serialize(g));
  assert.deepEqual(parsed, g);
});

test('deserialize returns null on garbage', () => {
  assert.equal(deserialize('not json'), null);
  assert.equal(deserialize('{"nope":true}'), null);
});
