class EntranceScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EntranceScene' });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        const title = this.add.text(400, 150, 'CAT & MOUSE', {
            fontSize: '64px',
            fontStyle: 'bold',
            color: '#ecf0f1',
            stroke: '#34495e',
            strokeThickness: 6
        });
        title.setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(400, 230, 'ESCAPE GAME', {
            fontSize: '32px',
            color: '#bdc3c7'
        });
        subtitle.setOrigin(0.5);

        // Instructions
        const instructions = this.add.text(400, 320, 
            'Help the mouse escape from the cat!\n\n' +
            'Drag and drop the cat and mouse\n' +
            'to position them on the map.\n\n' +
            'Avoid the traps!',
            {
                fontSize: '18px',
                color: '#ecf0f1',
                align: 'center',
                lineSpacing: 8
            }
        );
        instructions.setOrigin(0.5);

        // Start button
        const startButton = this.add.rectangle(400, 480, 200, 60, 0xe74c3c);
        const startText = this.add.text(400, 480, 'START GAME', {
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        startText.setOrigin(0.5);

        // Make button interactive
        startButton.setInteractive({ useHandCursor: true });
        
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0xc0392b);
            startButton.setScale(1.05);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0xe74c3c);
            startButton.setScale(1);
        });

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Add some decorative elements
        this.createFloatingEmoji('🐱', 100, 150);
        this.createFloatingEmoji('🐭', 700, 150);
        this.createFloatingEmoji('🧀', 150, 400);
        this.createFloatingEmoji('⚠️', 650, 400);
    }

    createFloatingEmoji(emoji, x, y) {
        const text = this.add.text(x, y, emoji, {
            fontSize: '48px'
        });
        text.setOrigin(0.5);

        // Add floating animation
        this.tweens.add({
            targets: text,
            y: y - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}
