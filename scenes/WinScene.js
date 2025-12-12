class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x4caf50);

        // Victory particles/stars
        this.createParticles();

        // Large victory emoji
        const victoryEmoji = this.add.text(400, 150, '🎉', {
            fontSize: '120px'
        });
        victoryEmoji.setOrigin(0.5);

        // Victory message
        const victoryText = this.add.text(400, 280, 'MOUSE ESCAPED!', {
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#2e7d32',
            strokeThickness: 8
        });
        victoryText.setOrigin(0.5);

        // Success message
        const successMsg = this.add.text(400, 360, 'The mouse made it home safely! 🏠', {
            fontSize: '24px',
            color: '#ffffff'
        });
        successMsg.setOrigin(0.5);

        // Animated mouse celebration
        const celebrateMouse = this.add.text(200, 480, '🐭', {
            fontSize: '64px'
        });
        this.tweens.add({
            targets: celebrateMouse,
            x: 600,
            duration: 2000,
            repeat: -1,
            ease: 'Sine.easeInOut',
            yoyo: true
        });

        // Buttons container
        const buttonY = 500;

        // Play Again button
        const playAgainBtn = this.add.rectangle(300, buttonY, 180, 50, 0x2196f3);
        const playAgainText = this.add.text(300, buttonY, 'PLAY AGAIN', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        playAgainText.setOrigin(0.5);

        playAgainBtn.setInteractive({ useHandCursor: true });
        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setFillStyle(0x1976d2);
            playAgainBtn.setScale(1.05);
        });
        playAgainBtn.on('pointerout', () => {
            playAgainBtn.setFillStyle(0x2196f3);
            playAgainBtn.setScale(1);
        });
        playAgainBtn.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Main Menu button
        const menuBtn = this.add.rectangle(500, buttonY, 180, 50, 0x9c27b0);
        const menuText = this.add.text(500, buttonY, 'MAIN MENU', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        menuText.setOrigin(0.5);

        menuBtn.setInteractive({ useHandCursor: true });
        menuBtn.on('pointerover', () => {
            menuBtn.setFillStyle(0x7b1fa2);
            menuBtn.setScale(1.05);
        });
        menuBtn.on('pointerout', () => {
            menuBtn.setFillStyle(0x9c27b0);
            menuBtn.setScale(1);
        });
        menuBtn.on('pointerdown', () => {
            this.scene.start('EntranceScene');
        });

        // Bounce animation for victory text
        this.tweens.add({
            targets: victoryText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createParticles() {
        // Create star particles
        const colors = [0xffd700, 0xffffff, 0xffeb3b, 0x4caf50];
        
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(50, 750);
            const y = Phaser.Math.Between(50, 550);
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            const star = this.add.star(x, y, 5, 8, 16, color);
            
            this.tweens.add({
                targets: star,
                alpha: 0.3,
                scale: 0.5,
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 1000)
            });
        }
    }
}
