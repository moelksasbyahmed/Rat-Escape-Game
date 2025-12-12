class LoseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoseScene' });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0xd32f2f);

        // Dark overlay effect
        this.createDarkOverlay();

        // Large defeat emoji
        const defeatEmoji = this.add.text(400, 150, '😿', {
            fontSize: '120px'
        });
        defeatEmoji.setOrigin(0.5);

        // Game over message
        const gameOverText = this.add.text(400, 280, 'GAME OVER!', {
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#b71c1c',
            strokeThickness: 8
        });
        gameOverText.setOrigin(0.5);

        // Defeat message
        const defeatMsg = this.add.text(400, 360, 'The cat caught the mouse! 🐱', {
            fontSize: '24px',
            color: '#ffebee'
        });
        defeatMsg.setOrigin(0.5);

        // Animated scene
        const cat = this.add.text(300, 480, '🐱', {
            fontSize: '64px'
        });
        const mouse = this.add.text(350, 480, '🐭', {
            fontSize: '48px'
        });

        // Chase animation
        this.tweens.add({
            targets: [cat, mouse],
            x: '+=400',
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Buttons container
        const buttonY = 500;

        // Try Again button
        const tryAgainBtn = this.add.rectangle(300, buttonY, 180, 50, 0xff9800);
        const tryAgainText = this.add.text(300, buttonY, 'TRY AGAIN', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        tryAgainText.setOrigin(0.5);

        tryAgainBtn.setInteractive({ useHandCursor: true });
        tryAgainBtn.on('pointerover', () => {
            tryAgainBtn.setFillStyle(0xf57c00);
            tryAgainBtn.setScale(1.05);
        });
        tryAgainBtn.on('pointerout', () => {
            tryAgainBtn.setFillStyle(0xff9800);
            tryAgainBtn.setScale(1);
        });
        tryAgainBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Main Menu button
        const menuBtn = this.add.rectangle(500, buttonY, 180, 50, 0x607d8b);
        const menuText = this.add.text(500, buttonY, 'MAIN MENU', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        menuText.setOrigin(0.5);

        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerover', () => {
            menuBtn.setFillStyle(0x455a64);
            menuBtn.setScale(1.05);
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setFillStyle(0x607d8b);
            menuBtn.setScale(1);
        });
        menuBtn.on('pointerdown', () => {
            this.scene.start('EntranceScene');
        });

        // Shake animation for game over text
        this.tweens.add({
            targets: gameOverText,
            angle: -3,
            duration: 100,
            yoyo: true,
            repeat: -1
        });

        // Fade in effect
        this.cameras.main.fadeIn(500, 211, 47, 47);
    }

    createDarkOverlay() {
        // Create ominous dark circles
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.2);
        
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const radius = Phaser.Math.Between(20, 60);
            graphics.fillCircle(x, y, radius);
        }
    }
}
