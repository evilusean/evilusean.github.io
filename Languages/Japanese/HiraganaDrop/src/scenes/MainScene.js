const Phaser = require('phaser');

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.selectedSet = 'hiragana';
    }

    create() {
        // Title
        this.add.text(400, 100, 'ひらがなドロップ', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Subtitles
        this.add.text(400, 170, 'Katakana Drop', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 210, 'Hiragana Drop', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Character set selection
        const hiraganaButton = this.add.text(300, 280, 'Hiragana', {
            fontSize: '24px',
            color: '#ff0000'  // Start with hiragana selected
        }).setOrigin(0.5).setInteractive();

        const katakanaButton = this.add.text(500, 280, 'Katakana', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        // Mode buttons
        const timedButton = this.add.text(400, 350, 'Timed Mode', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        const eliminationButton = this.add.text(400, 400, 'Elimination Mode', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        const survivalButton = this.add.text(400, 450, 'Survival Mode', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        // Character set selection logic
        hiraganaButton.on('pointerdown', () => {
            this.selectedSet = 'hiragana';
            hiraganaButton.setColor('#ff0000');
            katakanaButton.setColor('#00ff00');
        });

        katakanaButton.on('pointerdown', () => {
            this.selectedSet = 'katakana';
            katakanaButton.setColor('#ff0000');
            hiraganaButton.setColor('#00ff00');
        });

        // Button hover effects
        [timedButton, eliminationButton, survivalButton].forEach(button => {
            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#00ff00'));
        });

        // Game start handlers
        timedButton.on('pointerdown', () => {
            this.scene.start('GameScene', { 
                mode: 'timed',
                characterSet: this.selectedSet,
                time: 60
            });
        });

        eliminationButton.on('pointerdown', () => {
            this.scene.start('GameScene', {
                mode: 'elimination',
                characterSet: this.selectedSet,
                lives: 3
            });
        });

        survivalButton.on('pointerdown', () => {
            this.scene.start('GameScene', {
                mode: 'survival',
                characterSet: this.selectedSet
            });
        });
    }
}

module.exports = MainScene;