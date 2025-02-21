const Phaser = require('phaser');

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.selectedSet = 'hiragana'; // Default selection
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

        // Character set selection
        const hiraganaButton = this.add.text(300, 240, 'Hiragana', {
            fontSize: '24px',
            color: '#ff0000'  // Start with hiragana selected
        }).setOrigin(0.5).setInteractive();

        const katakanaButton = this.add.text(500, 240, 'Katakana', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Character set selection logic
        hiraganaButton.on('pointerdown', () => {
            this.selectedSet = 'hiragana';
            hiraganaButton.setColor('#ff0000');
            katakanaButton.setColor('#ffff00');
        });

        katakanaButton.on('pointerdown', () => {
            this.selectedSet = 'katakana';
            katakanaButton.setColor('#ff0000');
            hiraganaButton.setColor('#ffff00');
        });

        // Timed Mode submenu
        const timedButton = this.add.text(400, 260, 'Timed Mode', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Time options
        const timeOptions = [
            { text: '60 Seconds', time: 60 },
            { text: '120 Seconds', time: 120 },
            { text: '300 Seconds', time: 300 },
            { text: 'Custom Time', time: -1 }
        ];

        // Lives Mode submenu
        const livesButton = this.add.text(400, 300, 'Lives Mode', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Lives options
        const livesOptions = [
            { text: '3 Lives', lives: 3 },
            { text: '5 Lives', lives: 5 },
            { text: '10 Lives', lives: 10 },
            { text: 'Custom Lives', lives: -1 }
        ];

        // Create option buttons (initially hidden)
        const timeButtons = this.createOptionButtons(timeOptions, 340, 'time');
        const livesButtons = this.createOptionButtons(livesOptions, 340, 'lives');

        const survivalButton = this.add.text(400, 340, 'Survival Mode (All Characters)', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        // Toggle button visibility
        let timeOptionsVisible = false;
        let livesOptionsVisible = false;

        timedButton.on('pointerdown', () => {
            timeOptionsVisible = !timeOptionsVisible;
            livesOptionsVisible = false;
            timeButtons.forEach(btn => btn.visible = timeOptionsVisible);
            livesButtons.forEach(btn => btn.visible = false);
            survivalButton.visible = !timeOptionsVisible;
            livesButton.visible = !timeOptionsVisible;
        });

        livesButton.on('pointerdown', () => {
            livesOptionsVisible = !livesOptionsVisible;
            timeOptionsVisible = false;
            livesButtons.forEach(btn => btn.visible = livesOptionsVisible);
            timeButtons.forEach(btn => btn.visible = false);
            survivalButton.visible = !livesOptionsVisible;
            timedButton.visible = !livesOptionsVisible;
        });

        // Button hover effects
        [timedButton, livesButton, survivalButton].forEach(button => {
            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#ffff00'));
        });

        // Update scene start to include character set
        const startGame = (mode, options = {}) => {
            this.scene.start('GameScene', {
                mode,
                characterSet: this.selectedSet,
                ...options
            });
        };

        // Update all game start calls to use the new startGame function
        timedButton.on('pointerdown', () => startGame('timed', { time: 60 }));
        livesButton.on('pointerdown', () => startGame('elimination', { lives: 3 }));
        survivalButton.on('pointerdown', () => startGame('survival'));
    }

    createOptionButtons(options, startY, type) {
        return options.map((option, index) => {
            const button = this.add.text(400, startY + (index * 40), option.text, {
                fontSize: '20px',
                color: '#ffff00'
            }).setOrigin(0.5).setInteractive();
            
            button.visible = false;

            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => button.setColor('#ffff00'));
            button.on('pointerdown', () => {
                if (type === 'time' && option.time === -1) {
                    this.showCustomInput('time');
                } else if (type === 'lives' && option.lives === -1) {
                    this.showCustomInput('lives');
                } else {
                    const params = {
                        mode: type === 'time' ? 'timed' : 'elimination',
                        [type]: type === 'time' ? option.time : option.lives
                    };
                    this.scene.start('GameScene', params);
                }
            });

            return button;
        });
    }

    showCustomInput(type) {
        const inputBox = this.add.rectangle(400, 300, 200, 40, 0x000000);
        const inputText = this.add.text(400, 300, '', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const prompt = this.add.text(400, 260, 
            type === 'time' ? 'Enter time in seconds:' : 'Enter number of lives:', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let input = '';
        
        const keyboardListener = this.input.keyboard.on('keydown', event => {
            if (event.keyCode === 8 && input.length > 0) {
                input = input.slice(0, -1);
            } else if (event.keyCode === 13 && input.length > 0) {
                const value = parseInt(input);
                if (value > 0) {
                    const params = {
                        mode: type === 'time' ? 'timed' : 'elimination',
                        [type]: value
                    };
                    this.scene.start('GameScene', params);
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