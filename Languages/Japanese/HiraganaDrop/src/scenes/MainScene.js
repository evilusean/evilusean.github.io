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
add keyboard interaction on main screen

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
npm run deploy
*/
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.selectedSet = 'hiragana';
        this.menuItems = [];
        this.currentSelection = 0;
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

        // Create menu items array for navigation
        this.menuItems = [
            {
                text: this.add.text(300, 280, 'Hiragana', {
                    fontSize: '24px',
                    color: '#ff0000'
                }).setOrigin(0.5).setInteractive(),
                type: 'characterSet',
                value: 'hiragana'
            },
            {
                text: this.add.text(500, 280, 'Katakana', {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5).setInteractive(),
                type: 'characterSet',
                value: 'katakana'
            },
            {
                text: this.add.text(400, 350, 'Timed Mode', {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5).setInteractive(),
                type: 'mode',
                value: 'timed'
            },
            {
                text: this.add.text(400, 400, 'Elimination Mode', {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5).setInteractive(),
                type: 'mode',
                value: 'elimination'
            },
            {
                text: this.add.text(400, 450, 'Survival Mode', {
                    fontSize: '24px',
                    color: '#00ff00'
                }).setOrigin(0.5).setInteractive(),
                type: 'mode',
                value: 'survival'
            }
        ];

        // Set initial selection
        this.updateSelection();

        // Add keyboard controls
        this.input.keyboard.on('keydown', this.handleKeyboard, this);

        // Add mouse hover effects
        this.menuItems.forEach((item, index) => {
            item.text.on('pointerover', () => {
                this.currentSelection = index;
                this.updateSelection();
            });

            item.text.on('pointerdown', () => {
                this.handleSelection(item);
            });
        });
    }

    handleKeyboard(event) {
        switch(event.code) {
            case 'ArrowUp':
                this.currentSelection = (this.currentSelection - 1 + this.menuItems.length) % this.menuItems.length;
                this.updateSelection();
                break;
            case 'ArrowDown':
                this.currentSelection = (this.currentSelection + 1) % this.menuItems.length;
                this.updateSelection();
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                if (this.menuItems[this.currentSelection].type === 'characterSet') {
                    this.selectedSet = this.selectedSet === 'hiragana' ? 'katakana' : 'hiragana';
                    this.currentSelection = this.selectedSet === 'hiragana' ? 0 : 1;
                    this.updateSelection();
                }
                break;
            case 'Enter':
            case 'Space':
                this.handleSelection(this.menuItems[this.currentSelection]);
                break;
        }
    }

    updateSelection() {
        this.menuItems.forEach((item, index) => {
            if (index === this.currentSelection) {
                item.text.setColor('#ff0000');
            } else if (item.type === 'characterSet' && item.value === this.selectedSet) {
                item.text.setColor('#ff0000');
            } else {
                item.text.setColor('#00ff00');
            }
        });
    }

    handleSelection(item) {
        if (item.type === 'characterSet') {
            this.selectedSet = item.value;
            this.updateSelection();
        } else if (item.type === 'mode') {
            switch(item.value) {
                case 'timed':
                    this.scene.start('GameScene', {
                        mode: 'timed',
                        characterSet: this.selectedSet,
                        time: 60
                    });
                    break;
                case 'elimination':
                    this.scene.start('GameScene', {
                        mode: 'elimination',
                        characterSet: this.selectedSet,
                        lives: 3
                    });
                    break;
                case 'survival':
                    this.scene.start('GameScene', {
                        mode: 'survival',
                        characterSet: this.selectedSet
                    });
                    break;
            }
        }
    }
}

module.exports = MainScene;