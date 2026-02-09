import { describe, expect, it } from 'vitest';
import { evaluateDialogueCondition } from '../../src/systems/dialogueSystem';
import type { GameState } from '../../src/domain/types';

function baseState(): GameState {
  return {
    player: { mapId: 'town', x: 2, y: 2, direction: 'down' },
    quests: {
      lost_apple: {
        status: 'in_progress',
        stepId: 'return_elder'
      }
    },
    flags: {
      elder_helped: false
    }
  };
}

describe('evaluateDialogueCondition', () => {
  it('matches quest state and step', () => {
    const state = baseState();
    expect(
      evaluateDialogueCondition(
        {
          questId: 'lost_apple',
          questStatus: 'in_progress',
          questStepId: 'return_elder'
        },
        state
      )
    ).toBe(true);
  });

  it('checks flags correctly', () => {
    const state = baseState();
    expect(
      evaluateDialogueCondition(
        {
          flagId: 'elder_helped',
          flagValue: true
        },
        state
      )
    ).toBe(false);
  });
});
