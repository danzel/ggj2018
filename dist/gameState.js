"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Phaser = require("phaser-ce");
var player_1 = require("./player");
var globalScore = [
    0, 0, 0, 0
];
var GameState = /** @class */ (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.losingPlayer = null;
        return _this;
    }
    GameState.prototype.init = function () {
        //TODO
    };
    GameState.prototype.preload = function () {
        var _this = this;
        var text = this.add.text(this.world.centerX, this.world.centerY, 'Loaded, lets go ', { font: '42px Bangers', fill: '#dddddd', align: 'center' });
        text.anchor.setTo(0.5, 0.5);
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.setImpactEvents(true);
        this.physics.p2.gravity.y = 100;
        this.physics.p2.applyGravity = true;
        this.players = [
            new player_1.Player(this.game, this.game.input.gamepad.pad1, 40, 40),
            new player_1.Player(this.game, this.game.input.gamepad.pad2, 1280 - 40, 40),
        ];
        if (globalScore.some(function (s) { return s != 0; })) {
            this.add.text(1920 / 2, 40, globalScore[0] + ", " + globalScore[1], {
                fontSize: 20,
                fill: '#ff0000'
            });
        }
        this.input.gamepad.start();
        this.physics.p2.onBeginContact.add(function (a, b, c, d, e) {
            if (_this.losingPlayer === null) {
                if (a.isPlayer && b.isMace) {
                    _this.losingPlayer = _this.players.indexOf(a.player);
                }
                if (b.isPlayer && a.isMace) {
                    _this.losingPlayer = _this.players.indexOf(b.player);
                }
                if (_this.losingPlayer !== null) {
                    _this.add.text(1920 / 2, 80, "Player " + _this.losingPlayer + " LOSES", {
                        fontSize: 20,
                        fill: '#ff0000'
                    });
                    setTimeout(function () { _this.game.state.start('game'); }, 1000);
                }
            }
        });
    };
    GameState.prototype.update = function () {
        this.players.forEach(function (p) { return p.update(); });
    };
    return GameState;
}(Phaser.State));
exports.default = GameState;
//# sourceMappingURL=gameState.js.map