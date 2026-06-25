class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Game' });
        this.score = 0;
        this.gameOver = false;
        this.lastScaleMilestone = 0;
        this.colorIndex = 0;
        this.maxStars = 10;
        this.reachedMax = false;
    }

    preload() {
        this.load.image("bg", "assets/bg.png");
        this.load.image("mainGround", "assets/tiles/ground.png");
        this.load.image("platform", "assets/tiles/platform.png");
        this.load.spritesheet("player", "assets/player.png", {
            frameWidth: 540,
            frameHeight: 540
        });
        this.load.image("star", "assets/star.png");
        this.load.image("bomb", "assets/bomb.png");
        this.load.image("heart", "assets/heart.png");
    }

    create() {
        const colors = [
            0xff0000, 0xff7f00, 0xffff00, 0x00ff00,
            0x0000ff, 0x4b0082, 0x9400d3
        ];

        this.add.image(400, 300, "bg").setDisplaySize(800, 600);

        //ground
        this.ground = this.physics.add.staticGroup();
        const base = this.ground.create(400, 580, "mainGround");
        base.setScale(800 / base.width, 100 / base.height);
        base.refreshBody();
        base.body.setSize(base.displayWidth, 30);
        base.body.setOffset(0, base.displayHeight - 80);

        //platforms
        this.platforms = this.physics.add.staticGroup();
        
        const platformPositions = [
            { x: 150, y: 450 },
            { x: 440, y: 380 },
            { x: 400, y: 280 },
            { x: 750, y: 410 },
            { x: 90, y: 310 },
            { x: 650, y: 175 },
            { x: 350, y: 100 },
            { x: 250, y: 180 }
        ];

        platformPositions.forEach(pos => {
            const p = this.platforms.create(pos.x, pos.y, "platform");
            p.setScale(0.5);
            p.refreshBody();
            p.body.setSize(p.displayWidth, 20);
            p.body.setOffset(0, p.displayHeight - 20);
        });

        //player
        this.player = this.physics.add.sprite(100, 400, "player");
        this.player.setScale(0.1);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(180, 425);
        this.player.setOffset(180, 180);

        //colliders
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);

        //controls
        this.cursors = this.input.keyboard.createCursorKeys();

        //animations
        this.anims.create({
            key: "idle",
            frames: [{ key: "player", frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: "walk",
            frames: [
                { key: "player", frame: 2 },
                { key: "player", frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "jump",
            frames: [{ key: "player", frame: 1 }],
            frameRate: 1
        });

        this.player.play("idle");

        //stars
        this.stars = this.physics.add.group();

        this.collectStar = (player, star) => {
            //destroy the star we collected
            star.destroy();
            
            //increment score if not at max
            if (this.score < this.maxStars) {
                this.score++;
                console.log("Score: ", this.score);
            }

            //check if we reached max
            if (this.score >= this.maxStars && !this.reachedMax) {
                this.reachedMax = true;
                this.score = this.maxStars;
                
                //despawn ALL remaining stars
                const remainingStars = this.stars.getChildren();
                console.log("Remaining stars to despawn: " + remainingStars.length);
                
                //store in array to avoid modification issues
                const starsToDestroy = [...remainingStars];
                starsToDestroy.forEach(s => {
                    s.destroy();
                });
                
                console.log("All stars collected! Score: " + this.score);
                return;
            }

            //don't spawn anything if we already reached max
            if (this.reachedMax) {
                return;
            }

            //player tint
            player.setTint(colors[this.colorIndex]);
            this.colorIndex = (this.colorIndex + 1) % colors.length;

            //scale up
            if (Math.floor(this.score / 5) > this.lastScaleMilestone) {
                this.lastScaleMilestone++;
                player.setScale(player.scaleX * 1.1);
            }

            //spawn new star
            const x = Phaser.Math.Between(50, 750);
            const newStar = this.stars.create(x, 0, "star");
            newStar.setScale(0.5);
            newStar.setCircle(newStar.width / 2);
            newStar.setBounce(0);
            newStar.setCollideWorldBounds(true);

            //spawn bomb
            const bombX = player.x < 400 ? Phaser.Math.Between(420, 780) : Phaser.Math.Between(20, 380);
            const bomb = this.bombs.create(bombX, 0, "bomb");
            bomb.body.setOffset(0, 70);
            bomb.setScale(0.3);
            bomb.setCircle(bomb.displayWidth / 2);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-220, 220), 20);
        };

        this.hitBomb = (player, bomb) => {
            bomb.destroy();
            const uiScene = this.scene.get('UI');
            if (uiScene) {
                uiScene.removeLife();
            }
        };

        //create all stars in a function
        const createStar = (x, y) => {
            const star = this.stars.create(x, y || 0, "star");
            star.setScale(0.5);
            star.setCircle(star.width / 2);
            star.setBounce(0);
            star.setCollideWorldBounds(true);
            return star;
        };

        //initial stars (3 stars total)
        createStar(Phaser.Math.Between(50, 750), 0);
        createStar(250, 150);
        createStar(650, 120);

        //star collisions
        this.physics.add.collider(this.stars, this.ground);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        //bombs
        this.bombs = this.physics.add.group();

        //bomb collisions
        this.physics.add.collider(this.bombs, this.ground);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

        //launch UI on top
        this.scene.launch('UI');
    }

    update() {
        if (this.gameOver) return;

        let speed = 250;
        let moving = false;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            moving = true;
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            moving = true;
        }
        else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(-520);
        }

        if (!this.player.body.blocked.down) {
            this.player.play("jump", true);
        }
        else if (moving) {
            this.player.play("walk", true);
        }
        else {
            this.player.play("idle", true);
        }
    }
}

