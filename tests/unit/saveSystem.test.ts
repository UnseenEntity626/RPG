import { beforeEach, describe, expect, it } from 'vitest';
import { SaveSystem } from '../../src/systems/saveSystem';
import type { SaveData } from '../../src/domain/types';

const slot: 'slot1' = 'slot1';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const localStorageMock = new MemoryStorage();

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true
  });
  localStorage.clear();
});

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
