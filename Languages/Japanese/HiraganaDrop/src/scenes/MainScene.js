const Phaser = require('phaser');

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        console.log('MainScene constructed'); // Debug log
    }

    preload() {
        console.log('MainScene preload'); // Debug log
    }

    create() {
        console.log('MainScene create'); // Debug log
        
        // Add a title
        this.add.text(400, 100, 'ひらがなドロップ', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Add subtitle
        this.add.text(400, 200, 'Hiragana Drop', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Add start instruction
        this.add.text(400, 300, 'Click anywhere to start', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Make the scene interactive
        this.input.on('pointerdown', () => {
            console.log('Starting GameScene...'); // Debug log
            this.scene.start('GameScene');
        });
    }

    update() {
        // Game loop will go here
    }
}

module.exports = MainScene;