const Phaser = require('phaser');
/* 
TO DO: Future Sean
add mobile support? all new cells have a built in keyboard, could be run mobile as well
    will need to fix ratios, and add responsiveness - future sean problems
Fix logic so it doesn't give the same character twice in a row
speed up matrix effect slightly, almost good 'fadeDelay' in GameScene.js
Fix timed mode, add presets
Fix elimination mode, add presets
Favicon
add a background clear, some afterimages don't disapear if you run in background
    add a force clear background image every 5 minutes so there is no buildup

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

Future Sean: 
Don't forget to run 'npm run build' after making changes to upload to github pages
*/
/**
 * MainScene - Handles the main menu and game mode selection
 * This is the first scene players see when starting the game
 */
class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });  // Scene identifier
        
        // Track which character set is selected (hiragana/katakana)
        this.selectedSet = 'hiragana';
        
        // Array to store menu items for navigation
        this.menuItems = [];
        
        // Track current menu selection for keyboard navigation
        this.currentSelection = 0;
    }

    /**
     * Creates all game objects for the main menu
     * Called automatically by Phaser after scene starts
     */
    create() {
        // Create title text
        this.add.text(400, 100, 'Hiragana Drop', {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        // Create character set selection buttons
        this.createCharacterSetButtons();

        // Create game mode buttons
        this.createGameModeButtons();

        // Set up keyboard controls
        this.input.keyboard.on('keydown', this.handleKeyboard, this);
    }

    /**
     * Creates buttons for selecting character set (Hiragana/Katakana)
     */
    createCharacterSetButtons() {
        // Add Hiragana button
        const hiraganaButton = {
            text: this.add.text(300, 280, 'Hiragana', {
                fontSize: '24px',
                color: '#ff0000'
            }).setOrigin(0.5).setInteractive(),
            type: 'characterSet',
            value: 'hiragana'
        };

        // Add Katakana button
        const katakanaButton = {
            text: this.add.text(500, 280, 'Katakana', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive(),
            type: 'characterSet',
            value: 'katakana'
        };

        this.menuItems.push(hiraganaButton, katakanaButton);
    }

    /**
     * Shows time selection presets for Timed Mode
     */
    showTimePresets() {
        // Define time preset options
        const presets = [
            { text: '60 Seconds', value: 60 },
            { text: '120 Seconds', value: 120 },
            { text: '300 Seconds', value: 300 },
            { text: 'Custom Time', value: 'custom' }
        ];

        // Create buttons for each preset
        const presetMenu = presets.map((preset, index) => {
            return this.add.text(400, 250 + (index * 50), preset.text, {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive()
            .on('pointerdown', () => {
                if (preset.value === 'custom') {
                    this.showCustomTimeInput();
                } else {
                    // Start game with selected time preset
                    this.scene.start('GameScene', {
                        mode: 'timed',
                        characterSet: this.selectedSet,
                        time: preset.value
                    });
                }
            });
        });
    }

    /**
     * Handles keyboard input for menu navigation
     * @param {KeyboardEvent} event - The keyboard event
     */
    handleKeyboard(event) {
        switch(event.code) {
            case 'ArrowUp':
                // Move selection up
                this.currentSelection = (this.currentSelection - 1 + this.menuItems.length) % this.menuItems.length;
                break;
            case 'ArrowDown':
                // Move selection down
                this.currentSelection = (this.currentSelection + 1) % this.menuItems.length;
                break;
            case 'Enter':
                // Select current menu item
                this.handleSelection(this.menuItems[this.currentSelection]);
                break;
        }
        this.updateSelection();
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
                    this.showTimePresets();
                    break;
                case 'elimination':
                    this.showLifePresets();
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

    showLifePresets() {
        const presets = [
            { text: '1 Life', value: 1 },
            { text: '3 Lives', value: 3 },
            { text: '5 Lives', value: 5 },
            { text: 'Custom Lives', value: 'custom' }
        ];

        const presetMenu = presets.map((preset, index) => {
            return this.add.text(400, 250 + (index * 50), preset.text, {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive()
            .on('pointerdown', () => {
                if (preset.value === 'custom') {
                    this.showCustomLivesInput();
                } else {
                    this.scene.start('GameScene', {
                        mode: 'elimination',
                        characterSet: this.selectedSet,
                        lives: preset.value
                    });
                }
            });
        });
    }
}

module.exports = MainScene;