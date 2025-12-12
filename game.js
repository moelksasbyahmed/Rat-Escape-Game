// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [EntranceScene, GameScene, SolvingScene, SolutionScene, WinScene, LoseScene]
};

const game = new Phaser.Game(config);
