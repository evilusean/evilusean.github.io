const Phaser = require('phaser');
const { HIRAGANA_SET, SPECIAL_CASES: HIRAGANA_SPECIAL } = require('../helpers/HiraganaCharacters');
const { KATAKANA_SET, SPECIAL_CASES: KATAKANA_SPECIAL } = require('../helpers/KatakanaCharacters');

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.fallingCharacters = [];
        this.currentInput = '';
        this.score = 0;
        this.missedCharacters = {};
        this.isGameActive = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.remainingCharacters = new Set();
        this.correctCharacters = new Set();
        this.progressContainer = null;
        this.lastInput = '';
        this.trailConfig = {
            count: 2,
            spacing: 25,
            fadeDelay: 250,
            fadeTime: 800,
            startAlpha: 0.4
        };
        this.elapsedTime = 0;  // Track elapsed time
        this.timeText = null;  // Timer display text
        this.gameTimer = null; // Timer event
    }

    init(data) {
        this.gameMode = data.mode;
        this.characterSet = data.characterSet || 'hiragana';
        this.CHAR_SET = this.characterSet === 'hiragana' ? HIRAGANA_SET : KATAKANA_SET;
        this.SPECIAL_CASES = this.characterSet === 'hiragana' ? HIRAGANA_SPECIAL : KATAKANA_SPECIAL;

        if (this.gameMode === 'timed') {
            this.timeLeft = data.time || 60;
            this.lives = Infinity;
        } else if (this.gameMode === 'elimination') {
            this.timeLeft = 0;
            this.lives = data.lives || 3;
        } else if (this.gameMode === 'survival') {
            this.timeLeft = 0;
            this.lives = Infinity;
            this.remainingCharacters = new Set(this.CHAR_SET.basic.map(char => 
                this.characterSet === 'hiragana' ? char.hiragana : char.katakana
            ));
            this.correctCharacters.clear();
        }
        this.missedCharacters = {};
    }

    create() {
        // Create status text
        this.statusText = this.add.text(400, 50, '', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create score text
        this.scoreText = this.add.text(400, 100, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create input text
        this.inputText = this.add.text(400, 550, '', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Initialize progress container first
        this.progressContainer = this.add.container(0, 0);

        // Create opening matrix rain effect
        this.createOpeningMatrixRain();

        // Initialize game mode specific elements
        if (this.gameMode === 'survival') {
            this.createCharacterProgress();
        } else if (this.gameMode === 'timed') {
            this.gameTimer = this.time.addEvent({
                delay: 1000,
                callback: this.updateTimer,
                callbackScope: this,
                loop: true
            });
        }

        // Spawn timer
        this.spawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnCharacter,
            callbackScope: this,
            loop: true
        });

        // Matrix trail config
        this.trailConfig = {
            count: 1,
            spacing: 25,
            fadeDelay: 350,
            fadeTime: 800,
            startAlpha: 0.4
        };

        // Set up keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);

        // Initialize spawn area
        this.spawnArea = {
            left: 150,  // Default value if not in survival mode
            right: 650
        };

        // Add container for missed character notifications
        this.missedNotifications = this.add.container(0, 550);

        // Create pause overlay (initially hidden)
        this.pauseOverlay = this.add.container(0, 0);
        this.pauseOverlay.setVisible(false);

        // Semi-transparent background
        const overlay = this.add.rectangle(
            0, 0, 
            this.game.config.width, 
            this.game.config.height, 
            0x000000, 0.7
        );
        this.pauseOverlay.add(overlay);

        // Pause text
        const pauseText = this.add.text(400, 250, 'PAUSED', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.pauseOverlay.add(pauseText);

        const resumeText = this.add.text(400, 350, 'Press ESC to resume', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
        this.pauseOverlay.add(resumeText);

        const menuText = this.add.text(400, 400, 'Press ENTER to return to menu', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
        this.pauseOverlay.add(menuText);

        // Set up background clearing
        this.time.addEvent({
            delay: 300000, // 5 minutes
            callback: this.clearBackground,
            loop: true
        });

        // Create particle texture for fireworks
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();

        // Add timer display for elimination mode
        if (this.gameMode === 'elimination') {
            this.timeText = this.add.text(16, 16, 'Time: 0:00', {
                fontSize: '24px',
                color: '#00ff00'
            });
            
            // Start the timer
            this.gameTimer = this.time.addEvent({
                delay: 1000,  // Update every second
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
                const randomChar = Phaser.Utils.Array.GetRandom(this.CHAR_SET.basic);
                const y = -50 - (i * 50);
                const char = this.add.text(x, y, 
                    this.characterSet === 'hiragana' ? randomChar.hiragana : randomChar.katakana, {
                    fontSize: '48px',
                    color: '#00cc00',
                    fontFamily: '"Noto Sans JP", sans-serif',
                    padding: 0,
                    backgroundColor: null
                }).setOrigin(0.5).setAlpha(0.8);

                chars.push(char);

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
        if (this.isPaused) return;

        let character;
        if (this.gameMode === 'survival' && this.remainingCharacters.size > 0) {
            const remainingArray = Array.from(this.remainingCharacters);
            const charSymbol = Phaser.Math.RND.pick(remainingArray);
            character = this.CHAR_SET.basic.find(c => 
                (this.characterSet === 'hiragana' ? c.hiragana : c.katakana) === charSymbol
            );
        } else {
            character = Phaser.Math.RND.pick(this.CHAR_SET.basic);
        }

        const x = Phaser.Math.Between(this.spawnArea?.left || 100, this.spawnArea?.right || 700);
        const mainChar = this.add.text(x, -50, 
            this.characterSet === 'hiragana' ? character.hiragana : character.katakana, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif',
            padding: 0,
            backgroundColor: null
        }).setOrigin(0.5);

        // Remove physics body debug rendering
        const physicsBody = this.matter.add.gameObject(mainChar, {
            friction: 0,
            frictionAir: 0.02,
            bounce: 0.4,
            mass: 0.1
        });
        physicsBody.setRectangle(undefined, undefined, { render: { visible: false } });

        const fallingChar = {
            gameObject: mainChar,
            character: character,
            trails: [],
            lastTrailTime: 0
        };

        this.fallingCharacters.push(fallingChar);
    }

    createMatrixTrail(char) {
        const trail = this.add.text(
            char.gameObject.x,
            char.gameObject.y - this.trailConfig.spacing,
            this.characterSet === 'hiragana' ? char.character.hiragana : char.character.katakana,
            {
                fontSize: '48px',
                color: '#00bb00',
                fontFamily: '"Noto Sans JP", sans-serif',
                padding: 0,
                backgroundColor: null
            }
        ).setOrigin(0.5).setAlpha(this.trailConfig.startAlpha);

        char.trails.push(trail);
    }

    handleKeyInput(event) {
        if (event.key === 'Escape') {
            if (this.isGameOver) {
                this.scene.start('MainScene');
            } else {
                this.togglePause();
            }
            return;
        }

        if (event.key === 'Enter' && this.isPaused) {
            this.scene.start('MainScene');
            return;
        }

        if (this.isPaused || !this.isGameActive) return;

        if (event.key.match(/^[a-z]$/)) {
            this.currentInput += event.key;
            this.lastInput = event.key;

            this.fallingCharacters.forEach((char, index) => {
                const target = char.character.romaji;
                const inputChars = this.currentInput.split('');
                const targetChars = target.split('');
                const isMatch = targetChars.every(c => 
                    inputChars.includes(c) && 
                    inputChars.filter(i => i === c).length >= targetChars.filter(t => t === c).length
                );

                if (isMatch) {
                    this.handleCorrectInput(index);
                    this.currentInput = '';
                    return;
                }
            });

            if (this.currentInput.length >= 3) {
                this.currentInput = this.lastInput;
            }

            this.inputText.setText(this.currentInput);
        }
    }

    showMissedCharacterNotification(character) {
        const missedChar = this.characterSet === 'hiragana' ? character.hiragana : character.katakana;
        // Create notification text
        const notification = this.add.text(
            Phaser.Math.Between(100, 700), // Random X position
            600, // Bottom of screen
            `${missedChar} (${character.romaji})`, // Show both hiragana and romaji
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
            const charSymbol = this.characterSet === 'hiragana' ? 
                char.character.hiragana : char.character.katakana;
            this.remainingCharacters.delete(charSymbol);
            this.correctCharacters.add(charSymbol);
            this.updateCharacterProgress(charSymbol);
            
            if (this.remainingCharacters.size === 0 && !this.gameComplete) {
                this.gameComplete = true;
                this.time.delayedCall(1000, () => this.endGame());
                this.showSurvivalVictory();
            }
        }
        
        this.score += 100;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    updateTimer() {
        if (!this.isPaused) {
            this.elapsedTime++;
            if (this.timeText) {
                const minutes = Math.floor(this.elapsedTime / 60);
                const seconds = this.elapsedTime % 60;
                this.timeText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
        }
    }

    update(time) {
        if (this.isPaused) return;

        this.fallingCharacters.forEach(char => {
            if (time > char.lastTrailTime + this.trailConfig.fadeDelay) {
                // Create new trail
                const trail = this.add.text(
                    char.gameObject.x,
                    char.gameObject.y,
                    this.characterSet === 'hiragana' ? char.character.hiragana : char.character.katakana,
                    {
                        fontSize: '48px',
                        color: '#00bb00',
                        fontFamily: '"Noto Sans JP", sans-serif',
                        padding: 0,
                        backgroundColor: null
                    }
                ).setOrigin(0.5).setAlpha(this.trailConfig.startAlpha);

                char.trails.push(trail);
                char.lastTrailTime = time;

                // Simple fade out
                if (char.trails.length > this.trailConfig.count) {
                    const oldestTrail = char.trails[0];
                    this.tweens.add({
                        targets: oldestTrail,
                        alpha: 0,
                        duration: this.trailConfig.fadeTime,
                        ease: 'Linear',
                        onComplete: () => {
                            oldestTrail.destroy();
                            char.trails.shift();
                        }
                    });
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

    endGame() {
        this.isGameActive = false;
        this.isGameOver = true;
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
        this.add.text(400, 200, 'Game Over!', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Show score in red
        this.scoreText.setColor('#ff0000');

        // Show missed characters in compact format
        if (Object.keys(this.missedCharacters).length > 0) {
            const missedText = Object.entries(this.missedCharacters)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([char, count]) => {
                    const romaji = this.CHAR_SET.basic.find(h => h.hiragana === char)?.romaji;
                    return `${char}(${romaji}):${count}`;
                })
                .join(' | ');

            this.add.text(400, 350, 'Missed:', {
                fontSize: '24px',
                color: '#ff0000'
            }).setOrigin(0.5);

            this.add.text(400, 390, missedText, {
                fontSize: '20px',
                color: '#ff0000',
                align: 'center',
                wordWrap: { width: 700 }
            }).setOrigin(0.5);
        }

        // Return to menu instruction
        this.add.text(400, 500, 'Press ESC to return to menu', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);

        // Make sure ESC listener is properly set up
        this.input.keyboard.on('keydown', event => {
            if (event.key === 'Escape') {
                this.scene.start('MainScene');
            }
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

    createCharacterProgress() {
        if (!this.progressContainer) return;  // Safety check

        // Clear any existing progress display
        this.progressContainer.removeAll();

        // Create left and right margins for character progress
        const margin = 80;
        const charHeight = 25;
        const charsPerColumn = Math.ceil(this.CHAR_SET.basic.length / 2);

        // Split characters into left and right groups
        const remaining = Array.from(this.remainingCharacters);
        const leftChars = remaining.slice(0, charsPerColumn);
        const rightChars = remaining.slice(charsPerColumn);

        // Create left column
        leftChars.forEach((char, index) => {
            const charText = this.add.text(margin, 50 + (index * charHeight), char, {
                fontSize: '20px',
                color: '#00ff00',
                fontFamily: '"Noto Sans JP", sans-serif'
            });
            charText.setData('hiragana', char);
            this.progressContainer.add(charText);
        });

        // Create right column
        rightChars.forEach((char, index) => {
            const charText = this.add.text(this.game.config.width - margin, 50 + (index * charHeight), char, {
                fontSize: '20px',
                color: '#00ff00',
                fontFamily: '"Noto Sans JP", sans-serif'
            }).setOrigin(1, 0);
            charText.setData('hiragana', char);
            this.progressContainer.add(charText);
        });

        // Update spawn area to avoid character lists
        this.spawnArea = {
            left: margin + 50,
            right: this.game.config.width - margin - 50
        };
    }

    updateCharacterProgress(completedChar) {
        if (this.progressContainer) {
            this.progressContainer.each(charText => {
                if (charText.getData('hiragana') === completedChar) {
                    charText.setColor('#ff0000');
                }
            });
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseOverlay.setVisible(this.isPaused);

        if (this.isPaused) {
            if (this.spawnTimer) this.spawnTimer.paused = true;
            if (this.gameTimer) this.gameTimer.paused = true;
            this.matter.world.pause();
        } else {
            if (this.spawnTimer) this.spawnTimer.paused = false;
            if (this.gameTimer) this.gameTimer.paused = false;
            this.matter.world.resume();
        }
    }

    clearBackground() {
        // Clear all trails
        this.fallingCharacters.forEach(char => {
            char.trails.forEach(trail => {
                trail.destroy();
            });
            char.trails = [];
        });
    }

    /**
     * Creates a firework particle effect
     * @param {number} x - X position to spawn firework
     * @param {number} y - Y position to spawn firework
     * @param {string} color - Color of the firework in hex
     */
    createFirework(x, y, color) {
        // Create particle manager for this firework
        const particles = this.add.particles(0, 0, 'particle', {
            x: x,
            y: y,
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 300,
            quantity: 50,
            tint: color
        });

        // Auto-destroy particles after animation
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }

    /**
     * Shows game over screen - modified to handle survival mode differently
     */
    showGameOver() {
        this.isPaused = true;
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }

        // Don't show game over for survival mode victory
        if (this.gameMode === 'survival' && this.remainingCharacters.size === 0) {
            this.showSurvivalVictory();
            return;  // Exit early to avoid showing game over screen
        }

        // Create semi-transparent black overlay
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
        overlay.setOrigin(0);

        // Game Over text
        this.gameOverText = this.add.text(400, 200, 'Game Over', {
            fontSize: '64px',
            color: '#ff0000',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Score text
        const scoreText = this.add.text(400, 300, `Score: ${this.score}`, {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5);

        // Add time for elimination mode
        if (this.gameMode === 'elimination') {
            const minutes = Math.floor(this.elapsedTime / 60);
            const seconds = this.elapsedTime % 60;
            const timeText = this.add.text(400, 350, 
                `Time Survived: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
                fontSize: '32px',
                color: '#00ff00',
                fontFamily: '"Noto Sans JP", sans-serif'
            }).setOrigin(0.5);
        }

        // Restart text
        const restartText = this.add.text(400, 450, 'Press SPACE to restart\nPress ESC for menu', {
            fontSize: '24px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif',
            align: 'center'
        }).setOrigin(0.5);

        // Add keyboard listeners
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart(this.scene.settings.data);
        });

        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('MainScene');
        });
    }

    /**
     * Shows victory celebration for completing survival mode
     */
    showSurvivalVictory() {
        // Stop the game
        this.isGameActive = false;
        this.isPaused = true;

        // Create semi-transparent black overlay
        const overlay = this.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
        overlay.setOrigin(0);

        // Create congratulatory text with animation
        const congratsText = this.add.text(400, 200, 'Congratulations!', {
            fontSize: '64px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        const scoreText = this.add.text(400, 300, `Final Score: ${this.score}`, {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: '"Noto Sans JP", sans-serif'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in text
        this.tweens.add({
            targets: [congratsText, scoreText],
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // Create fireworks sequence
        const fireworkColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        let fireworkCount = 0;

        // Launch fireworks every 500ms
        const fireworkTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                const x = Phaser.Math.Between(100, 700);
                const y = Phaser.Math.Between(100, 500);
                const color = Phaser.Utils.Array.GetRandom(fireworkColors);
                this.createFirework(x, y, color);
                fireworkCount++;

                // Stop after 10 fireworks
                if (fireworkCount >= 10) {
                    fireworkTimer.destroy();
                    
                    // Show return to menu text (only green version)
                    this.time.delayedCall(2000, () => {
                        const menuText = this.add.text(400, 500, 'Press ESC to return to menu', {
                            fontSize: '24px',
                            color: '#00ff00',
                            fontFamily: '"Noto Sans JP", sans-serif'
                        }).setOrigin(0.5).setAlpha(0);

                        this.tweens.add({
                            targets: menuText,
                            alpha: 1,
                            duration: 1000
                        });

                        // Add keyboard listener for menu return
                        this.input.keyboard.once('keydown-ESC', () => {
                            this.scene.start('MainScene');
                        });
                    });
                }
            },
            loop: true
        });
    }
}

module.exports = GameScene;