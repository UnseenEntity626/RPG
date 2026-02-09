import Phaser from 'phaser';

export interface InputBundle {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  interact: Phaser.Input.Keyboard.Key;
  confirm: Phaser.Input.Keyboard.Key;
  cancel: Phaser.Input.Keyboard.Key;
  menu: Phaser.Input.Keyboard.Key;
}

export function createInput(scene: Phaser.Scene): InputBundle {
  const keyboard = scene.input.keyboard;
  if (!keyboard) {
    throw new Error('Keyboard is unavailable');
  }

  return {
    up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    interact: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    confirm: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    cancel: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    menu: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
  };
}