//UI Scene
class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UI' });
        this.lives = 3;
        this.timeLeft = 60;
    }

    create() {
        //score (top-left)
        this.scoreText = this.add.text(16, 16, 'Stars: 0/10', {
            fontSize: '24px',
            fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.scoreText.setScrollFactor(0);

        //timer (top-center)
        this.timerText = this.add.text(400, 16, 'Time: 60', {
            fontSize: '24px',
            fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);

        //lives (top-right)
        this.livesGroup = this.add.group();
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(700 + (i * 36), 24, 'heart');
            heart.setScale(0.5);
            heart.setScrollFactor(0);
            this.livesGroup.add(heart);
        }

        //timer event
        this.time.addEvent({
            delay: 1000,
            callback: this.countdown,
            callbackScope: this,
            loop: true
        });
    }

    countdown() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);

        //turn red when 10 or less
        if (this.timeLeft <= 10) {
            this.timerText.setColor('#ff0000');
        }

        if (this.timeLeft <= 0) {
            this.timerText.setText('Time: 0');
            const gameScene = this.scene.get('Game');
            if (gameScene && !gameScene.gameOver) {
                gameScene.gameOver = true;
                gameScene.physics.pause();
                gameScene.player.setTint(0xff0000);
                gameScene.player.anims.stop();

                gameScene.add.text(260, 200, "TIME'S UP!", {
                    fontSize: "48px",
                    fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
                    color: "#7f0000",
                    fontStyle: "bold"
                });

                console.log("Time's up! Final score: " + gameScene.score);
            }
        }
    }

    removeLife() {
        if (this.lives <= 0) return;
        
        const hearts = this.livesGroup.getChildren();
        if (hearts.length > 0) {
            const heart = hearts.pop();
            heart.destroy();
            this.lives--;
            console.log("Life lost! Remaining: " + this.lives);
        }

        if (this.lives <= 0) {
            const gameScene = this.scene.get('Game');
            if (gameScene && !gameScene.gameOver) {
                gameScene.gameOver = true;
                gameScene.physics.pause();
                gameScene.player.setTint(0xff0000);
                gameScene.player.anims.stop();

                gameScene.add.text(260, 200, "GAME OVER", {
                    fontSize: "48px",
                    fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
                    color: "#7f0000",
                    fontStyle: "bold"
                });

                console.log("Game Over! Final score: " + gameScene.score);
            }
        }
    }

    update() {
        const gameScene = this.scene.get('Game');
        if (gameScene) {
            this.scoreText.setText('Stars: ' + gameScene.score + '/10');
        }
    }
}

//Config
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },

    scene: [GameScene, UIScene]
};

new Phaser.Game(config);