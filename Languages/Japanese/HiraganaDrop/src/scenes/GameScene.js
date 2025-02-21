const Phaser = require('phaser');
const { HIRAGANA_SET, SPECIAL_CASES } = require('../helpers/characters');

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.fallingCharacters = [];
        this.currentInput = '';
        this.score = 0;
        this.missedCharacters = {};
        this.isGameActive = true;
        this.remainingCharacters = new Set(); // For survival mode
        this.correctCharacters = new Set();   // For survival mode
    }

    init(data) {
        this.gameMode = data.mode;
        if (this.gameMode === 'timed') {
            this.timeLeft = 60;
            this.lives = Infinity;
        } else if (this.gameMode === 'elimination') {
            this.timeLeft = 0;
            this.lives = 3;
        } else if (this.gameMode === 'survival') {
            this.timeLeft = 0;
            this.lives = Infinity;
            // Initialize remaining characters for survival mode
            this.remainingCharacters = new Set(HIRAGANA_SET.basic.map(char => char.hiragana));
            this.correctCharacters.clear();
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

        // Matrix effect config
        this.trailConfig = {
            fadeDelay: 100,    // How often to create new trail
            maxTrails: 10,     // Maximum number of trails per character
            startAlpha: 0.3,   // Starting alpha value
            fadeRate: 0.02     // How quickly trails fade
        };

        // Add container for missed character notifications
        this.missedNotifications = this.add.container(0, 550);

        // Matrix background effect
        this.createMatrixBackground();
    }

    createMatrixBackground() {
        const cols = Math.floor(this.game.config.width / 48); // Character width
        this.matrixColumns = [];

        for (let i = 0; i < cols; i++) {
            const column = {
                x: i * 48 + 24,
                chars: [],
                nextUpdate: 0
            };
            this.matrixColumns.push(column);
        }
    }

    updateMatrixBackground(time) {
        this.matrixColumns.forEach(column => {
            if (time > column.nextUpdate) {
                // Add new character at top if needed
                if (column.chars.length < 15) {
                    const randomChar = Phaser.Utils.Array.GetRandom(HIRAGANA_SET.basic);
                    const char = this.add.text(column.x, -48, randomChar.hiragana, {
                        fontSize: '48px',
                        color: '#003300',
                        fontFamily: '"Noto Sans JP", sans-serif'
                    }).setOrigin(0.5);
                    column.chars.push(char);
                }

                // Update positions and fade
                column.chars.forEach((char, index) => {
                    char.y += 48;
                    char.alpha = Math.max(0, 1 - (index / 15));
                });

                // Remove characters that are too faded
                while (column.chars.length > 0 && column.chars[0].alpha <= 0) {
                    column.chars.shift().destroy();
                }

                column.nextUpdate = time + Phaser.Math.Between(100, 300);
            }
        });
    }

    spawnCharacter() {
        let character;
        
        if (this.gameMode === 'survival') {
            // In survival mode, prioritize remaining characters
            if (this.remainingCharacters.size > 0) {
                const remainingArray = Array.from(this.remainingCharacters);
                const randomIndex = Phaser.Math.Between(0, remainingArray.length - 1);
                const hiragana = remainingArray[randomIndex];
                character = HIRAGANA_SET.basic.find(char => char.hiragana === hiragana);
            } else {
                // All characters completed, mix correct and remaining
                character = Phaser.Utils.Array.GetRandom(HIRAGANA_SET.basic);
            }
        } else {
            // Normal random selection for other modes
            character = Phaser.Utils.Array.GetRandom(HIRAGANA_SET.basic);
        }

        const x = Phaser.Math.Between(100, 700);
        const mainChar = this.add.text(x, -50, character.hiragana, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Add physics to main character
        this.matter.add.gameObject(mainChar, {
            friction: 0,
            frictionAir: 0.02,
            bounce: 0.4,
            mass: 0.1,
            render: {
                visible: false
            }
        });

        this.fallingCharacters.push({
            gameObject: mainChar,
            character: character,
            trails: [],
            lastTrailTime: 0
        });
    }

    handleKeyInput(event) {
        if (event.key === 'Escape') {
            this.cleanupAndReturnToMenu();
            return;
        }

        if (event.key.length === 1) {
            this.currentInput += event.key;
            this.inputText.setText(`Typing: ${this.currentInput}`);

            // Check for special cases
            const isSpecialCase = Object.entries(SPECIAL_CASES).some(([partial, matches]) => {
                if (this.currentInput === partial) {
                    return true; // Keep collecting input
                }
                return false;
            });

            // Check for complete matches or reset if too long
            if (!isSpecialCase && this.currentInput.length >= 3) {
                this.checkForMatch();
                this.currentInput = '';
                this.inputText.setText('');
            } else {
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
                this.currentInput = '';
                this.inputText.setText('');
            }
        });
    }

    handleCorrectInput(index) {
        const char = this.fallingCharacters[index];
        
        if (this.gameMode === 'survival') {
            this.remainingCharacters.delete(char.character.hiragana);
            this.correctCharacters.add(char.character.hiragana);
            
            // Check if all characters have been correctly typed
            if (this.remainingCharacters.size === 0 && !this.gameComplete) {
                this.gameComplete = true;
                this.time.delayedCall(1000, () => this.endGame());
            }
        }

        // Create floating correct answer display
        const correctText = this.add.text(
            char.gameObject.x, 
            char.gameObject.y - 50,
            char.character.romaji, 
            {
                fontSize: '32px',
                color: '#00ff00'
            }
        ).setOrigin(0.5);

        // Highlight character
        char.gameObject.setColor('#ffff00');

        // Stop physics
        this.matter.world.remove(char.gameObject.body);

        // Remove after delay
        this.time.delayedCall(1000, () => {
            correctText.destroy();
            char.gameObject.destroy();
            // Clean up all trails
            char.trails.forEach(trail => trail.text.destroy());
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

    update(time) {
        this.updateMatrixBackground(time);
        // Update existing trails
        this.fallingCharacters.forEach(char => {
            // Create new trail if enough time has passed
            if (time > char.lastTrailTime + this.trailConfig.fadeDelay) {
                // Create new trail at current position
                const trail = this.add.text(
                    char.gameObject.x,
                    char.gameObject.y,
                    char.character.hiragana,
                    {
                        fontSize: '48px',
                        color: '#00ff00',
                        fontFamily: '"Noto Sans JP", sans-serif',
                        alpha: this.trailConfig.startAlpha
                    }
                ).setOrigin(0.5);

                char.trails.push({
                    text: trail,
                    createTime: time
                });
                char.lastTrailTime = time;

                // Limit number of trails
                if (char.trails.length > this.trailConfig.maxTrails) {
                    const oldestTrail = char.trails.shift();
                    oldestTrail.text.destroy();
                }
            }

            // Fade existing trails
            char.trails.forEach(trail => {
                const age = time - trail.createTime;
                trail.text.setAlpha(Math.max(0, this.trailConfig.startAlpha - (age * this.trailConfig.fadeRate)));
            });
        });

        // Check for fallen characters
        this.fallingCharacters = this.fallingCharacters.filter(char => {
            if (char.gameObject.y > 650) {
                // Show missed character notification
                this.showMissedCharacterNotification(char.character);
                
                // Cleanup trails
                char.trails.forEach(trail => trail.text.destroy());
                char.gameObject.destroy();

                // Track missed character
                this.missedCharacters[char.character.hiragana] = 
                    (this.missedCharacters[char.character.hiragana] || 0) + 1;

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

    showMissedCharacterNotification(character) {
        // Create notification text
        const notification = this.add.text(
            Phaser.Math.Between(100, 700), // Random X position
            600, // Bottom of screen
            `${character.hiragana} (${character.romaji})`, // Show both hiragana and romaji
            {
                fontSize: '32px',
                color: '#ff0000',
                fontFamily: '"Noto Sans JP", sans-serif'
            }
        ).setOrigin(0.5);

        // Animate the notification
        this.tweens.add({
            targets: notification,
            y: 550,          // Float up slightly
            alpha: 0,        // Fade out
            duration: 2000,  // Over 2 seconds
            ease: 'Power2',
            onComplete: () => {
                notification.destroy();
            }
        });
    }

    endGame() {
        this.isGameActive = false;
        this.spawnTimer.destroy();
        this.gameTimer.destroy();
        
        // Clear all existing characters and trails
        this.fallingCharacters.forEach(char => {
            char.gameObject.destroy();
            char.trails.forEach(trail => trail.text.destroy());
        });
        this.fallingCharacters = [];

        // Show game over text
        const gameOverText = this.add.text(400, 200, 'Game Over!', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const scoreText = this.add.text(400, 280, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Sort missed characters by count
        const sortedMissed = Object.entries(this.missedCharacters)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([char, count]) => {
                const romaji = HIRAGANA_SET.basic.find(h => h.hiragana === char)?.romaji;
                return `${char} (${romaji}): ${count} times`;
            });

        const missedText = ['Missed Characters:\n'].concat(sortedMissed).join('\n');

        this.add.text(400, 350, missedText, {
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        if (this.gameMode === 'survival') {
            const completionText = this.remainingCharacters.size === 0 ?
                'Congratulations! All characters mastered!' :
                `Characters remaining: ${this.remainingCharacters.size}`;
            
            this.add.text(400, 450, completionText, {
                fontSize: '24px',
                color: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
        }

        // Make sure ESC key is properly handled
        this.input.keyboard.removeAllListeners();
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    cleanupAndReturnToMenu() {
        // Clean up all existing game objects
        this.fallingCharacters.forEach(char => {
            char.gameObject.destroy();
            char.trails.forEach(trail => trail.text.destroy());
        });
        this.fallingCharacters = [];
        
        // Stop all timers
        this.spawnTimer.destroy();
        this.gameTimer.destroy();
        
        // Return to menu
        this.scene.start('MainScene');
    }
}

module.exports = GameScene;