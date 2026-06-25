export default class PatrolEnemy extends Phaser.Physics.Arcade.Sprite {
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

    patrol(platforms) {
        if (!this.active || !this.body) return;
        
        //walk in current direction
        this.setVelocityX(this.speed * this.direction);

        //check if platform ahead
        const checkDistance = 30;
        const checkX = this.x + (this.direction * checkDistance);
        const checkY = this.y + 50;
        
        let willFall = true;
        
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
        
        //check against ground
        const groundY = 580;
        if (checkY > groundY - 30 && checkY < groundY + 30) {
            willFall = false;
        }

        //turn around if about to fall off
        if (willFall) {
            this.direction *= -1;
            this.setFlipX(this.direction === -1);
        }

        //turn at screen edges
        if (this.x >= 780) {
            this.direction = -1;
            this.setFlipX(true);
        } else if (this.x <= 20) {
            this.direction = 1;
            this.setFlipX(false);
        }

        //turn at wall collisions
        if (this.body.blocked.right) {
            this.direction = -1;
            this.setFlipX(true);
        }
        if (this.body.blocked.left) {
            this.direction = 1;
            this.setFlipX(false);
        }

        this.play("patrolWalk", true);
    }
}