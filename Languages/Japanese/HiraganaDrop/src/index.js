import Phaser from 'phaser';
import MainScene from './scenes/MainScene';
import GameScene from './scenes/GameScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.3 },
            debug: true  // This will show physics bodies - useful for testing
        }
    },
    scene: [MainScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});