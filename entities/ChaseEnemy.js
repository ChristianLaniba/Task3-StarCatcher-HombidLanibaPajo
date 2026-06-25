export default class ChaseEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.speed = 80;
        this.direction = 1;
        this.body.setGravityY(900);
    }

    chase(player) {
        if (!this.active || !this.body) return;
        
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y, player.x, player.y
        );
        
        if (distance < 200) {
            //move toward player
            const dir = player.x > this.x ? 1 : -1;
            this.setVelocityX(this.speed * 1.4 * dir);
            this.setFlipX(dir === -1);
            this.play("chaseWalk", true);
        } else {
            this.setVelocityX(0);
            this.play("chaseIdle", true);
        }
    }
}