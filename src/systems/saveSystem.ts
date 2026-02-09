import type { SaveData } from '../domain/types';
import { SAVE_VERSION, STORAGE_KEY_PREFIX } from '../core/constants';

export class SaveSystem {
  private getKey(slot: 'slot1'): string {
    return `${STORAGE_KEY_PREFIX}:${slot}`;
  }

  hasSave(slot: 'slot1'): boolean {
    return localStorage.getItem(this.getKey(slot)) !== null;
  }

  save(slot: 'slot1', data: SaveData): void {
    localStorage.setItem(this.getKey(slot), JSON.stringify(data));
  }

  load(slot: 'slot1'): SaveData | null {
    const raw = localStorage.getItem(this.getKey(slot));
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as SaveData;
      if (!this.isValidSaveData(parsed)) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private isValidSaveData(data: SaveData): boolean {
    return (
      data.version === SAVE_VERSION &&
      typeof data.player?.mapId === 'string' &&
      typeof data.player?.x === 'number' &&
      typeof data.player?.y === 'number' &&
      ['up', 'down', 'left', 'right'].includes(data.player?.direction) &&
      typeof data.timestamp === 'number' &&
      typeof data.flags === 'object' &&
      typeof data.quests === 'object'
    );
  }
}
