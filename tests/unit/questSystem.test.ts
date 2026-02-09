import { describe, expect, it } from 'vitest';
import { QuestSystem } from '../../src/systems/questSystem';
import type { GameState, QuestDefinition } from '../../src/domain/types';

const definitions: QuestDefinition[] = [
  {
    id: 'lost_apple',
    title: 'Lost Apple',
    steps: [
      { id: 'find_tree', condition: { trigger: 'found_apple' }, nextStepId: 'return_elder' },
      { id: 'return_elder', condition: { trigger: 'talk_elder' } }
    ],
    rewards: [{ type: 'flag', id: 'elder_helped', value: true }]
  }
];

function makeState(): GameState {
  return {
    player: { mapId: 'town', x: 2, y: 2, direction: 'down' },
    quests: {},
    flags: {}
  };
}

describe('QuestSystem', () => {
  it('starts and advances a quest to completion', () => {
    const state = makeState();
    const system = new QuestSystem(definitions, state);

    expect(system.startQuest('lost_apple')).toBe(true);
    expect(system.getQuestState('lost_apple')).toEqual({ status: 'in_progress', stepId: 'find_tree' });

    expect(system.advanceQuest('lost_apple', 'found_apple')).toBe(true);
    expect(system.getQuestState('lost_apple')).toEqual({ status: 'in_progress', stepId: 'return_elder' });

    expect(system.advanceQuest('lost_apple', 'talk_elder')).toBe(true);
    expect(system.getQuestState('lost_apple')).toEqual({ status: 'completed' });
    expect(state.flags.elder_helped).toBe(true);
  });

  it('rejects mismatched triggers', () => {
    const state = makeState();
    const system = new QuestSystem(definitions, state);
    system.startQuest('lost_apple');

    expect(system.advanceQuest('lost_apple', 'wrong_trigger')).toBe(false);
    expect(system.getQuestState('lost_apple')).toEqual({ status: 'in_progress', stepId: 'find_tree' });
  });
});
