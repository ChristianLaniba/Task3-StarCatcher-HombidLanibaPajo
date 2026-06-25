import PatrolEnemy from '../entities/PatrolEnemy.js';
import ChaseEnemy from '../entities/ChaseEnemy.js';

const colors = [
    0xff0000, 0xff7f00, 0xffff00, 0x00ff00,
    0x0000ff, 0x4b0082, 0x9400d3
];

export default class Game extends Phaser.Scene {
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
        // All loading handled in Boot.js
    }

    create() {
        // Get a reference to the UI scene so enemies can call removeLife()
        this.uiScene = this.scene.get('UI');

        // Background
        this.add.image(400, 300, "bg").setDisplaySize(800, 600);

        // Ground
        this.ground = this.physics.add.staticGroup();
        const base = this.ground.create(400, 580, "mainGround");
        base.setScale(800 / base.width, 100 / base.height);
        base.refreshBody();
        base.body.setSize(base.displayWidth, 30);
        base.body.setOffset(0, base.displayHeight - 80);

        // Platforms
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

        // Player
        this.player = this.physics.add.sprite(100, 400, "player");
        this.player.setScale(0.1);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(180, 425);
        this.player.setOffset(180, 180);
        this.player.isInvincible = false;

        // Colliders
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.platforms);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Player animations
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

        // Patrol enemy animations
        this.anims.create({
            key: "patrolIdle",
            frames: [{ key: "patrolEnemy", frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: "patrolWalk",
            frames: [
                { key: "patrolEnemy", frame: 2 },
                { key: "patrolEnemy", frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Chase enemy animations
        this.anims.create({
            key: "chaseIdle",
            frames: [{ key: "chaseEnemy", frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: "chaseWalk",
            frames: [
                { key: "chaseEnemy", frame: 2 },
                { key: "chaseEnemy", frame: 3 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Stars group
        this.stars = this.physics.add.group();

        // Star collection method
        this.collectStar = (player, star) => {
            star.destroy();
            
            if (this.score < this.maxStars) {
                this.score++;
                console.log("Score: ", this.score);
                this.spawnParticles(star.x, star.y);
            }

            if (this.score >= this.maxStars && !this.reachedMax) {
                this.reachedMax = true;
                this.score = this.maxStars;
                
                const remainingStars = this.stars.getChildren();
                console.log("Remaining stars to despawn: " + remainingStars.length);
                
                const starsToDestroy = [...remainingStars];
                starsToDestroy.forEach(s => {
                    s.destroy();
                });
                
                console.log("All stars collected! Score: " + this.score);
                return;
            }

            if (this.reachedMax) {
                return;
            }

            player.setTint(colors[this.colorIndex]);
            this.colorIndex = (this.colorIndex + 1) % colors.length;

            if (Math.floor(this.score / 5) > this.lastScaleMilestone) {
                this.lastScaleMilestone++;
                player.setScale(player.scaleX * 1.1);
            }

            const x = Phaser.Math.Between(50, 750);
            const newStar = this.stars.create(x, 0, "star");
            newStar.setScale(0.5);
            newStar.setCircle(newStar.width / 2);
            newStar.setBounce(0);
            newStar.setCollideWorldBounds(true);

            const bombX = player.x < 400 ? Phaser.Math.Between(420, 780) : Phaser.Math.Between(20, 380);
            const bomb = this.bombs.create(bombX, 0, "bomb");
            bomb.body.setOffset(0, 70);
            bomb.setScale(0.3);
            bomb.setCircle(bomb.displayWidth / 2);
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-220, 220), 20);
        };

        // Enemy hit handler (stomp + iframes)
        this.hitEnemy = (player, enemy) => {
            // Stomp: player falling onto enemy from above
            if (player.body.velocity.y > 0 && player.y < enemy.y) {
                enemy.disableBody(true, true);
                this.spawnParticles(enemy.x, enemy.y);
                player.setVelocityY(-300);
            } else {
                // Player takes damage - only if not invincible
                if (!player.isInvincible) {
                    this.playerHit();
                }
            }
        };

        // Spawn particle burst helper
        this.spawnParticles = (x, y) => {
            const particles = this.add.particles(x, y, 'particle', {
                speed: { min: 80, max: 200 },
                scale: { start: 0.6, end: 0 },
                lifespan: 400,
                quantity: 12,
                emitting: false
            });
            particles.explode(12);
        };

        // Player hit with iframes (for both enemies and bombs)
        this.playerHit = () => {
            if (this.player.isInvincible) return;
            this.player.isInvincible = true;
            if (this.uiScene) {
                this.uiScene.removeLife();
            }
            
            // Flash the player sprite
            this.tweens.add({
                targets: this.player,
                alpha: 0,
                duration: 100,
                repeat: 5,
                yoyo: true,
                onComplete: () => {
                    this.player.alpha = 1;
                    this.player.isInvincible = false;
                }
            });
        };

        // Bomb hit - flash player and destroy bomb
        this.hitBomb = (player, bomb) => {
            bomb.destroy();
            
            if (!player.isInvincible) {
                this.playerHit();
            }
        };

        // Patrol enemies
        this.enemies = this.physics.add.group();
        
        const patrolPositions = [
            { x: 150, y: 430 },
            { x: 650, y: 360 }
        ];
        
        patrolPositions.forEach(pos => {
            const enemy = new PatrolEnemy(this, pos.x, pos.y, 'patrolEnemy');
            enemy.setScale(0.1);
            enemy.setSize(180, 425);
            enemy.setOffset(180, 180);
            enemy.speed = 80;
            enemy.direction = 1;
            enemy.play("patrolIdle");
            this.enemies.add(enemy);
        });

        // Chase enemies
        this.chasers = this.physics.add.group();
        
        const chasePositions = [
            { x: 500, y: 260 },
            { x: 200, y: 160 }
        ];
        
        chasePositions.forEach(pos => {
            const chaser = new ChaseEnemy(this, pos.x, pos.y, 'chaseEnemy');
            chaser.setScale(0.1);
            chaser.setSize(180, 425);
            chaser.setOffset(180, 180);
            chaser.speed = 80;
            chaser.direction = 1;
            chaser.play("chaseIdle");
            this.chasers.add(chaser);
        });

        // Collisions for enemies with ground and platforms
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.chasers, this.ground);
        this.physics.add.collider(this.chasers, this.platforms);
        
        // Player vs enemies overlap (stomp/damage)
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.chasers, this.hitEnemy, null, this);

        // Bombs
        this.bombs = this.physics.add.group();

        // Bomb collisions with ground and platforms
        this.physics.add.collider(this.bombs, this.ground);
        this.physics.add.collider(this.bombs, this.platforms);
        
        // Player vs bomb overlap
        this.physics.add.overlap(this.player, this.bombs, this.hitBomb, null, this);

        // Create all stars
        const createStar = (x, y) => {
            const star = this.stars.create(x, y || 0, "star");
            star.setScale(0.5);
            star.setCircle(star.width / 2);
            star.setBounce(0);
            star.setCollideWorldBounds(true);
            return star;
        };

        // Initial stars (3 stars total)
        createStar(Phaser.Math.Between(50, 750), 0);
        createStar(250, 150);
        createStar(650, 120);

        // Star collisions
        this.physics.add.collider(this.stars, this.ground);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // Launch UI on top
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

        // Update patrol enemies
        this.enemies.getChildren().forEach(e => {
            if (e.active) {
                e.patrol(this.platforms);
            }
        });
        
        // Update chase enemies
        this.chasers.getChildren().forEach(e => {
            if (e.active) {
                e.chase(this.player);
            }
        });
    }
}