class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.cat = null;
        this.mouse = null;
        this.door = null;
        this.traps = [];
        this.exitZone = null;
        this.isDragging = false;
        this.gridSize = 50;
        this.mapOffsetX = 50;
        this.mapOffsetY = 80;
        this.mapWidth = 600;
        this.mapHeight = 450;
        this.gridWidth = 12; // 600 / 50
        this.gridHeight = 9; // 450 / 50
        this.placementMode = 'trap'; // 'trap', 'cat', 'mouse', 'door'
    }

    create() {
        // Background gradient
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e, 1);
        graphics.fillRect(0, 0, 800, 600);
        
        // Title
        this.add.text(400, 30, 'CAT & MOUSE MAP EDITOR', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ecf0f1',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Map container background
        this.add.rectangle(this.mapOffsetX + this.mapWidth/2, this.mapOffsetY + this.mapHeight/2, 
                          this.mapWidth + 20, this.mapHeight + 20, 0x1a1a1a);
        
        // Game map background
        this.add.rectangle(this.mapOffsetX + this.mapWidth/2, this.mapOffsetY + this.mapHeight/2, 
                          this.mapWidth, this.mapHeight, 0x8bc34a);
        
        // Grid pattern for map
        this.createGrid();

        // Create borders
        this.createBorders();

        // Create toolbar (outside map)
        this.createToolbar();

        // Create buttons (outside map)
        this.createButtons();

        // Enable map clicking for placement
        this.input.on('pointerdown', (pointer) => {
            this.handleMapClick(pointer);
        });
    }

    createGrid() {
        // Draw individual tiles with borders
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const tileX = this.mapOffsetX + x * this.gridSize;
                const tileY = this.mapOffsetY + y * this.gridSize;
                
                // Tile background - alternating colors for checkerboard
                const isLight = (x + y) % 2 === 0;
                const tileColor = isLight ? 0x9ccc65 : 0x8bc34a;
                this.add.rectangle(tileX, tileY, this.gridSize, this.gridSize, tileColor).setOrigin(0);
                
                // Tile border
                const border = this.add.graphics();
                border.lineStyle(2, 0x558b2f, 1);
                border.strokeRect(tileX, tileY, this.gridSize, this.gridSize);
            }
        }
    }

    createBorders() {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, 0x5d4037);
        graphics.strokeRect(this.mapOffsetX, this.mapOffsetY, this.mapWidth, this.mapHeight);
    }

    createToolbar() {
        // Toolbar title
        this.add.text(715, 100, 'TOOLS', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        // Mode buttons - vertical layout on right side
        const modes = [
            { key: 'trap', label: '⚠️', name: 'Trap', color: 0xf44336, y: 130 },
            { key: 'cat', label: '🐱', name: 'Cat', color: 0xff9800, y: 210 },
            { key: 'mouse', label: '🐭', name: 'Mouse', color: 0x9e9e9e, y: 290 },
            { key: 'door', label: '🚪', name: 'Door', color: 0x795548, y: 370 }
        ];

        modes.forEach(mode => {
            // Button background with shadow
            const shadow = this.add.rectangle(715, mode.y + 3, 130, 70, 0x000000, 0.3);
            shadow.setDepth(9);
            
            const btn = this.add.rectangle(715, mode.y, 130, 70, mode.color);
            btn.setDepth(10);
            
            const emojiText = this.add.text(715, mode.y - 10, mode.label, {
                fontSize: '36px'
            }).setOrigin(0.5);
            emojiText.setDepth(11);
            
            const nameText = this.add.text(715, mode.y + 20, mode.name, {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            nameText.setDepth(11);

            btn.setInteractive({ useHandCursor: true });
            btn.setData('mode', mode.key);
            btn.setData('defaultColor', mode.color);
            btn.setData('shadow', shadow);

            // Highlight selected mode
            if (this.placementMode === mode.key) {
                btn.setStrokeStyle(4, 0xffffff);
                btn.setScale(1.1);
                shadow.setScale(1.1);
            }

            btn.on('pointerdown', () => {
                this.placementMode = mode.key;
                this.updateToolbarSelection();
            });

            btn.on('pointerover', () => {
                if (this.placementMode !== mode.key) {
                    btn.setScale(1.05);
                    shadow.setScale(1.05);
                    emojiText.setScale(1.05);
                    nameText.setScale(1.05);
                }
            });

            btn.on('pointerout', () => {
                if (this.placementMode !== mode.key) {
                    btn.setScale(1);
                    shadow.setScale(1);
                    emojiText.setScale(1);
                    nameText.setScale(1);
                }
            });

            // Store reference
            if (!this.toolbarButtons) this.toolbarButtons = [];
            this.toolbarButtons.push({ btn, shadow, emoji: emojiText, name: nameText });
        });
    }

    updateToolbarSelection() {
        this.toolbarButtons.forEach(item => {
            const btn = item.btn;
            const shadow = item.shadow;
            const emoji = item.emoji;
            const name = item.name;
            
            if (btn.getData('mode') === this.placementMode) {
                btn.setStrokeStyle(4, 0xffffff);
                btn.setScale(1.1);
                shadow.setScale(1.1);
            } else {
                btn.setStrokeStyle(0);
                btn.setScale(1);
                shadow.setScale(1);
            }
        });
    }

    createButtons() {
        // Solve button - elegant design
        const solveShadow = this.add.rectangle(715, 473, 150, 60, 0x000000, 0.3);
        solveShadow.setDepth(9);
        
        const solveBtn = this.add.rectangle(715, 470, 150, 60, 0x4caf50);
        solveBtn.setDepth(10);
        
        const solveIcon = this.add.text(715, 455, '🔍', {
            fontSize: '24px'
        }).setOrigin(0.5);
        solveIcon.setDepth(11);
        
        const solveText = this.add.text(715, 485, 'SOLVE', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        solveText.setDepth(11);

        solveBtn.setInteractive({ useHandCursor: true });
        solveBtn.on('pointerdown', () => {
            this.generateMapJSON();
        });

        solveBtn.on('pointerover', () => {
            solveBtn.setFillStyle(0x388e3c);
            solveBtn.setScale(1.05);
            solveShadow.setScale(1.05);
            solveIcon.setScale(1.05);
            solveText.setScale(1.05);
        });

        solveBtn.on('pointerout', () => {
            solveBtn.setFillStyle(0x4caf50);
            solveBtn.setScale(1);
            solveShadow.setScale(1);
            solveIcon.setScale(1);
            solveText.setScale(1);
        });

        // Clear button - elegant design
        const clearShadow = this.add.rectangle(715, 563, 150, 50, 0x000000, 0.3);
        clearShadow.setDepth(9);
        
        const clearBtn = this.add.rectangle(715, 560, 150, 50, 0xe74c3c);
        clearBtn.setDepth(10);
        
        const clearText = this.add.text(715, 560, '🗑️ CLEAR', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        clearText.setDepth(11);

        clearBtn.setInteractive({ useHandCursor: true });
        clearBtn.on('pointerdown', () => {
            this.clearMap();
        });

        clearBtn.on('pointerover', () => {
            clearBtn.setFillStyle(0xc0392b);
            clearBtn.setScale(1.05);
            clearShadow.setScale(1.05);
            clearText.setScale(1.05);
        });

        clearBtn.on('pointerout', () => {
            clearBtn.setFillStyle(0xe74c3c);
            clearBtn.setScale(1);
            clearShadow.setScale(1);
            clearText.setScale(1);
        });
    }

    handleMapClick(pointer) {
        // Check if click is within map bounds
        if (pointer.x < this.mapOffsetX || pointer.x > this.mapOffsetX + this.mapWidth ||
            pointer.y < this.mapOffsetY || pointer.y > this.mapOffsetY + this.mapHeight) {
            return;
        }

        // Snap to grid relative to map offset
        const relativeX = pointer.x - this.mapOffsetX;
        const relativeY = pointer.y - this.mapOffsetY;
        const gridX = Math.floor(relativeX / this.gridSize);
        const gridY = Math.floor(relativeY / this.gridSize);
        const snapX = this.mapOffsetX + gridX * this.gridSize + this.gridSize / 2;
        const snapY = this.mapOffsetY + gridY * this.gridSize + this.gridSize / 2;

        // Place item based on mode
        if (this.placementMode === 'trap') {
            this.placeTrap(snapX, snapY, gridX, gridY);
        } else if (this.placementMode === 'cat') {
            this.placeCat(snapX, snapY, gridX, gridY);
        } else if (this.placementMode === 'mouse') {
            this.placeMouse(snapX, snapY, gridX, gridY);
        } else if (this.placementMode === 'door') {
            this.placeDoor(snapX, snapY, gridX, gridY);
        }
    }

    placeTrap(x, y, gridX, gridY) {
        const trap = this.add.rectangle(x, y, 40, 40, 0xf44336);
        const trapText = this.add.text(x, y, '⚠️', {
            fontSize: '30px'
        }).setOrigin(0.5);

        trap.setData('trapText', trapText);
        trap.setData('gridX', gridX);
        trap.setData('gridY', gridY);

        // Make draggable
        trap.setInteractive({ useHandCursor: true });
        this.input.setDraggable(trap);

        trap.on('drag', (pointer, dragX, dragY) => {
            // Check if within map bounds
            if (dragX < this.mapOffsetX || dragX > this.mapOffsetX + this.mapWidth ||
                dragY < this.mapOffsetY || dragY > this.mapOffsetY + this.mapHeight) {
                return;
            }
            
            const relX = dragX - this.mapOffsetX;
            const relY = dragY - this.mapOffsetY;
            const snapX = this.mapOffsetX + Math.round(relX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const snapY = this.mapOffsetY + Math.round(relY / this.gridSize) * this.gridSize + this.gridSize / 2;
            trap.setPosition(snapX, snapY);
            trapText.setPosition(snapX, snapY);
            trap.setData('gridX', Math.floor((snapX - this.mapOffsetX) / this.gridSize));
            trap.setData('gridY', Math.floor((snapY - this.mapOffsetY) / this.gridSize));
        });

        // Right-click to delete
        trap.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                trapText.destroy();
                trap.destroy();
                this.traps = this.traps.filter(t => t !== trap);
            }
        });

        this.traps.push(trap);

        // Pulsing animation
        this.tweens.add({
            targets: [trap, trapText],
            scale: 1.2,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    placeCat(x, y, gridX, gridY) {
        // Remove existing cat
        if (this.cat) {
            this.cat.destroy();
        }

        const catText = this.add.text(x, y, '🐱', {
            fontSize: '48px'
        }).setOrigin(0.5);

        catText.setData('gridX', gridX);
        catText.setData('gridY', gridY);

        catText.setInteractive({ useHandCursor: true });
        this.input.setDraggable(catText);

        catText.on('drag', (pointer, dragX, dragY) => {
            // Check if within map bounds
            if (dragX < this.mapOffsetX || dragX > this.mapOffsetX + this.mapWidth ||
                dragY < this.mapOffsetY || dragY > this.mapOffsetY + this.mapHeight) {
                return;
            }
            
            const relX = dragX - this.mapOffsetX;
            const relY = dragY - this.mapOffsetY;
            const snapX = this.mapOffsetX + Math.round(relX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const snapY = this.mapOffsetY + Math.round(relY / this.gridSize) * this.gridSize + this.gridSize / 2;
            catText.setPosition(snapX, snapY);
            catText.setData('gridX', Math.floor((snapX - this.mapOffsetX) / this.gridSize));
            catText.setData('gridY', Math.floor((snapY - this.mapOffsetY) / this.gridSize));
        });

        // Right-click to delete
        catText.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                catText.destroy();
                this.cat = null;
            }
        });

        this.cat = catText;
    }

    placeMouse(x, y, gridX, gridY) {
        // Remove existing mouse
        if (this.mouse) {
            this.mouse.destroy();
        }

        const mouseText = this.add.text(x, y, '🐭', {
            fontSize: '40px'
        }).setOrigin(0.5);

        mouseText.setData('gridX', gridX);
        mouseText.setData('gridY', gridY);

        mouseText.setInteractive({ useHandCursor: true });
        this.input.setDraggable(mouseText);

        mouseText.on('drag', (pointer, dragX, dragY) => {
            // Check if within map bounds
            if (dragX < this.mapOffsetX || dragX > this.mapOffsetX + this.mapWidth ||
                dragY < this.mapOffsetY || dragY > this.mapOffsetY + this.mapHeight) {
                return;
            }
            
            const relX = dragX - this.mapOffsetX;
            const relY = dragY - this.mapOffsetY;
            const snapX = this.mapOffsetX + Math.round(relX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const snapY = this.mapOffsetY + Math.round(relY / this.gridSize) * this.gridSize + this.gridSize / 2;
            mouseText.setPosition(snapX, snapY);
            mouseText.setData('gridX', Math.floor((snapX - this.mapOffsetX) / this.gridSize));
            mouseText.setData('gridY', Math.floor((snapY - this.mapOffsetY) / this.gridSize));
        });

        // Right-click to delete
        mouseText.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                mouseText.destroy();
                this.mouse = null;
            }
        });

        this.mouse = mouseText;
    }

    placeDoor(x, y, gridX, gridY) {
        // Remove existing door
        if (this.door) {
            this.door.destroy();
        }

        const doorText = this.add.text(x, y, '🚪', {
            fontSize: '48px'
        }).setOrigin(0.5);

        doorText.setData('gridX', gridX);
        doorText.setData('gridY', gridY);

        doorText.setInteractive({ useHandCursor: true });
        this.input.setDraggable(doorText);

        doorText.on('drag', (pointer, dragX, dragY) => {
            // Check if within map bounds
            if (dragX < this.mapOffsetX || dragX > this.mapOffsetX + this.mapWidth ||
                dragY < this.mapOffsetY || dragY > this.mapOffsetY + this.mapHeight) {
                return;
            }
            
            const relX = dragX - this.mapOffsetX;
            const relY = dragY - this.mapOffsetY;
            const snapX = this.mapOffsetX + Math.round(relX / this.gridSize) * this.gridSize + this.gridSize / 2;
            const snapY = this.mapOffsetY + Math.round(relY / this.gridSize) * this.gridSize + this.gridSize / 2;
            doorText.setPosition(snapX, snapY);
            doorText.setData('gridX', Math.floor((snapX - this.mapOffsetX) / this.gridSize));
            doorText.setData('gridY', Math.floor((snapY - this.mapOffsetY) / this.gridSize));
        });

        // Right-click to delete
        doorText.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                doorText.destroy();
                this.door = null;
            }
        });

        this.door = doorText;
    }

    clearMap() {
        // Clear all traps
        this.traps.forEach(trap => {
            const trapText = trap.getData('trapText');
            if (trapText) trapText.destroy();
            trap.destroy();
        });
        this.traps = [];

        // Clear cat
        if (this.cat) {
            this.cat.destroy();
            this.cat = null;
        }

        // Clear mouse
        if (this.mouse) {
            this.mouse.destroy();
            this.mouse = null;
        }

        // Clear door
        if (this.door) {
            this.door.destroy();
            this.door = null;
        }
    }

    generateMapJSON() {
        // Create empty grid
        const grid = Array(this.gridHeight).fill(null).map(() => 
            Array(this.gridWidth).fill('.')
        );

        // Place traps
        this.traps.forEach(trap => {
            const gridX = trap.getData('gridX');
            const gridY = trap.getData('gridY');
            if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
                grid[gridY][gridX] = 'X';
            }
        });

        // Place cat
        if (this.cat) {
            const catX = this.cat.getData('gridX');
            const catY = this.cat.getData('gridY');
            if (catX >= 0 && catX < this.gridWidth && catY >= 0 && catY < this.gridHeight) {
                grid[catY][catX] = 'C';
            }
        }

        // Place mouse
        if (this.mouse) {
            const mouseX = this.mouse.getData('gridX');
            const mouseY = this.mouse.getData('gridY');
            if (mouseX >= 0 && mouseX < this.gridWidth && mouseY >= 0 && mouseY < this.gridHeight) {
                grid[mouseY][mouseX] = 'M';
            }
        }

        // Place door
        if (this.door) {
            const doorX = this.door.getData('gridX');
            const doorY = this.door.getData('gridY');
            if (doorX >= 0 && doorX < this.gridWidth && doorY >= 0 && doorY < this.gridHeight) {
                grid[doorY][doorX] = 'D';
            }
        }

        // Create JSON object
        const mapData = {
            width: this.gridWidth,
            height: this.gridHeight,
            grid: grid
        };

        // Display JSON in console
        console.log('Map JSON:', JSON.stringify(mapData, null, 2));
        
        // Validate that mouse and cat are placed
        if (!this.mouse) {
            this.showError('Please place the MOUSE on the map!');
            return;
        }
        
        if (!this.cat) {
            this.showError('Please place the CAT on the map!');
            return;
        }
        
        // Transition to SolvingScene which will handle saving and solving
        this.scene.start('SolvingScene', { mapData: mapData });
    }

    showError(message) {
        // Create error overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        overlay.setDepth(200);

        const errorBox = this.add.rectangle(400, 300, 500, 200, 0xf44336);
        errorBox.setDepth(201);

        const errorTitle = this.add.text(400, 250, '⚠️ ERROR', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        errorTitle.setDepth(202);

        const errorText = this.add.text(400, 310, message, {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        errorText.setDepth(202);

        const okBtn = this.add.rectangle(400, 370, 100, 40, 0xd32f2f);
        okBtn.setDepth(202);
        const okText = this.add.text(400, 370, 'OK', {
            fontSize: '20px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);
        okText.setDepth(202);

        okBtn.setInteractive({ useHandCursor: true });
        okBtn.on('pointerdown', () => {
            overlay.destroy();
            errorBox.destroy();
            errorTitle.destroy();
            errorText.destroy();
            okBtn.destroy();
            okText.destroy();
        });

        okBtn.on('pointerover', () => {
            okBtn.setFillStyle(0xb71c1c);
        });

        okBtn.on('pointerout', () => {
            okBtn.setFillStyle(0xd32f2f);
        });
    }

    update() {
        // No continuous updates needed in placement mode
    }
}
