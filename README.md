# Cat & Mouse Map Editor

A Phaser.js game where you can design maps with cats, mice, traps, and doors, then use a Python BFS algorithm to find the optimal escape path.

## 🎮 Features

### Map Editor
- **Checkerboard Grid**: Clear tile borders for easy placement
- **Placement Tools**:
  - ⚠️ **Trap** - Obstacles the mouse must avoid
  - 🐱 **Cat** - Enemy position (only one)
  - 🐭 **Mouse** - Starting position (only one)
  - 🚪 **Door** - Goal/escape point (only one)
- **Drag & Drop**: Move items after placing them
- **Right-Click**: Delete any item
- **Clear Button**: Reset the entire map

### JSON Export
- Saves map as `map_data.json` in the project folder
- Grid format: `.` (empty), `X` (trap), `C` (cat), `M` (mouse), `D` (door)
- Includes width and height dimensions

### Python BFS Solver
- Finds shortest path from mouse to door
- Avoids traps and cat
- Visualizes the solution with numbered steps
- Falls back to edge exits if no door is placed

## 🚀 How to Use

### Step 1: Start the Server
```powershell
node server.js
```

### Step 2: Open the Game
Open your browser and navigate to:
```
http://localhost:5000
```

### Step 3: Design Your Map
1. Click on a tool (Trap, Cat, Mouse, or Door)
2. Click on the map to place items
3. Drag items to reposition them
4. Right-click to delete items

### Step 4: Solve the Map
Click the **🔍 SOLVE** button

The game will:
1. Save `map_data.json` to the project folder
2. Show a "Solving..." loading screen
3. Automatically run the Python BFS solver
4. Display the solution path with step numbers
5. Show statistics (path length, traps avoided, etc.)

**No manual Python command needed!** Everything happens automatically.

## 📋 Requirements

- **Node.js** (for running the local server)
- **Python 3** (for running the BFS solver)
- Modern web browser

## 🗂️ File Structure

```
RAT_escape/
├── index.html             # Main HTML file
├── game.js                # Phaser game configuration
├── server.js              # Node.js server (saves JSON & runs Python)
├── bfs_solver.py          # Python pathfinding solver
├── scenes/
│   ├── EntranceScene.js      # Welcome screen
│   ├── GameScene.js          # Map editor
│   ├── SolvingScene.js       # Loading/solving screen
│   ├── SolutionScene.js      # Solution display
│   ├── WinScene.js           # Victory screen (legacy)
│   └── LoseScene.js          # Game over screen (legacy)
└── map_data.json          # Generated map file (created after SOLVE)
```

## 🎨 Map Grid

- **Size**: 12x9 tiles (600x450 pixels)
- **Tile Size**: 50x50 pixels
- **Checkerboard pattern** with highlighted borders

## 🔍 BFS Solver Features

- Finds shortest path using Breadth-First Search
- Automatically runs when you click SOLVE (no manual command needed!)
- Prioritizes door if placed, otherwise finds nearest edge exit
- Visualizes path with numbered steps in the browser
- Shows total move count and statistics
- Integrated directly into the game flow

## 🎬 Game Flow

1. **Entrance Scene** - Welcome screen
2. **Game Scene** - Design your map
3. **Solving Scene** - Animated loading while Python runs
4. **Solution Scene** - View the optimal path with visualization

Enjoy creating and solving puzzles! 🐭🚪
