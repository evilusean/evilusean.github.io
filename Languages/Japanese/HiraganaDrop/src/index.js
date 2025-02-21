const Phaser = require('phaser');
const MainScene = require('./scenes/MainScene').default;
const GameScene = require('./scenes/GameScene').default;

console.log('Game initializing...'); // Debug log

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
    console.log('Window loaded, creating game...'); // Debug log
    const game = new Phaser.Game(config);
});