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

        // Timed Mode submenu
        const timedButton = this.add.text(400, 280, 'Timed Mode', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Time options (initially hidden)
        const timeOptions = [
            { text: '60 Seconds', time: 60 },
            { text: '120 Seconds', time: 120 },
            { text: '300 Seconds', time: 300 },
            { text: 'Custom Time', time: -1 }
        ];

        const timeButtons = timeOptions.map((option, index) => {
            const button = this.add.text(400, 320 + (index * 40), option.text, {
                fontSize: '20px',
                color: '#ffff00'
            }).setOrigin(0.5).setInteractive();
            
            button.visible = false;

            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#ffff00'));
            button.on('pointerdown', () => {
                if (option.time === -1) {
                    this.showCustomTimeInput();
                } else {
                    this.scene.start('GameScene', { mode: 'timed', time: option.time });
                }
            });

            return button;
        });

        // Other mode buttons
        const eliminationButton = this.add.text(400, 480, 'Elimination Mode (3 Lives)', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        const survivalButton = this.add.text(400, 520, 'Survival Mode (All Characters)', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Toggle time options visibility
        let timeOptionsVisible = false;
        timedButton.on('pointerdown', () => {
            timeOptionsVisible = !timeOptionsVisible;
            timeButtons.forEach(button => button.visible = timeOptionsVisible);
            eliminationButton.visible = !timeOptionsVisible;
            survivalButton.visible = !timeOptionsVisible;
        });

        // Button hover effects
        [timedButton, eliminationButton, survivalButton].forEach(button => {
            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#ffff00'));
        });

        eliminationButton.on('pointerdown', () => {
            this.scene.start('GameScene', { mode: 'elimination' });
        });

        survivalButton.on('pointerdown', () => {
            this.scene.start('GameScene', { mode: 'survival' });
        });
    }

    showCustomTimeInput() {
        const inputBox = this.add.rectangle(400, 300, 200, 40, 0x000000);
        const inputText = this.add.text(400, 300, '', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const prompt = this.add.text(400, 260, 'Enter time in seconds:', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let input = '';
        
        const keyboardListener = this.input.keyboard.on('keydown', event => {
            if (event.keyCode === 8 && input.length > 0) {
                input = input.slice(0, -1);
            } else if (event.keyCode === 13 && input.length > 0) {
                const time = parseInt(input);
                if (time > 0) {
                    this.scene.start('GameScene', { mode: 'timed', time: time });
                }
            } else if (event.key >= '0' && event.key <= '9' && input.length < 4) {
                input += event.key;
            }
            inputText.setText(input);
        });
    }

    update() {
        // Game loop will go here
    }
}

module.exports = MainScene;