import Phaser from 'phaser';
import dialogues from '../data/dialogues.json';
import quests from '../data/quests.json';
import type { DialogueDefinition, QuestDefinition } from '../domain/types';
import { validateDialogueData, validateQuestData } from '../core/dataValidation';
import { GameContext } from '../core/gameContext';
import { SCENE_KEYS } from '../core/constants';

function createTilesetDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D context is unavailable');
  }

  ctx.fillStyle = '#6fbf5f';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillStyle = '#5da74f';
  ctx.fillRect(0, 16, 32, 16);

  ctx.fillStyle = '#8a6d4e';
  ctx.fillRect(32, 0, 32, 32);
  ctx.fillStyle = '#6f573d';
  ctx.fillRect(32, 0, 32, 8);
  ctx.fillRect(32, 24, 32, 8);

  return canvas.toDataURL('image/png');
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot);
  }

  preload(): void {
    this.load.tilemapTiledJSON('town', 'assets/maps/town.json');
    this.load.image('townTiles', createTilesetDataUrl());
  }

  create(): void {
    const questErrors = validateQuestData(quests as QuestDefinition[]);
    const dialogueErrors = validateDialogueData(dialogues as DialogueDefinition[]);
    const errors = [...questErrors, ...dialogueErrors];

    if (errors.length > 0) {
      this.add
        .text(24, 24, ['Data validation failed:', ...errors].join('\n'), {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#ffdddd'
        })
        .setScrollFactor(0);
      return;
    }

    const context = new GameContext(quests as QuestDefinition[], dialogues as DialogueDefinition[]);
    this.registry.set('gameContext', context);

    window.__RPG_DEBUG__ = {
      ready: false,
      scene: 'boot'
    };

    this.scene.start(SCENE_KEYS.title);
  }
}
