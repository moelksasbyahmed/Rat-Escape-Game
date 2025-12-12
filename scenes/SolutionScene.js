class SolutionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SolutionScene' });
    }

    init(data) {
        this.solution = data.solution;
        this.mapData = data.mapData;
    }

    create() {
        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1b5e20, 0x1b5e20, 0x2e7d32, 0x2e7d32, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Title
        this.add.text(400, 50, '✅ SOLUTION FOUND!', {
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Map display
        const mapOffsetX = 50;
        const mapOffsetY = 100;
        const gridSize = 50;

        // Draw the map with solution
        this.drawSolutionMap(mapOffsetX, mapOffsetY, gridSize);

        // Solution details
        const detailsX = 680;
        let detailsY = 120;

        this.add.rectangle(detailsX, 300, 200, 400, 0x000000, 0.7);

        this.add.text(detailsX, detailsY, '📊 STATS', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffeb3b'
        }).setOrigin(0.5);

        detailsY += 50;

        this.add.text(detailsX, detailsY, `Path Length:\n${this.solution.pathLength} moves`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        detailsY += 70;

        this.add.text(detailsX, detailsY, `Traps Avoided:\n${this.solution.trapsCount}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        detailsY += 70;

        this.add.text(detailsX, detailsY, `Goal:\n${this.solution.goalType}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Buttons
        const playAgainBtn = this.add.rectangle(680, 480, 160, 45, 0x2196f3);
        const playAgainText = this.add.text(680, 480, 'NEW MAP', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

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

        const menuBtn = this.add.rectangle(680, 540, 160, 45, 0x9c27b0);
        const menuText = this.add.text(680, 540, 'MAIN MENU', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

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
    }

    drawSolutionMap(offsetX, offsetY, gridSize) {
        const grid = this.mapData.grid;
        const path = this.solution.path;

        // Create path set for quick lookup
        const pathSet = new Set(path.map(p => `${p[0]},${p[1]}`));

        // Draw tiles
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const tileX = offsetX + x * gridSize;
                const tileY = offsetY + y * gridSize;

                // Check if this tile is in the path
                const isInPath = pathSet.has(`${x},${y}`);

                // Tile background
                let tileColor;
                let tileAlpha = 1;
                
                if (isInPath) {
                    tileColor = 0xffeb3b; // Bright yellow for path
                    tileAlpha = 0.9;
                } else {
                    const isLight = (x + y) % 2 === 0;
                    tileColor = isLight ? 0x9ccc65 : 0x8bc34a;
                    tileAlpha = 0.6; // Dim non-path tiles
                }

                const tile = this.add.rectangle(tileX, tileY, gridSize, gridSize, tileColor, tileAlpha).setOrigin(0);

                // Add glow effect to path tiles
                if (isInPath) {
                    const glow = this.add.rectangle(tileX, tileY, gridSize, gridSize, 0xffffff, 0.3).setOrigin(0);
                    this.tweens.add({
                        targets: glow,
                        alpha: 0,
                        duration: 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }

                // Tile border
                const border = this.add.graphics();
                if (isInPath) {
                    border.lineStyle(3, 0xff9800, 1); // Orange border for path
                } else {
                    border.lineStyle(2, 0x558b2f, 0.5);
                }
                border.strokeRect(tileX, tileY, gridSize, gridSize);

                // Draw content
                const cell = grid[y][x];
                const centerX = tileX + gridSize / 2;
                const centerY = tileY + gridSize / 2;

                if (cell === 'X') {
                    this.add.text(centerX, centerY, '⚠️', {
                        fontSize: '30px'
                    }).setOrigin(0.5);
                } else if (cell === 'C') {
                    this.add.text(centerX, centerY, '🐱', {
                        fontSize: '40px'
                    }).setOrigin(0.5);
                } else if (cell === 'M') {
                    this.add.text(centerX, centerY, '🐭', {
                        fontSize: '36px'
                    }).setOrigin(0.5);
                    // Add pulsing effect to mouse
                    const mouseGlow = this.add.circle(centerX, centerY, 20, 0x4caf50, 0.3);
                    this.tweens.add({
                        targets: mouseGlow,
                        scale: 1.5,
                        alpha: 0,
                        duration: 1000,
                        repeat: -1,
                        ease: 'Cubic.easeOut'
                    });
                } else if (cell === 'D') {
                    this.add.text(centerX, centerY, '🚪', {
                        fontSize: '40px'
                    }).setOrigin(0.5);
                    // Add pulsing effect to door
                    const doorGlow = this.add.circle(centerX, centerY, 20, 0x2196f3, 0.3);
                    this.tweens.add({
                        targets: doorGlow,
                        scale: 1.5,
                        alpha: 0,
                        duration: 1000,
                        repeat: -1,
                        ease: 'Cubic.easeOut'
                    });
                } else if (isInPath) {
                    // Show step number with background
                    const stepIndex = path.findIndex(p => p[0] === x && p[1] === y);
                    if (stepIndex > 0 && stepIndex < path.length - 1) {
                        // Background circle for number
                        this.add.circle(centerX, centerY, 15, 0xff5722);
                        this.add.text(centerX, centerY, stepIndex.toString(), {
                            fontSize: '20px',
                            fontStyle: 'bold',
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 2
                        }).setOrigin(0.5);
                    }
                }
            }
        }

        // Draw animated arrows along the path
        for (let i = 0; i < path.length - 1; i++) {
            const [x1, y1] = path[i];
            const [x2, y2] = path[i + 1];

            const centerX1 = offsetX + x1 * gridSize + gridSize / 2;
            const centerY1 = offsetY + y1 * gridSize + gridSize / 2;
            const centerX2 = offsetX + x2 * gridSize + gridSize / 2;
            const centerY2 = offsetY + y2 * gridSize + gridSize / 2;

            // Draw line between path points
            const line = this.add.graphics();
            line.lineStyle(4, 0xff5722, 0.8);
            line.lineBetween(centerX1, centerY1, centerX2, centerY2);

            let arrow = '';
            if (x2 > x1) arrow = '→';
            else if (x2 < x1) arrow = '←';
            else if (y2 > y1) arrow = '↓';
            else if (y2 < y1) arrow = '↑';

            if (grid[y1][x1] === '.' && i > 0) {
                const arrowText = this.add.text(centerX1, centerY1 - 12, arrow, {
                    fontSize: '18px',
                    color: '#ff5722',
                    fontStyle: 'bold',
                    stroke: '#ffffff',
                    strokeThickness: 2
                }).setOrigin(0.5);

                // Pulse animation for arrows
                this.tweens.add({
                    targets: arrowText,
                    scale: 1.3,
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: i * 100
                });
            }
        }
    }
}
