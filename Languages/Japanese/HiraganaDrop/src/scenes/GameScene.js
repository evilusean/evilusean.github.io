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
        this.remainingCharacters = new Set();
        this.correctCharacters = new Set();
    }

    init(data) {
        this.gameMode = data.mode;
        if (this.gameMode === 'timed') {
            this.timeLeft = 60;  // Initialize timeLeft for timed mode
            this.lives = Infinity;
        } else if (this.gameMode === 'elimination') {
            this.timeLeft = 0;
            this.lives = 3;
        } else if (this.gameMode === 'survival') {
            this.timeLeft = 0;
            this.lives = Infinity;
            this.remainingCharacters = new Set(HIRAGANA_SET.basic.map(char => char.hiragana));
            this.correctCharacters.clear();
        }
        this.missedCharacters = {};
        this.isGameActive = true;
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

        // Create opening matrix rain effect
        this.createOpeningMatrixRain();

        // Spawn timer with 3-second delay
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnCharacter,
            callbackScope: this,
            loop: true
        });

        // Matrix trail config
        this.trailConfig = {
            count: 5,
            fadeDelay: 300,     // Increased delay between fades
            fadeTime: 2000,     // Increased fade duration
            startAlpha: 0.6,    // Higher starting opacity
            spacing: 40         // Increased spacing
        };

        // Keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Add container for missed character notifications
        this.missedNotifications = this.add.container(0, 550);

        // Add timer update for timed mode
        if (this.gameMode === 'timed') {
            this.gameTimer = this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        }
    }

    createOpeningMatrixRain() {
        const columns = Math.floor(this.game.config.width / 48);
        for (let i = 0; i < columns; i++) {
            const x = i * 48 + 24;
            this.createMatrixColumn(x);
        }
    }

    createMatrixColumn(x) {
        const chars = [];
        const count = Phaser.Math.Between(8, 15);
        const delay = Phaser.Math.Between(0, 1000);

        this.time.delayedCall(delay, () => {
            for (let i = 0; i < count; i++) {
                const randomChar = Phaser.Utils.Array.GetRandom(HIRAGANA_SET.basic);
                const y = -50 - (i * 50);
                const char = this.add.text(x, y, randomChar.hiragana, {
                    fontSize: '48px',
                    color: '#003300',
                    fontFamily: '"Noto Sans JP", sans-serif'
                }).setOrigin(0.5).setAlpha(0.3);

                chars.push(char);

                // Animate each character
                this.tweens.add({
                    targets: char,
                    y: 650 + (i * 50),
                    alpha: 0,
                    duration: 3000,
                    ease: 'Linear',
                    delay: i * 100,
                    onComplete: () => {
                        char.destroy();
                    }
                });
            }
        });
    }

    spawnCharacter() {
        const randomIndex = Phaser.Math.Between(0, HIRAGANA_SET.basic.length - 1);
        const character = HIRAGANA_SET.basic[randomIndex];

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

        const charObj = {
            gameObject: mainChar,
            character: character,
            trails: [],
            lastTrailTime: 0
        };

        this.fallingCharacters.push(charObj);
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
        
        // Create floating correct answer display
        const correctText = this.add.text(
            char.gameObject.x, 
            char.gameObject.y - 50,
            char.character.romaji, 
            {
                fontSize: '32px',
                color: '#ff0000'  // Changed from #00ff00 to #ff0000 (red)
            }
        ).setOrigin(0.5);

        // Highlight character in red
        char.gameObject.setColor('#ff0000');  // Changed from #ffff00 to #ff0000

        // Stop physics
        this.matter.world.remove(char.gameObject.body);

        // Remove after delay
        this.time.delayedCall(1000, () => {
            correctText.destroy();
            char.gameObject.destroy();
            char.trails.forEach(trail => {
                if (trail) {
                    trail.destroy();
                }
            });
            this.fallingCharacters.splice(index, 1);
        });
        
        if (this.gameMode === 'survival') {
            this.remainingCharacters.delete(char.character.hiragana);
            this.correctCharacters.add(char.character.hiragana);
            
            if (this.remainingCharacters.size === 0 && !this.gameComplete) {
                this.gameComplete = true;
                this.time.delayedCall(1000, () => this.endGame());
            }
        }
        
        this.score += 100;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateTimer() {
        if (this.gameMode === 'timed' && this.isGameActive) {
            this.timeLeft--;
            this.statusText.setText(`Time: ${this.timeLeft}`);
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }
    }

    update(time) {
        // Update falling characters and create stationary trails
        this.fallingCharacters.forEach(char => {
            if (time > char.lastTrailTime + this.trailConfig.fadeDelay) {
                // Create new trail at current position
                const trail = this.add.text(
                    char.gameObject.x,
                    char.gameObject.y,
                    char.character.hiragana,
                    {
                        fontSize: '48px',
                        color: '#003300',
                        fontFamily: '"Noto Sans JP", sans-serif',
                        alpha: this.trailConfig.startAlpha
                    }
                ).setOrigin(0.5);

                // Fade out trail over time
                this.tweens.add({
                    targets: trail,
                    alpha: 0,
                    duration: this.trailConfig.fadeTime,
                    ease: 'Linear',
                    onComplete: () => {
                        trail.destroy();
                    }
                });

                char.trails.push(trail);
                char.lastTrailTime = time;

                // Limit number of trails
                if (char.trails.length > this.trailConfig.count) {
                    const oldestTrail = char.trails.shift();
                    if (oldestTrail) {
                        oldestTrail.destroy();
                    }
                }
            }
        });

        // Check for fallen characters
        this.fallingCharacters = this.fallingCharacters.filter(char => {
            if (char.gameObject.y > 650) {
                this.showMissedCharacterNotification(char.character);
                
                // Let trails fade out naturally
                char.trails.forEach(trail => {
                    if (trail) {
                        this.tweens.add({
                            targets: trail,
                            alpha: 0,
                            duration: this.trailConfig.fadeTime,
                            ease: 'Linear',
                            onComplete: () => {
                                trail.destroy();
                            }
                        });
                    }
                });

                char.gameObject.destroy();
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
        if (this.spawnTimer) this.spawnTimer.destroy();
        if (this.gameTimer) this.gameTimer.destroy();
        this.input.keyboard.removeAllListeners();
        
        // Clear all existing characters and trails
        this.fallingCharacters.forEach(char => {
            char.gameObject.destroy();
            char.trails.forEach(trail => trail.destroy());
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

        // Show missed characters
        let missedText = 'Missed Characters:\n\n';
        Object.entries(this.missedCharacters).forEach(([char, count]) => {
            const romaji = HIRAGANA_SET.basic.find(h => h.hiragana === char)?.romaji;
            missedText += `${char} (${romaji}): ${count} times\n`;
        });

        const missedList = this.add.text(400, 350, missedText, {
            fontSize: '24px',
            color: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        const escText = this.add.text(400, 500, 'Press ESC to return to menu', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Make sure ESC key is properly handled
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    cleanupAndReturnToMenu() {
        // Clean up all existing game objects
        this.fallingCharacters.forEach(char => {
            char.gameObject.destroy();
            char.trails.forEach(trail => trail.destroy());
        });
        this.fallingCharacters = [];
        
        // Stop all timers
        this.spawnTimer.destroy();
        
        // Return to menu
        this.scene.start('MainScene');
    }
}

module.exports = GameScene;