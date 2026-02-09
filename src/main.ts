import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { MapScene } from './scenes/MapScene';
import { MenuScene } from './scenes/MenuScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 960,
  height: 540,
  backgroundColor: '#111922',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, MapScene, MenuScene]
};

window.__RPG_DEBUG__ = { ready: false, scene: 'init' };

// eslint-disable-next-line no-new
new Phaser.Game(config);
