export default class PatrolEnemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.speed = 80;
        this.direction = 1; // 1 = right, -1 = left
        this.body.setGravityY(900);
    }

    patrol(platforms) {
        if (!this.active || !this.body) return;
        
        // Walk in current direction
        this.setVelocityX(this.speed * this.direction);

        // Check if there's a platform ahead
        const checkDistance = 30;
        const checkX = this.x + (this.direction * checkDistance);
        const checkY = this.y + 50;
        
        let willFall = true;
        
        // Check against all platforms
        const platformChildren = platforms.getChildren();
        for (let i = 0; i < platformChildren.length; i++) {
            const platform = platformChildren[i];
            if (checkX > platform.x - platform.displayWidth/2 && 
                checkX < platform.x + platform.displayWidth/2 &&
                checkY > platform.y - platform.displayHeight/2 &&
                checkY < platform.y + platform.displayHeight/2 + 10) {
                willFall = false;
                break;
            }
        }
        
        // Check against ground
        const groundY = 580;
        if (checkY > groundY - 30 && checkY < groundY + 30) {
            willFall = false;
        }

        // Turn around if about to fall off
        if (willFall) {
            this.direction *= -1;
            this.setFlipX(this.direction === -1);
        }

        // Turn at screen edges
        if (this.x >= 780) {
            this.direction = -1;
            this.setFlipX(true);
        } else if (this.x <= 20) {
            this.direction = 1;
            this.setFlipX(false);
        }

        // Turn at wall collisions
        if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(true);
        }
        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(false);
        }

        // Play walking animation
        this.play("patrolWalk", true);
    }
}