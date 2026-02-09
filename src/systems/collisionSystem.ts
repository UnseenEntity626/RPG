import Phaser from 'phaser';

export function setupCollision(
  player: Phaser.Physics.Arcade.Sprite,
  collisionLayer: Phaser.Tilemaps.TilemapLayer
): void {
  collisionLayer.setCollision([2]);
  player.scene.physics.add.collider(player, collisionLayer);
}
