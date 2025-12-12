class SolvingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SolvingScene' });
    }

    init(data) {
        this.mapData = data.mapData;
    }

    create() {
        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a237e, 0x1a237e, 0x283593, 0x283593, 1);
        graphics.fillRect(0, 0, 800, 600);

        // Title
        this.add.text(400, 100, 'SOLVING...', {
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(400, 160, 'Running BFS Algorithm', {
            fontSize: '24px',
            color: '#90caf9'
        }).setOrigin(0.5);

        // Loading animation - rotating gears
        const gear1 = this.add.text(300, 300, '⚙️', {
            fontSize: '64px'
        }).setOrigin(0.5);

        const gear2 = this.add.text(400, 300, '⚙️', {
            fontSize: '80px'
        }).setOrigin(0.5);

        const gear3 = this.add.text(500, 300, '⚙️', {
            fontSize: '64px'
        }).setOrigin(0.5);

        // Rotate gears
        this.tweens.add({
            targets: [gear1, gear3],
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        this.tweens.add({
            targets: gear2,
            angle: -360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Loading dots animation
        this.loadingText = this.add.text(400, 400, 'Processing map data', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        let dotCount = 0;
        this.time.addEvent({
            delay: 500,
            callback: () => {
                dotCount = (dotCount + 1) % 4;
                this.loadingText.setText('Processing map data' + '.'.repeat(dotCount));
            },
            loop: true
        });

        // Status messages
        this.statusText = this.add.text(400, 450, 'Analyzing grid layout...', {
            fontSize: '16px',
            color: '#64b5f6',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Cycle through status messages
        const messages = [
            'Analyzing grid layout...',
            'Locating mouse and door...',
            'Mapping trap locations...',
            'Calculating optimal path...',
            'Evaluating escape routes...',
            'Running BFS algorithm...'
        ];
        let messageIndex = 0;
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                messageIndex = (messageIndex + 1) % messages.length;
                this.statusText.setText(messages[messageIndex]);
            },
            loop: true
        });

        // Progress bar
        const barWidth = 400;
        const barHeight = 20;
        const barX = 200;
        const barY = 500;

        const barBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x37474f);
        barBg.setOrigin(0, 0.5);

        this.progressBar = this.add.rectangle(barX, barY, 0, barHeight, 0x4caf50);
        this.progressBar.setOrigin(0, 0.5);

        // Animate progress bar
        this.tweens.add({
            targets: this.progressBar,
            width: barWidth,
            duration: 3000,
            ease: 'Cubic.easeInOut'
        });

        // Call Python solver after a short delay
        this.time.delayedCall(500, () => {
            this.runPythonSolver();
        });
    }

    runPythonSolver() {
        // First, save the JSON file
        const jsonString = JSON.stringify(this.mapData, null, 2);
        
        fetch('/save_map', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: jsonString
        })
        .then(response => response.json())
        .then(data => {
            console.log('Map saved successfully');
            this.statusText.setText('Map saved! Running solver...');
            
            // Now run the Python solver
            return fetch('/run_solver', {
                method: 'POST'
            });
        })
        .then(response => response.json())
        .then(result => {
            console.log('Solver result:', result);
            
            if (result.success) {
                // Solution found - mouse can escape!
                this.statusText.setText('Path found! Starting Game...');
                this.statusText.setColor('#4caf50');
                this.time.delayedCall(1500, () => {
                    this.scene.start('PlayScene', { 
                        mapData: this.mapData,
                        solution: result
                    });
                });
            } else if (result.success === false) {
                // No safe path, but we might have a "best effort" path
                if (result.path && result.path.length > 0) {
                    this.statusText.setText('No safe path... Hunting time!');
                    this.statusText.setColor('#ff9800');
                    this.time.delayedCall(1500, () => {
                        this.scene.start('PlayScene', { 
                            mapData: this.mapData,
                            solution: result
                        });
                    });
                } else {
                    // No path at all (trapped at start)
                    console.error('Solver error:', result.error);
                    this.statusText.setText('No safe path found!');
                    this.statusText.setColor('#f44336');
                    this.time.delayedCall(2000, () => {
                        this.scene.start('LoseScene');
                    });
                }
            } else {
                // Unexpected response
                console.error('Unexpected response:', result);
                this.statusText.setText('Unexpected error!');
                this.statusText.setColor('#f44336');
                this.time.delayedCall(2000, () => {
                    this.scene.start('GameScene');
                });
            }
        })
        .catch(error => {
            console.error('Error running solver:', error);
            this.statusText.setText('Error: Could not connect to server!');
            this.statusText.setColor('#f44336');
            
            // Go back to game scene after delay
            this.time.delayedCall(2000, () => {
                this.scene.start('GameScene');
            });
        });
    }
}
