import Phaser from 'phaser';
import { GameContext } from '../core/gameContext';
import { SCENE_KEYS } from '../core/constants';

interface MenuOption {
  label: string;
  action: () => void;
}

export class MenuScene extends Phaser.Scene {
  private selected = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private options: MenuOption[] = [];
  private context!: GameContext;

  constructor() {
    super(SCENE_KEYS.menu);
  }

  create(): void {
    this.context = this.registry.get('gameContext') as GameContext;

    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.65);
    this.add
      .text(480, 120, 'Menu', {
        fontFamily: 'monospace',
        fontSize: '44px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.options = [
      {
        label: 'Save',
        action: () => {
          this.context.saveSystem.save('slot1', this.context.buildSaveData());
          this.statusText.setText('Saved to slot1');
        }
      },
      {
        label: 'Load',
        action: () => {
          const saveData = this.context.saveSystem.load('slot1');
          if (!saveData) {
            this.statusText.setText('No valid save found');
            return;
          }
          this.context.applySaveData(saveData);
          this.scene.stop(SCENE_KEYS.map);
          this.scene.stop(SCENE_KEYS.menu);
          this.scene.start(SCENE_KEYS.map);
        }
      },
      {
        label: 'Close',
        action: () => {
          this.closeMenu();
        }
      }
    ];

    this.optionTexts = this.options.map((option, index) =>
      this.add
        .text(480, 220 + index * 58, option.label, {
          fontFamily: 'monospace',
          fontSize: '32px',
          color: '#ffffff'
        })
        .setOrigin(0.5)
    );

    this.statusText = this.add
      .text(480, 430, 'Arrow: Select / Enter: Confirm / Esc: Close', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#d2dde4'
      })
      .setOrigin(0.5);

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
      this.options[this.selected].action();
    });

    keyboard.on('keydown-ESC', () => {
      this.closeMenu();
    });

    this.renderSelection();
  }

  private renderSelection(): void {
    for (let i = 0; i < this.optionTexts.length; i += 1) {
      this.optionTexts[i].setText(`${i === this.selected ? '> ' : '  '}${this.options[i].label}`);
    }
  }

  private closeMenu(): void {
    this.scene.stop(SCENE_KEYS.menu);
    this.scene.resume(SCENE_KEYS.map);
  }
}
