const Phaser = require('phaser');
const HIRAGANA_SET = require('../helpers/characters').HIRAGANA_SET;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.fallingCharacters = [];
        this.selectedCharacterIndex = -1;
        this.timeLeft = 30;
        this.characterStats = {};
        this.currentInput = '';
        
        // Initialize stats for each character
        HIRAGANA_SET.basic.forEach(char => {
            this.characterStats[char.hiragana] = {
                correct: 0,
                incorrect: 0,
                attempts: 0
            };
        });
    }

    preload() {
        console.log('GameScene preload');
    }

    create() {
        console.log('GameScene create');
        
        // Add timer text
        this.timerText = this.add.text(400, 50, 'Time: 30', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Start spawning characters
        this.spawnTimer = this.time.addEvent({
            delay: 2000,  // Spawn a new character every 2 seconds
            callback: this.spawnCharacter,
            callbackScope: this,
            loop: true
        });

        // Start game timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            repeat: 30  // 30 second game
        });

        // Add keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Add score display
        this.scoreText = this.add.text(400, 550, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    spawnCharacter() {
        // Get random character from HIRAGANA_SET
        const randomIndex = Phaser.Math.Between(0, HIRAGANA_SET.basic.length - 1);
        const character = HIRAGANA_SET.basic[randomIndex];

        // Create text object for the character
        const x = Phaser.Math.Between(100, 700);  // Random x position
        const charObject = this.add.text(x, -50, character.hiragana, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Add physics to the character
        this.matter.add.gameObject(charObject, {
            friction: 0,
            frictionAir: 0.001,
            bounce: 0.4,
            mass: 1
        });

        // Store character data
        this.fallingCharacters.push({
            gameObject: charObject,
            character: character,
            isSelected: false
        });

        console.log('Spawned character:', character.hiragana);
    }

    handleKeyInput(event) {
        if (this.selectedCharacterIndex === -1) {
            // If no character is selected, Tab key selects the first unselected character
            if (event.key === 'Tab') {
                event.preventDefault();
                this.selectNextCharacter();
            }
        } else {
            // If a character is selected, handle typing
            const currentChar = this.fallingCharacters[this.selectedCharacterIndex];
            if (currentChar) {
                if (event.key === currentChar.character.romaji[this.currentInput.length]) {
                    this.currentInput += event.key;
                    if (this.currentInput === currentChar.character.romaji) {
                        // Correct input
                        this.handleCorrectInput();
                    }
                }
            }
        }
    }

    selectNextCharacter() {
        // Deselect current character if any
        if (this.selectedCharacterIndex !== -1) {
            const current = this.fallingCharacters[this.selectedCharacterIndex];
            if (current) {
                current.gameObject.setColor('#00ff00');
                current.isSelected = false;
            }
        }

        // Find next unselected character
        for (let i = 0; i < this.fallingCharacters.length; i++) {
            if (!this.fallingCharacters[i].isSelected) {
                this.selectedCharacterIndex = i;
                this.fallingCharacters[i].isSelected = true;
                this.fallingCharacters[i].gameObject.setColor('#ff0000');
                this.currentInput = '';
                break;
            }
        }
    }

    handleCorrectInput() {
        const char = this.fallingCharacters[this.selectedCharacterIndex];
        char.gameObject.destroy();
        this.fallingCharacters.splice(this.selectedCharacterIndex, 1);
        this.selectedCharacterIndex = -1;
        this.currentInput = '';
        
        // Update score
        this.score = (this.score || 0) + 100;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText(`Time: ${this.timeLeft}`);
        
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    endGame() {
        // Stop timers
        this.spawnTimer.destroy();
        this.gameTimer.destroy();

        // Show final score
        this.add.text(400, 300, 'Game Over!', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    update() {
        // Clean up characters that have fallen off screen
        this.fallingCharacters = this.fallingCharacters.filter((char, index) => {
            if (char.gameObject.y > 650) {
                char.gameObject.destroy();
                if (index === this.selectedCharacterIndex) {
                    this.selectedCharacterIndex = -1;
                }
                return false;
            }
            return true;
        });
    }
}

module.exports = GameScene;