import 'package:flutter_test/flutter_test.dart';
import 'package:mtg_life_counter/game_state.dart';

void main() {
  test('createGame seeds Standard 1v1 with 20 life', () {
    final g = GameState.create();
    expect(g.players.length, 2);
    expect(g.players[0].lifeTotal, 20);
    expect(g.players[0].poisonCounters, 0);
    expect(g.history, isEmpty);
  });

  test('createGame honors Commander preset and names', () {
    final g = GameState.create(
      mode: GameMode.fourPlayer,
      format: Formats.commander,
      names: ['Alice', 'Bob', '', 'Dave'],
    );
    expect(g.players.length, 4);
    expect(g.players[0].lifeTotal, 40);
    expect(g.players[0].name, 'Alice');
    expect(g.players[2].name, 'Player 3');
  });

  test('adjustLife records history and applies delta', () {
    final g = GameState.create().adjustLife(1, -3);
    expect(g.players[0].lifeTotal, 17);
    expect(g.history.length, 1);
  });

  test('adjustPoison clamps at zero', () {
    final g = GameState.create().adjustPoison(1, 2).adjustPoison(1, -5);
    expect(g.players[0].poisonCounters, 0);
  });

  test('undo reverses the last move', () {
    final g = GameState.create().adjustLife(1, -5).adjustLife(2, 3);
    final back = g.undo();
    expect(back.players[1].lifeTotal, 20);
    expect(back.history.length, 1);
  });

  test('history is capped at kMaxHistory', () {
    var g = GameState.create();
    for (var i = 0; i < kMaxHistory + 5; i++) {
      g = g.adjustLife(1, -1);
    }
    expect(g.history.length, kMaxHistory);
  });

  test('reset restores starting life and keeps names', () {
    final g = GameState.create(
      mode: GameMode.oneVOne,
      format: Formats.commander,
      names: ['Ana', 'Bo'],
    ).adjustLife(1, -10);
    final fresh = g.reset();
    expect(fresh.players[0].lifeTotal, 40);
    expect(fresh.players[0].name, 'Ana');
    expect(fresh.history, isEmpty);
  });

  test('serialize/deserialize round-trips', () {
    final g = GameState.create(mode: GameMode.threePlayer).adjustPoison(2, 2);
    final parsed = GameState.deserialize(g.serialize());
    expect(parsed, isNotNull);
    expect(parsed!.players[1].poisonCounters, 2);
    expect(parsed.history.length, 1);
  });

  test('deserialize returns null on garbage', () {
    expect(GameState.deserialize('not json'), isNull);
    expect(GameState.deserialize('{"nope":true}'), isNull);
  });

  test('defeatedIn triggers on zero life or lethal poison', () {
    const p1 = Player(id: 1, name: 'x', lifeTotal: 0, poisonCounters: 0);
    const p2 = Player(id: 1, name: 'x', lifeTotal: 20, poisonCounters: 10);
    const p3 = Player(id: 1, name: 'x', lifeTotal: 5, poisonCounters: 3);
    expect(p1.defeatedIn(Formats.standard), isTrue);
    expect(p2.defeatedIn(Formats.standard), isTrue);
    expect(p3.defeatedIn(Formats.standard), isFalse);
  });
}
