import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load assets here
    }

    create() {
        this.add.text(400, 300, 'Hello Phaser!', {
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    update() {
        // Game loop
    }
}