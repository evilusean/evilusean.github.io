const Phaser = require('phaser');
/* 
TO DO: Future Sean
Remove the green boxes
Theres a weird red dot on the falling katakana/hiragana - remove that
I got an error after testing, forgot to save, need to find that again, something is broke
    Found it : errors out on elimination mode instead of showing game over screen
Fix the fade, it's uniform, it should fade from top to bottom, 
add mobile support? all new cells have a built in keyboard, could be run mobile as well
    will need to fix ratios, and add responsiveness - future sean problems
not showing up on github pages 

To Start : 
npm run clean
npm install
npm run build
npm start

deploy :
rm -rf node_modules
rm -rf dist
npm install
npm run build
npm run deploynpm run deploy
*/
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
            color: '#ff0000'
        }).setOrigin(0.5).setInteractive();

        const katakanaButton = this.add.text(500, 280, 'Katakana', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5).setInteractive();

        // Mode buttons (initially hidden)
        const modeButtons = {
            timed: this.add.text(400, 350, 'Timed Mode', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive(),

            elimination: this.add.text(400, 400, 'Elimination Mode', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive(),

            survival: this.add.text(400, 450, 'Survival Mode', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive()
        };

        // Preset options (initially hidden)
        const timePresets = [
            { text: '60 Seconds', time: 60 },
            { text: '120 Seconds', time: 120 },
            { text: '300 Seconds', time: 300 },
            { text: 'Custom Time', time: -1 }
        ].map((preset, index) => {
            const btn = this.add.text(400, 350 + (index * 40), preset.text, {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive();
            btn.visible = false;
            return { button: btn, value: preset.time };
        });

        const lifePresets = [
            { text: '3 Lives', lives: 3 },
            { text: '5 Lives', lives: 5 },
            { text: '10 Lives', lives: 10 }
        ].map((preset, index) => {
            const btn = this.add.text(400, 350 + (index * 40), preset.text, {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive();
            btn.visible = false;
            return { button: btn, value: preset.lives };
        });

        // Hide all presets initially
        const hideAllPresets = () => {
            timePresets.forEach(p => p.button.visible = false);
            lifePresets.forEach(p => p.button.visible = false);
            Object.values(modeButtons).forEach(btn => btn.visible = true);
        };

        // Character set selection logic
        hiraganaButton.on('pointerdown', () => {
            this.selectedSet = 'hiragana';
            hiraganaButton.setColor('#ff0000');
            katakanaButton.setColor('#00ff00');
            hideAllPresets();
        });

        katakanaButton.on('pointerdown', () => {
            this.selectedSet = 'katakana';
            katakanaButton.setColor('#ff0000');
            hiraganaButton.setColor('#00ff00');
            hideAllPresets();
        });

        // Mode selection logic
        modeButtons.timed.on('pointerdown', () => {
            Object.values(modeButtons).forEach(btn => btn.visible = false);
            timePresets.forEach(p => p.button.visible = true);
        });

        modeButtons.elimination.on('pointerdown', () => {
            Object.values(modeButtons).forEach(btn => btn.visible = false);
            lifePresets.forEach(p => p.button.visible = true);
        });

        modeButtons.survival.on('pointerdown', () => {
            this.scene.start('GameScene', {
                mode: 'survival',
                characterSet: this.selectedSet
            });
        });

        // Preset handlers
        timePresets.forEach(preset => {
            preset.button.on('pointerdown', () => {
                if (preset.value === -1) {
                    this.showCustomTimeInput();
                } else {
                    this.scene.start('GameScene', {
                        mode: 'timed',
                        characterSet: this.selectedSet,
                        time: preset.value
                    });
                }
            });
        });

        lifePresets.forEach(preset => {
            preset.button.on('pointerdown', () => {
                this.scene.start('GameScene', {
                    mode: 'elimination',
                    characterSet: this.selectedSet,
                    lives: preset.value
                });
            });
        });

        // Hover effects
        const allButtons = [
            hiraganaButton, 
            katakanaButton, 
            ...Object.values(modeButtons),
            ...timePresets.map(p => p.button),
            ...lifePresets.map(p => p.button)
        ];

        allButtons.forEach(button => {
            button.on('pointerover', () => button.setColor('#ff0000'));
            button.on('pointerout', () => {
                if ((button === hiraganaButton && this.selectedSet === 'hiragana') ||
                    (button === katakanaButton && this.selectedSet === 'katakana')) {
                    return;
                }
                button.setColor('#00ff00');
            });
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
                    this.scene.start('GameScene', {
                        mode: 'timed',
                        characterSet: this.selectedSet,
                        time: time
                    });
                }
            } else if (event.key >= '0' && event.key <= '9' && input.length < 4) {
                input += event.key;
            }
            inputText.setText(input);
        });
    }
}

module.exports = MainScene;