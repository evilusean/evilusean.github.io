const Phaser = require('phaser');
/* 
TO DO: Future Sean
add mobile support? all new cells have a built in keyboard, could be run mobile as well
    will need to fix ratios, and add responsiveness - future sean problems
Fix logic so it doesn't give the same character twice in a row
fireworks
fix timed mode, no timer - make sure it only does timed mode so it doesn't blow up the codebase(again)


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
        
        // Track active preset menu
        this.activePresetMenu = null;
        
        // Track main menu visibility
        this.mainMenuVisible = true;
    }

    /**
     * Creates all game objects for the main menu
     * Called automatically by Phaser after scene starts
     */
    create() {
        this.createMainMenu();
    }

    createMainMenu() {
        // Clear any existing menus
        this.clearAllMenus();
        
        this.mainMenuVisible = true;

        // Create title
        this.add.text(400, 100, 'Hiragana Drop', {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);

        // Create menu items
        this.menuItems = [
            this.createMenuItem(300, 280, 'Hiragana', 'characterSet', 'hiragana'),
            this.createMenuItem(500, 280, 'Katakana', 'characterSet', 'katakana'),
            this.createMenuItem(400, 350, 'Timed Mode', 'mode', 'timed'),
            this.createMenuItem(400, 400, 'Elimination Mode', 'mode', 'elimination'),
            this.createMenuItem(400, 450, 'Survival Mode', 'mode', 'survival')
        ];

        this.updateSelection();
    }

    createMenuItem(x, y, text, type, value) {
        const menuItem = {
            text: this.add.text(x, y, text, {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive(),
            type: type,
            value: value
        };

        menuItem.text.on('pointerdown', () => this.handleSelection(menuItem));
        menuItem.text.on('pointerover', () => {
            this.currentSelection = this.menuItems.indexOf(menuItem);
            this.updateSelection();
        });

        return menuItem;
    }

    clearAllMenus() {
        // Clear main menu items
        if (this.menuItems) {
            this.menuItems.forEach(item => item.text.destroy());
            this.menuItems = [];
        }

        // Clear preset menu
        if (this.activePresetMenu) {
            this.activePresetMenu.forEach(text => text.destroy());
            this.activePresetMenu = null;
        }
    }

    /**
     * Shows time selection presets for Timed Mode
     */
    showTimePresets() {
        // Hide main menu
        this.mainMenuVisible = false;
        this.menuItems.forEach(item => item.text.setVisible(false));

        const presets = [
            { text: '← Back to Menu', value: 'back' },
            { text: '60 Seconds', value: 60 },
            { text: '120 Seconds', value: 120 },
            { text: '300 Seconds', value: 300 },
            { text: 'Custom Time', value: 'custom' }
        ];

        this.activePresetMenu = presets.map((preset, index) => {
            return this.add.text(400, 200 + (index * 50), preset.text, {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive()
            .on('pointerdown', () => {
                if (preset.value === 'back') {
                    this.returnToMainMenu();
                } else if (preset.value === 'custom') {
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
    }

    /**
     * Shows life selection presets for Elimination Mode
     */
    showLifePresets() {
        // Hide main menu
        this.mainMenuVisible = false;
        this.menuItems.forEach(item => item.text.setVisible(false));

        const presets = [
            { text: '← Back to Menu', value: 'back' },
            { text: '1 Life', value: 1 },
            { text: '3 Lives', value: 3 },
            { text: '5 Lives', value: 5 },
            { text: 'Custom Lives', value: 'custom' }
        ];

        this.activePresetMenu = presets.map((preset, index) => {
            return this.add.text(400, 200 + (index * 50), preset.text, {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5).setInteractive()
            .on('pointerdown', () => {
                if (preset.value === 'back') {
                    this.returnToMainMenu();
                } else if (preset.value === 'custom') {
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

    returnToMainMenu() {
        if (this.activePresetMenu) {
            this.activePresetMenu.forEach(text => text.destroy());
            this.activePresetMenu = null;
        }
        this.menuItems.forEach(item => item.text.setVisible(true));
        this.mainMenuVisible = true;
        this.updateSelection();
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

    /**
     * Shows custom time input for Timed Mode
     */
    showCustomTimeInput() {
        // Implementation for custom time input
        // You can add this later if needed
    }

    /**
     * Shows custom lives input for Elimination Mode
     */
    showCustomLivesInput() {
        // Implementation for custom lives input
        // You can add this later if needed
    }

    handleKeyboard(event) {
        if (this.mainMenuVisible) {
            switch(event.code) {
                case 'ArrowUp':
                    this.currentSelection = (this.currentSelection - 1 + this.menuItems.length) % this.menuItems.length;
                    this.updateSelection();
                    break;
                case 'ArrowDown':
                    this.currentSelection = (this.currentSelection + 1) % this.menuItems.length;
                    this.updateSelection();
                    break;
                case 'Enter':
                    this.handleSelection(this.menuItems[this.currentSelection]);
                    break;
            }
        } else if (event.code === 'Escape') {
            this.returnToMainMenu();
        }
    }

    updateSelection() {
        if (!this.mainMenuVisible) return;
        
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
}

module.exports = MainScene;