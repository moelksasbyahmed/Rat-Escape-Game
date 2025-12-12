class PlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayScene' });
    }

    init(data) {
        console.log(data.mapData);
        console.log(data.solution);
        this.mapData = data.mapData;
        this.solution = data.solution;
        this.path = data.solution.solution.path; // Array of [row, col]
        this.mousePathIndex = 0;
        this.gridSize = 40;
        this.mapOffsetX = 50;
        this.mapOffsetY = 80;
        // Find initial positions from map data
        this.catPos = { x: 0, y: 0 };
        this.mousePos = { x: 0, y: 0 };
        this.doorPos = { x: 0, y: 0 };
        
        const grid = this.mapData.map;
        for(let y=0; y<grid.length; y++) {
            for(let x=0; x<grid[y].length; x++) {
                if(grid[y][x] === 'C') this.catPos = { x, y };
                if(grid[y][x] === 'M') this.mousePos = { x, y };
                if(grid[y][x] === 'D') this.doorPos = { x, y };
            }
        }
        
        this.isPlayerTurn = true;
        this.gameOver = false;
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);
        
        // Title
        this.add.text(400, 30, 'CATCH THE MOUSE!', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        this.turnText = this.add.text(400, 60, 'Your Turn (Move Cat)', {
            fontSize: '20px',
            color: '#ff9800'
        }).setOrigin(0.5);

        // Draw Map
        this.drawMap();
        
        // Create Entities
        this.createEntities();
        
        // Input - Mouse
        this.input.on('pointerdown', (pointer) => {
            if (this.isPlayerTurn && !this.gameOver) {
                this.handleInput(pointer);
            }
        });

        // Input - Keyboard (WASD)
        this.input.keyboard.on('keydown-W', () => this.handleKeyInput(0, -1));
        this.input.keyboard.on('keydown-A', () => this.handleKeyInput(-1, 0));
        this.input.keyboard.on('keydown-S', () => this.handleKeyInput(0, 1));
        this.input.keyboard.on('keydown-D', () => this.handleKeyInput(1, 0));
        
        // Arrow keys support as well
        this.input.keyboard.on('keydown-UP', () => this.handleKeyInput(0, -1));
        this.input.keyboard.on('keydown-LEFT', () => this.handleKeyInput(-1, 0));
        this.input.keyboard.on('keydown-DOWN', () => this.handleKeyInput(0, 1));
        this.input.keyboard.on('keydown-RIGHT', () => this.handleKeyInput(1, 0));
    }

    drawMap() {
        const grid = this.mapData.map;
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                const tileX = this.mapOffsetX + x * this.gridSize;
                const tileY = this.mapOffsetY + y * this.gridSize;
                
                // Floor
                const isLight = (x + y) % 2 === 0;
                const color = isLight ? 0x9ccc65 : 0x8bc34a;
                this.add.rectangle(tileX, tileY, this.gridSize, this.gridSize, color).setOrigin(0);
                
                // Walls/Traps
                if (grid[y][x] === '#' || grid[y][x] === 'X') { // Support both for backward compatibility
                    this.add.rectangle(tileX, tileY, this.gridSize, this.gridSize, 0x424242).setOrigin(0);
                    
                    const detailOffset = this.gridSize * 0.2;
                    const detailSize = this.gridSize * 0.6;
                    this.add.rectangle(tileX + detailOffset, tileY + detailOffset, detailSize, detailSize, 0x616161).setOrigin(0);
                }
                
                // Door
                if (grid[y][x] === 'D') {
                    const fontSize = Math.floor(this.gridSize * 0.8) + 'px';
                    this.add.text(tileX + this.gridSize/2, tileY + this.gridSize/2, '🚪', { fontSize: fontSize }).setOrigin(0.5);
                }
                
                // Grid lines
                const border = this.add.graphics();
                border.lineStyle(1, 0x558b2f, 0.5);
                border.strokeRect(tileX, tileY, this.gridSize, this.gridSize);
            }
        }
        
        // Highlight Mouse Path (Optional, maybe make it faint)
        /*
        for(let pos of this.path) {
            const [r, c] = pos;
            const px = this.mapOffsetX + c * this.gridSize + 25;
            const py = this.mapOffsetY + r * this.gridSize + 25;
            this.add.circle(px, py, 5, 0xffeb3b, 0.5);
        }
        */
    }

    createEntities() {
        const fontSize = Math.floor(this.gridSize * 0.8) + 'px';
        
        // Cat
        const cx = this.mapOffsetX + this.catPos.x * this.gridSize + this.gridSize/2;
        const cy = this.mapOffsetY + this.catPos.y * this.gridSize + this.gridSize/2;
        this.catSprite = this.add.text(cx, cy, '🐱', { fontSize: fontSize }).setOrigin(0.5);
        
        // Mouse
        const mx = this.mapOffsetX + this.mousePos.x * this.gridSize + this.gridSize/2;
        const my = this.mapOffsetY + this.mousePos.y * this.gridSize + this.gridSize/2;
        this.mouseSprite = this.add.text(mx, my, '🐭', { fontSize: fontSize }).setOrigin(0.5);
    }

    handleInput(pointer) {
        // Convert click to grid coordinates
        const relativeX = pointer.x - this.mapOffsetX;
        const relativeY = pointer.y - this.mapOffsetY;
        const gridX = Math.floor(relativeX / this.gridSize);
        const gridY = Math.floor(relativeY / this.gridSize);
        
        // Check bounds
        if (gridX < 0 || gridX >= this.mapData.map[0].length || 
            gridY < 0 || gridY >= this.mapData.map.length) return;
            
        // Check adjacency (including diagonals? No, usually BFS is 4-directional)
        const dx = Math.abs(gridX - this.catPos.x);
        const dy = Math.abs(gridY - this.catPos.y);
        
        // Allow only 1 step up/down/left/right
        if (dx + dy !== 1) return;
        
        // Check walls
        if (this.mapData.map[gridY][gridX] === '#' || this.mapData.map[gridY][gridX] === 'X') return;
        
        // Move Cat
        this.moveCat(gridX, gridY);
    }

    handleKeyInput(dx, dy) {
        if (!this.isPlayerTurn || this.gameOver) return;

        const newX = this.catPos.x + dx;
        const newY = this.catPos.y + dy;

        // Check bounds
        if (newX < 0 || newX >= this.mapData.map[0].length || 
            newY < 0 || newY >= this.mapData.map.length) return;

        // Check walls
        if (this.mapData.map[newY][newX] === '#' || this.mapData.map[newY][newX] === 'X') return;

        // Move Cat
        this.moveCat(newX, newY);
    }

    moveCat(x, y) {
        this.isPlayerTurn = false;
        this.catPos = { x, y };
        
        // Animate
        this.tweens.add({
            targets: this.catSprite,
            x: this.mapOffsetX + x * this.gridSize + this.gridSize/2,
            y: this.mapOffsetY + y * this.gridSize + this.gridSize/2,
            duration: 200,
            onComplete: () => {
                this.checkWinCondition();
                if (!this.gameOver) {
                    this.turnText.setText("Mouse's Turn...");
                    this.time.delayedCall(500, () => this.moveMouse());
                }
            }
        });
    }

    moveMouse() {
        // Get next position from path
        // path includes start position, so index 0 is start. index 1 is first move.
        this.mousePathIndex++;
        
        console.log(`Moving mouse. Index: ${this.mousePathIndex}, Path Length: ${this.path.length}`);
        
        if (this.mousePathIndex >= this.path.length) {
            // Mouse finished path
            this.checkWinCondition();
            
            if (!this.gameOver) {
                // Mouse hasn't won (not at door) and hasn't been caught.
                // It's cornered or stuck. Pass turn back to player.
                this.isPlayerTurn = true;
                this.turnText.setText("Your Turn (Move Cat)");
            }
            return;
        }
        
        const nextPos = this.path[this.mousePathIndex];
        console.log('Next Mouse Pos:', nextPos);
        
        // nextPos is [row, col] -> [y, x]
        const nextY = nextPos[0];
        const nextX = nextPos[1];
        
        this.mousePos = { x: nextX, y: nextY };
        
        // Animate
        this.tweens.add({
            targets: this.mouseSprite,
            x: this.mapOffsetX + nextX * this.gridSize + this.gridSize/2,
            y: this.mapOffsetY + nextY * this.gridSize + this.gridSize/2,
            duration: 200,
            onComplete: () => {
                this.checkWinCondition();
                if (!this.gameOver) {
                    this.isPlayerTurn = true;
                    this.turnText.setText("Your Turn (Move Cat)");
                }
            }
        });
    }

    checkWinCondition() {
        // 1. Cat catches Mouse
        if (this.catPos.x === this.mousePos.x && this.catPos.y === this.mousePos.y) {
            this.gameOver = true;
            this.turnText.setText("YOU CAUGHT THE MOUSE!");
            this.turnText.setColor('#4caf50');
            this.time.delayedCall(1000, () => this.scene.start('LoseScene')); // LoseScene is actually "Cat Wins" contextually if we change text, but for now let's use it. 
            // Wait, LoseScene says "The cat caught the mouse!", so it fits perfectly!
            return;
        }
        
        // 2. Mouse reaches Door
        if (this.mousePos.x === this.doorPos.x && this.mousePos.y === this.doorPos.y) {
            this.gameOver = true;
            this.turnText.setText("MOUSE ESCAPED!");
            this.turnText.setColor('#f44336');
            this.time.delayedCall(1000, () => this.scene.start('WinScene')); // WinScene says "Mouse Escaped", fits perfectly.
            return;
        }
    }
}
