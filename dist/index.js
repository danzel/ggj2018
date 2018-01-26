"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("pixi");
require("p2");
var Phaser = require("phaser-ce");
require("./css/reset.css");
var gameState_1 = require("./gameState");
var loadingState_1 = require("./loadingState");
new gameState_1.default();
new loadingState_1.default();
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(1920, 1080, Phaser.AUTO, "content");
        this.game.state.add('loading', loadingState_1.default);
        this.game.state.add('game', gameState_1.default);
        this.game.state.start('loading');
    }
    return SimpleGame;
}());
var game = new SimpleGame();
//# sourceMappingURL=index.js.map