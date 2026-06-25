export default class UI extends Phaser.Scene {
    constructor() {
        super({ key: 'UI' });
        this.lives = 3;
        this.timeLeft = 60;
    }

    create() {
        // Score (top-left)
        this.scoreText = this.add.text(16, 16, 'Stars: 0/10', {
            fontSize: '24px',
            fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.scoreText.setScrollFactor(0);

        // Timer (top-center)
        this.timerText = this.add.text(400, 16, 'Time: 60', {
            fontSize: '24px',
            fontFamily: "'Comic Sans MS', 'Comic Sans', cursive",
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.timerText.setScrollFactor(0);

        // Lives (top-right) - left to right depletion
        this.livesGroup = this.add.group();
        this.heartPositions = [];
        const startX = 700;
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(startX + (i * 36), 24, 'heart');
            heart.setScale(0.5);
            heart.setScrollFactor(0);
            this.heartPositions.push({ x: startX + (i * 36), y: 24 });
            this.livesGroup.add(heart);
        }

        // Timer event
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
        
        // Sort hearts by x position (left to right)
        const hearts = this.livesGroup.getChildren();
        hearts.sort((a, b) => a.x - b.x);
        
        if (hearts.length > 0) {
            // Remove the leftmost heart
            const heartToRemove = hearts[0];
            heartToRemove.destroy();
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