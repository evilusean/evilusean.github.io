/**
 * Main entry point for the Hiragana Drop game
 * Sets up the Phaser game configuration and initializes the game
 */

const Phaser = require('phaser');
const MainScene = require('./scenes/MainScene');
const GameScene = require('./scenes/GameScene');

console.log('Game initializing...'); // Debug log

// Game configuration object
const config = {
    // Type of renderer (WebGL or Canvas)
    type: Phaser.AUTO,
    
    // Game window dimensions
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#000000',
    
    // Physics configuration
    physics: {
        default: 'matter',  // Using Matter.js physics engine
        matter: {
            gravity: { y: 0.3 },  // Vertical gravity strength
            debug: false  // Disable physics debug visualization
        }
    },
    
    // Scene list - order matters for loading sequence
    scene: [MainScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

window.addEventListener('load', () => {
    console.log('Window loaded, creating game...'); // Debug log
    const game = new Phaser.Game(config);
    window.game = game; // For debugging
});