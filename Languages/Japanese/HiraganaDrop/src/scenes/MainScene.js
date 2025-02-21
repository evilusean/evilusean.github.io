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
        
        // Title
        this.add.text(400, 100, 'ひらがなドロップ', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(400, 200, 'Hiragana Drop', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Mode selection buttons
        const timedButton = this.add.text(400, 300, 'Timed Mode (60s)', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        const eliminationButton = this.add.text(400, 350, 'Elimination Mode (3 Lives)', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Button hover effects
        [timedButton, eliminationButton].forEach(button => {
            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#ffff00'));
        });

        // Button click handlers
        timedButton.on('pointerdown', () => {
            this.scene.start('GameScene', { mode: 'timed' });
        });

        eliminationButton.on('pointerdown', () => {
            this.scene.start('GameScene', { mode: 'elimination' });
        });
    }

    update() {
        // Game loop will go here
    }
}

module.exports = MainScene;