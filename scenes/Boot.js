export default class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Load all assets needed for the game
        this.load.image("bg", "assets/bg.png");
        this.load.image("mainGround", "assets/tiles/ground.png");
        this.load.image("platform", "assets/tiles/platform.png");
        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 540,
            frameHeight: 540
        });
        this.load.spritesheet("patrolEnemy", "assets/patrolEnemy.png", {
            frameWidth: 540,
            frameHeight: 540
        });
        this.load.spritesheet("chaseEnemy", "assets/chaseEnemy.png", {
            frameWidth: 540,
            frameHeight: 540
        });
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.image("heart", "assets/heart.png");
        this.load.image("particle", "assets/particle.png");
    }

    create() {
        // Start the Game scene after loading is complete
        this.scene.start('Game');
    }
}