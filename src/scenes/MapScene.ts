import Phaser from 'phaser';
import { TILE_SIZE, SCENE_KEYS } from '../core/constants';
import type { DialogueNode, Direction, MapEvent } from '../domain/types';
import { parseMapEvents } from '../core/mapEvents';
import { GameContext } from '../core/gameContext';
import { setupCollision } from '../systems/collisionSystem';
import { createInput, type InputBundle } from '../systems/inputSystem';

interface ActiveDialogueState {
  definitionId: string;
  node: DialogueNode;
  selectedOption: number;
  pendingEvent: MapEvent | null;
}

export class MapScene extends Phaser.Scene {
  private context!: GameContext;
  private inputKeys!: InputBundle;
  private player!: Phaser.Physics.Arcade.Sprite;
  private mapEvents: MapEvent[] = [];
  private facing: Direction = 'down';
  private dialogueBox!: Phaser.GameObjects.Rectangle;
  private dialogueText!: Phaser.GameObjects.Text;
  private optionText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private activeDialogue: ActiveDialogueState | null = null;

  constructor() {
    super(SCENE_KEYS.map);
  }

  create(): void {
    this.context = this.registry.get('gameContext') as GameContext;
    this.context.setCurrentMap('town');

    const map = this.make.tilemap({ key: 'town' });
    const tileset = map.addTilesetImage('town_tiles', 'townTiles');
    if (!tileset) {
      throw new Error('Tileset town_tiles is unavailable');
    }

    map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collision', tileset, 0, 0);
    if (!collisionLayer) {
      throw new Error('Collision layer is unavailable');
    }

    const parsed = parseMapEvents(map);
    this.mapEvents = parsed.events;

    if (!this.textures.exists('player')) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x2b3942, 1);
      graphics.fillRect(0, 0, 24, 24);
      graphics.fillStyle(0xe4c995, 1);
      graphics.fillRect(5, 4, 14, 8);
      graphics.fillStyle(0x5f7d90, 1);
      graphics.fillRect(4, 14, 16, 8);
      graphics.generateTexture('player', 24, 24);
      graphics.destroy();
    }

    const startState = this.context.getState().player;
    const spawnTile = startState.mapId === 'town' ? startState : { x: parsed.spawn.x, y: parsed.spawn.y };

    this.player = this.physics.add.sprite(
      spawnTile.x * TILE_SIZE + TILE_SIZE / 2,
      spawnTile.y * TILE_SIZE + TILE_SIZE / 2,
      'player'
    );

    this.player.setSize(20, 20).setOffset(2, 2);
    this.player.setCollideWorldBounds(true);
    this.facing = startState.direction;

    setupCollision(this.player, collisionLayer);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);

    this.inputKeys = createInput(this);
    this.createDialogueUI();
    this.createDebugHUD();

    window.__RPG_DEBUG__ = {
      ready: true,
      scene: 'map'
    };
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.inputKeys.menu) && !this.activeDialogue) {
      this.openMenu();
      return;
    }

    if (this.activeDialogue) {
      this.player.setVelocity(0, 0);
      this.updateDialogueInput();
      this.updateDebug();
      return;
    }

    this.updateMovement();

    if (Phaser.Input.Keyboard.JustDown(this.inputKeys.interact)) {
      const event = this.findFacingEvent();
      if (event) {
        this.handleEventInteraction(event);
      }
    }

    this.updateDebug();
  }

  private createDialogueUI(): void {
    this.dialogueBox = this.add
      .rectangle(480, 460, 920, 140, 0x091219, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.2)
      .setScrollFactor(0)
      .setVisible(false);

    this.dialogueText = this.add
      .text(40, 402, '', {
        fontFamily: 'monospace',
        fontSize: '21px',
        color: '#ffffff',
        wordWrap: { width: 880 }
      })
      .setScrollFactor(0)
      .setVisible(false);

    this.optionText = this.add
      .text(40, 470, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#dce7ef'
      })
      .setScrollFactor(0)
      .setVisible(false);

    this.add
      .text(40, 18, 'E: Interact  ESC: Menu', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff'
      })
      .setScrollFactor(0);
  }

  private createDebugHUD(): void {
    this.debugText = this.add
      .text(720, 16, '', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#eff7ff',
        align: 'right'
      })
      .setScrollFactor(0)
      .setOrigin(1, 0);

    this.updateDebug();
  }

  private updateDebug(): void {
    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);
    this.context.setPlayerTile(tileX, tileY, this.facing);

    const questState = this.context.questSystem.getQuestState('lost_apple');
    this.debugText.setText([
      `Pos: ${tileX},${tileY}`,
      `Facing: ${this.facing}`,
      `Quest: ${questState.status}${questState.stepId ? `(${questState.stepId})` : ''}`,
      `Flag elder_helped: ${String(this.context.getState().flags.elder_helped ?? false)}`
    ]);

    window.__RPG_DEBUG__ = {
      ready: true,
      scene: 'map',
      pos: { x: tileX, y: tileY },
      quest: questState
    };
  }

  private updateMovement(): void {
    const speed = 130;
    let velocityX = 0;
    let velocityY = 0;

    if (this.inputKeys.left.isDown) {
      velocityX = -speed;
      this.facing = 'left';
    } else if (this.inputKeys.right.isDown) {
      velocityX = speed;
      this.facing = 'right';
    } else if (this.inputKeys.up.isDown) {
      velocityY = -speed;
      this.facing = 'up';
    } else if (this.inputKeys.down.isDown) {
      velocityY = speed;
      this.facing = 'down';
    }

    this.player.setVelocity(velocityX, velocityY);
  }

  private findFacingEvent(): MapEvent | undefined {
    const tileX = Math.floor(this.player.x / TILE_SIZE);
    const tileY = Math.floor(this.player.y / TILE_SIZE);

    const target = { x: tileX, y: tileY };
    if (this.facing === 'left') {
      target.x -= 1;
    } else if (this.facing === 'right') {
      target.x += 1;
    } else if (this.facing === 'up') {
      target.y -= 1;
    } else {
      target.y += 1;
    }

    return this.mapEvents.find((event) => event.x === target.x && event.y === target.y);
  }

  private handleEventInteraction(event: MapEvent): void {
    if (event.interaction.dialogueId) {
      const started = this.context.dialogueSystem.start(event.interaction.dialogueId);
      if (!started) {
        this.applyEventEffects(event);
        return;
      }

      this.activeDialogue = {
        definitionId: started.definition.id,
        node: started.node,
        selectedOption: 0,
        pendingEvent: event
      };
      this.renderDialogue();
      return;
    }

    this.applyEventEffects(event);
  }

  private applyEventEffects(event: MapEvent): void {
    const questAction = event.interaction.questAction;
    if (questAction) {
      if (questAction.action === 'start') {
        this.context.questSystem.startQuest(questAction.questId);
      }
      if (questAction.action === 'advance' && questAction.trigger) {
        this.context.questSystem.advanceQuest(questAction.questId, questAction.trigger);
      }
    }

    if (event.interaction.trigger) {
      this.context.questSystem.advanceByTrigger(event.interaction.trigger);
    }
  }

  private updateDialogueInput(): void {
    if (!this.activeDialogue) {
      return;
    }

    const node = this.activeDialogue.node;

    if (node.options && node.options.length > 0) {
      if (Phaser.Input.Keyboard.JustDown(this.inputKeys.up)) {
        this.activeDialogue.selectedOption =
          (this.activeDialogue.selectedOption - 1 + node.options.length) % node.options.length;
        this.renderDialogue();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.inputKeys.down)) {
        this.activeDialogue.selectedOption =
          (this.activeDialogue.selectedOption + 1) % node.options.length;
        this.renderDialogue();
        return;
      }

      if (Phaser.Input.Keyboard.JustDown(this.inputKeys.confirm) || Phaser.Input.Keyboard.JustDown(this.inputKeys.interact)) {
        const nextNode = this.context.dialogueSystem.next(
          this.activeDialogue.definitionId,
          node.id,
          this.activeDialogue.selectedOption
        );

        if (nextNode) {
          this.activeDialogue.node = nextNode;
          this.activeDialogue.selectedOption = 0;
          this.renderDialogue();
          return;
        }

        this.closeDialogue();
      }

      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputKeys.confirm) || Phaser.Input.Keyboard.JustDown(this.inputKeys.interact)) {
      const nextNode = this.context.dialogueSystem.next(this.activeDialogue.definitionId, node.id);
      if (nextNode) {
        this.activeDialogue.node = nextNode;
        this.activeDialogue.selectedOption = 0;
        this.renderDialogue();
        return;
      }
      this.closeDialogue();
    }
  }

  private renderDialogue(): void {
    if (!this.activeDialogue) {
      return;
    }

    this.dialogueBox.setVisible(true);
    this.dialogueText.setVisible(true);
    this.optionText.setVisible(true);

    const node = this.activeDialogue.node;
    this.dialogueText.setText(node.text);

    if (node.options && node.options.length > 0) {
      this.optionText.setText(
        node.options
          .map((option, index) => `${index === this.activeDialogue?.selectedOption ? '> ' : '  '}${option.text}`)
          .join('\n')
      );
    } else {
      this.optionText.setText('Enter / E で続行');
    }
  }

  private closeDialogue(): void {
    if (this.activeDialogue?.pendingEvent) {
      this.applyEventEffects(this.activeDialogue.pendingEvent);
    }

    this.activeDialogue = null;
    this.dialogueBox.setVisible(false);
    this.dialogueText.setVisible(false).setText('');
    this.optionText.setVisible(false).setText('');
  }

  private openMenu(): void {
    this.scene.launch(SCENE_KEYS.menu);
    this.scene.pause();
  }
}
