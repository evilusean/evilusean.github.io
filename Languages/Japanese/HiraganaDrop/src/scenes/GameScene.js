const Phaser = require('phaser');
const HIRAGANA_SET = require('../helpers/characters').HIRAGANA_SET;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.fallingCharacters = [];
        this.currentInput = '';
        this.score = 0;
        this.missedCharacters = {};  // Track missed characters
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
        this.missedCharacters = {};
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

        // Much slower spawn rate
        this.spawnTimer = this.time.addEvent({
            delay: 5000,  // Spawn every 5 seconds
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
            frictionAir: 0.02,  // Significantly increased for much slower falling
            bounce: 0.4,
            mass: 0.1,  // Much lighter mass
            render: {
                fillStyle: 'transparent',  // Remove physics body visual
                lineWidth: 0
            }
        });

        // Create trail effect
        const trail = [];
        const trailCount = 5;
        for (let i = 0; i < trailCount; i++) {
            const trailChar = this.add.text(x, -50, character.hiragana, {
                fontSize: '48px',
                color: '#00ff00',
                fontFamily: '"Noto Sans JP", sans-serif',
                alpha: 0.2 - (i * 0.03)
            }).setOrigin(0.5);
            trail.push(trailChar);
        }

        this.fallingCharacters.push({
            gameObject: charObject,
            character: character,
            trail: trail,
            lastPos: { x: x, y: -50 }
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

            // Auto-reset after 2 characters
            if (this.currentInput.length >= 2) {
                // Check for match before resetting
                this.checkForMatch();
                this.currentInput = '';
                this.inputText.setText('');
            } else {
                // Check for single character matches (a, e, i, o, u)
                this.checkForMatch();
            }
        } else if (event.key === 'Backspace') {
            this.currentInput = '';
            this.inputText.setText('');
        }
    }

    checkForMatch() {
        this.fallingCharacters.forEach((char, index) => {
            if (char.character.romaji === this.currentInput) {
                this.handleCorrectInput(index);
            }
        });
    }

    handleCorrectInput(index) {
        const char = this.fallingCharacters[index];
        
        // Create floating correct answer display
        const correctText = this.add.text(
            char.gameObject.x + 50, 
            char.gameObject.y, 
            char.character.romaji, 
            {
                fontSize: '32px',
                color: '#00ff00'
            }
        );

        // Highlight character
        char.gameObject.setColor('#ffff00');

        // Pause character movement
        this.matter.world.remove(char.gameObject.body);

        // Remove after delay
        this.time.delayedCall(1000, () => {
            correctText.destroy();
            char.gameObject.destroy();
            char.trail.forEach(t => t.destroy());
            this.fallingCharacters.splice(index, 1);
        });
        
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

    update() {
        // Update trail positions
        this.fallingCharacters.forEach(char => {
            const currentPos = { x: char.gameObject.x, y: char.gameObject.y };
            
            // Update trail positions with delay
            char.trail.forEach((trailChar, i) => {
                const delay = (i + 1) * 2;
                this.time.delayedCall(delay, () => {
                    trailChar.setPosition(char.lastPos.x, char.lastPos.y);
                });
            });
            
            char.lastPos = { x: currentPos.x, y: currentPos.y };
        });

        // Check for fallen characters
        this.fallingCharacters = this.fallingCharacters.filter(char => {
            if (char.gameObject.y > 650) {
                // Show missed character romaji
                const missedText = this.add.text(
                    char.gameObject.x,
                    600,
                    char.character.romaji,
                    {
                        fontSize: '32px',
                        color: '#ff0000'
                    }
                ).setOrigin(0.5);

                // Track missed character
                this.missedCharacters[char.character.hiragana] = 
                    (this.missedCharacters[char.character.hiragana] || 0) + 1;

                // Remove after delay
                this.time.delayedCall(1000, () => {
                    missedText.destroy();
                    char.gameObject.destroy();
                    char.trail.forEach(t => t.destroy());
                });

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

    endGame() {
        this.spawnTimer.destroy();
        this.gameTimer.destroy();
        this.input.keyboard.removeAllListeners();

        // Show game over text
        this.add.text(400, 200, 'Game Over!', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 300, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Show missed characters
        let missedText = 'Missed Characters:\n\n';
        Object.entries(this.missedCharacters).forEach(([char, count]) => {
            const romaji = HIRAGANA_SET.basic.find(h => h.hiragana === char)?.romaji;
            missedText += `${char} (${romaji}): ${count} times\n`;
        });

        this.add.text(400, 400, missedText, {
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 550, 'Press ESC to return to menu', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
    }
}

module.exports = GameScene;