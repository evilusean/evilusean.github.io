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
        console.log('GameScene preload'); // Debug log
    }

    create() {
        console.log('GameScene create'); // Debug log
        // Add debug text to verify scene is loading
        this.add.text(400, 300, 'Game Scene Loaded', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    spawnCharacter() {
        const randomIndex = Phaser.Math.Between(0, HIRAGANA_SET.basic.length - 1);
        const character = HIRAGANA_SET.basic[randomIndex];
        
        // Create main character sprite
        const mainChar = this.add.text(
            Phaser.Math.Between(50, 750),
            -50,
            character.hiragana,
            {
                fontSize: '32px',
                color: '#00ff00',
                fontFamily: '"Noto Sans JP", sans-serif'
            }
        ).setOrigin(0.5);

        // Add physics to the character
        this.matter.add.gameObject(mainChar, {
            friction: 0,
            frictionAir: 0.001,
            bounce: 0.4,
            mass: 1
        });

        // Create trail effect
        const trail = this.add.group();
        
        const characterObj = {
            mainChar,
            trail,
            character: character,
            trailTimer: this.time.addEvent({
                delay: 100,
                callback: () => this.createTrailEffect(characterObj),
                loop: true
            })
        };

        this.fallingCharacters.push(characterObj);
    }

    createTrailEffect(characterObj) {
        const { mainChar, trail } = characterObj;
        
        const trailEffect = this.add.text(
            mainChar.x,
            mainChar.y,
            mainChar.text,
            {
                fontSize: '32px',
                color: '#00ff00',
                alpha: 0.3,
                fontFamily: '"Noto Sans JP", sans-serif'
            }
        ).setOrigin(0.5);

        trail.add(trailEffect);

        this.tweens.add({
            targets: trailEffect,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                trailEffect.destroy();
            }
        });
    }

    selectCharacter(index) {
        // Deselect previous character
        if (this.selectedCharacterIndex !== -1 && this.fallingCharacters[this.selectedCharacterIndex]) {
            this.fallingCharacters[this.selectedCharacterIndex].mainChar.setColor('#00ff00');
        }

        // Select new character
        this.selectedCharacterIndex = index;
        if (this.fallingCharacters[index]) {
            this.fallingCharacters[index].mainChar.setColor('#ff0000');
            this.showKeyboardInput();
        }
    }

    showKeyboardInput() {
        // Placeholder for keyboard UI
        // We'll implement this later
    }

    handleInput(input) {
        if (this.selectedCharacterIndex === -1) return;

        const currentChar = this.fallingCharacters[this.selectedCharacterIndex].character;
        const isCorrect = input === currentChar.romaji;

        // Update stats
        this.characterStats[currentChar.hiragana].attempts++;
        if (isCorrect) {
            this.characterStats[currentChar.hiragana].correct++;
            this.showFeedback('Correct!', '#00ff00');
        } else {
            this.characterStats[currentChar.hiragana].incorrect++;
            this.showFeedback(`Incorrect! It was "${currentChar.romaji}"`, '#ff0000');
        }

        // Remove the character
        this.removeCharacter(this.selectedCharacterIndex);
    }

    removeCharacter(index) {
        if (index >= 0 && index < this.fallingCharacters.length) {
            const char = this.fallingCharacters[index];
            char.trailTimer.destroy();
            char.trail.clear(true, true);
            char.mainChar.destroy();
            this.fallingCharacters.splice(index, 1);
            this.selectedCharacterIndex = -1;
        }
    }

    showFeedback(message, color) {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(color);
        this.time.delayedCall(2000, () => {
            this.feedbackText.setText('');
        });
    }

    displayResults() {
        let totalAttempts = 0;
        let totalCorrect = 0;

        const results = Object.entries(this.characterStats)
            .filter(([_, stats]) => stats.attempts > 0)
            .map(([char, stats]) => {
                totalAttempts += stats.attempts;
                totalCorrect += stats.correct;
                return `${char}: ${stats.correct}/${stats.attempts}`;
            })
            .join('\n');

        const accuracy = totalAttempts > 0 ? 
            Math.round((totalCorrect / totalAttempts) * 100) : 0;

        this.add.text(400, 300, 
            `Game Over!\n\nTotal Score: ${totalCorrect}/${totalAttempts} (${accuracy}%)\n\n${results}`, 
            {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    }

    update() {
        console.log('GameScene update'); // Debug log
        // Clean up characters that have fallen off screen
        this.fallingCharacters = this.fallingCharacters.filter((char, index) => {
            if (char.mainChar.y > 650) {
                this.removeCharacter(index);
                return false;
            }
            return true;
        });
    }
}

module.exports = GameScene;