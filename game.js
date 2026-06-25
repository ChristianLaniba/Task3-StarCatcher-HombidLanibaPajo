import Boot from './scenes/Boot.js';
import Game from './scenes/Game.js';
import UI from './scenes/UI.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: "#090c17",

    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 900 },
            debug: false
        }
    },

    scene: [
        Boot,
        Game,
        UI
    ]
};

new Phaser.Game(config);