import { beforeEach, describe, expect, it } from 'vitest';
import { SaveSystem } from '../../src/systems/saveSystem';
import type { SaveData } from '../../src/domain/types';

const slot: 'slot1' = 'slot1';

function sampleSave(): SaveData {
  return {
    version: 1,
    player: { mapId: 'town', x: 2, y: 3, direction: 'left' },
    quests: {
      lost_apple: {
        status: 'in_progress',
        stepId: 'return_elder'
      }
    },
    flags: {
      elder_helped: false
    },
    timestamp: Date.now()
  };
}

describe('SaveSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads valid data', () => {
    const system = new SaveSystem();
    const data = sampleSave();

    system.save(slot, data);
    expect(system.hasSave(slot)).toBe(true);
    expect(system.load(slot)).toEqual(data);
  });

  it('returns null for invalid payload', () => {
    const system = new SaveSystem();
    localStorage.setItem('rpg-mvp:slot1', JSON.stringify({ version: 999 }));

    expect(system.load(slot)).toBeNull();
  });
});
