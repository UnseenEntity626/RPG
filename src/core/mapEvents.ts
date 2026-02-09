import Phaser from 'phaser';
import type { MapEvent } from '../domain/types';
import { TILE_SIZE } from './constants';

function readProperty(properties: Phaser.Types.Tilemaps.TiledObject['properties'], name: string): string | undefined {
  if (!properties) {
    return undefined;
  }
  const found = properties.find((item: { name: string; value: unknown }) => item.name === name);
  return typeof found?.value === 'string' ? found.value : undefined;
}

function parseQuestAction(raw: string | undefined): MapEvent['interaction']['questAction'] {
  if (!raw) {
    return undefined;
  }

  const [action, questId, trigger] = raw.split(':');
  if (!questId) {
    return undefined;
  }

  if (action === 'start') {
    return { action, questId };
  }

  if (action === 'advance' && trigger) {
    return { action, questId, trigger };
  }

  return undefined;
}

export interface ParsedMapData {
  events: MapEvent[];
  spawn: { x: number; y: number };
}

export function parseMapEvents(map: Phaser.Tilemaps.Tilemap): ParsedMapData {
  const eventLayer = map.getObjectLayer('Events');
  const events: MapEvent[] = [];
  let spawn = { x: 2, y: 2 };

  for (const object of eventLayer?.objects ?? []) {
    const eventType = readProperty(object.properties, 'eventType');
    const x = Math.floor((object.x ?? 0) / TILE_SIZE);
    const y = Math.floor((object.y ?? 0) / TILE_SIZE);

    if (eventType === 'spawn') {
      spawn = { x, y };
      continue;
    }

    const eventId = readProperty(object.properties, 'eventId');
    if (!eventId || (eventType !== 'npc' && eventType !== 'trigger')) {
      continue;
    }

    events.push({
      id: eventId,
      type: eventType,
      x,
      y,
      interaction: {
        dialogueId: readProperty(object.properties, 'dialogueId'),
        trigger: readProperty(object.properties, 'trigger'),
        questAction: parseQuestAction(readProperty(object.properties, 'questAction'))
      }
    });
  }

  return { events, spawn };
}
