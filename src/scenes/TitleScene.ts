import Phaser from 'phaser';
import { GameContext } from '../core/gameContext';
import { SCENE_KEYS } from '../core/constants';

export class TitleScene extends Phaser.Scene {
  private options: string[] = ['New Game', 'Continue'];
  private selected = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private context!: GameContext;

  constructor() {
    super(SCENE_KEYS.title);
  }

  create(): void {
    this.context = this.registry.get('gameContext') as GameContext;

    this.cameras.main.setBackgroundColor('#20303a');
    this.add.text(480, 120, 'RPG Browser MVP', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(480, 188, 'Arrow: Move Cursor / Enter: Select', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#b7c9d4'
    }).setOrigin(0.5);

    this.optionTexts = this.options.map((label, index) =>
      this.add
        .text(480, 260 + index * 56, label, {
          fontFamily: 'monospace',
          fontSize: '34px',
          color: '#ffffff'
        })
        .setOrigin(0.5)
    );

    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    keyboard.on('keydown-UP', () => {
      this.selected = (this.selected - 1 + this.options.length) % this.options.length;
      this.renderSelection();
    });

    keyboard.on('keydown-DOWN', () => {
      this.selected = (this.selected + 1) % this.options.length;
      this.renderSelection();
    });

    keyboard.on('keydown-ENTER', () => {
      this.selectOption();
    });

    this.renderSelection();
    window.__RPG_DEBUG__ = { ready: false, scene: 'title' };
  }

  private canContinue(): boolean {
    return this.context.saveSystem.hasSave('slot1');
  }

  private renderSelection(): void {
    for (let i = 0; i < this.optionTexts.length; i += 1) {
      const isSelected = i === this.selected;
      const isDisabled = i === 1 && !this.canContinue();
      const baseLabel = this.options[i];
      this.optionTexts[i].setText(`${isSelected ? '> ' : '  '}${baseLabel}${isDisabled ? ' (No Save)' : ''}`);
      this.optionTexts[i].setColor(isDisabled ? '#74818a' : '#ffffff');
    }
  }

  private selectOption(): void {
    if (this.selected === 0) {
      this.context.startNewGame({ x: 2, y: 2 });
      this.scene.start(SCENE_KEYS.map);
      return;
    }

    if (!this.canContinue()) {
      return;
    }

    const saveData = this.context.saveSystem.load('slot1');
    if (!saveData) {
      return;
    }

    this.context.applySaveData(saveData);
    this.scene.start(SCENE_KEYS.map);
  }
}
