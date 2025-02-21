const Phaser = require('phaser');
const HIRAGANA_SET = require('../helpers/characters').HIRAGANA_SET;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.fallingCharacters = [];
        this.currentInput = '';
        this.score = 0;
    }

    init(data) {
        this.gameMode = data.mode;
        if (this.gameMode === 'timed') {
            this.timeLeft = 60;
            this.lives = Infinity;
        } else {
            this.timeLeft = 0;
            this.lives = 3;
        }
    }

    create() {
        // Timer/Lives display
        this.statusText = this.add.text(400, 50, '', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Score display
        this.scoreText = this.add.text(400, 100, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Input display
        this.inputText = this.add.text(400, 550, '', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Spawn characters more slowly
        this.spawnTimer = this.time.addEvent({
            delay: 3000,  // Spawn every 3 seconds
            callback: this.spawnCharacter,
            callbackScope: this,
            loop: true
        });

        // Start game timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    }

    spawnCharacter() {
        const randomIndex = Phaser.Math.Between(0, HIRAGANA_SET.basic.length - 1);
        const character = HIRAGANA_SET.basic[randomIndex];

        const x = Phaser.Math.Between(100, 700);
        const charObject = this.add.text(x, -50, character.hiragana, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Much slower falling speed
        this.matter.add.gameObject(charObject, {
            friction: 0,
            frictionAir: 0.005,  // Increased air friction for slower falling
            bounce: 0.4,
            mass: 0.5  // Lighter mass for slower falling
        });

        this.fallingCharacters.push({
            gameObject: charObject,
            character: character
        });
    }

    handleKeyInput(event) {
        if (event.key === 'Escape') {
            this.scene.start('MainScene');
            return;
        }

        if (event.key.length === 1) {
            this.currentInput += event.key;
            this.inputText.setText(`Typing: ${this.currentInput}`);

            // Check all characters for matches
            this.fallingCharacters.forEach((char, index) => {
                if (char.character.romaji === this.currentInput) {
                    this.handleCorrectInput(index);
                    this.currentInput = '';
                    this.inputText.setText('');
                }
            });
        } else if (event.key === 'Backspace') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.inputText.setText(`Typing: ${this.currentInput}`);
        }
    }

    handleCorrectInput(index) {
        const char = this.fallingCharacters[index];
        char.gameObject.destroy();
        this.fallingCharacters.splice(index, 1);
        
        this.score += 100;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateTimer() {
        if (this.gameMode === 'timed') {
            this.timeLeft--;
            this.statusText.setText(`Time: ${this.timeLeft}`);
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        } else {
            this.timeLeft++;
            this.statusText.setText(`Lives: ${this.lives} | Time: ${this.timeLeft}`);
        }
    }

    endGame() {
        this.spawnTimer.destroy();
        this.gameTimer.destroy();
        this.input.keyboard.removeAllListeners();

        // Show final score
        this.add.text(400, 300, 'Game Over!', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 400, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Return to menu instruction
        this.add.text(400, 500, 'Press ESC to return to menu', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
    }

    update() {
        // Check for fallen characters
        this.fallingCharacters = this.fallingCharacters.filter(char => {
            if (char.gameObject.y > 650) {
                char.gameObject.destroy();
                if (this.gameMode === 'elimination') {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.endGame();
                    }
                }
                return false;
            }
            return true;
        });
    }
}

module.exports = GameScene;