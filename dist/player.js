"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Phaser = require("phaser-ce");
var globals_1 = require("./globals");
var Player = /** @class */ (function () {
    function Player(game, pad, x, y) {
        this.game = game;
        this.pad = pad;
        this.sprite = game.add.sprite(x, y, 'mushroom2');
        game.physics.p2.enable(this.sprite, globals_1.DebugRender);
        this.body = this.sprite.body;
        this.body.clearShapes();
        this.body.addCircle(30);
        this.body.angularDamping = 1;
        this.body.damping = .999;
        this.body.collideWorldBounds = true;
        this.body.gravityScale = 0;
        //Add the chain
        var chainRadius = 10;
        var maceRadius = 20;
        var chainLength = 5; //Math.random() * 30;
        var chainForce = Number.MAX_VALUE;
        var lastBody = this.body;
        var lastBodySize = 30;
        for (var i = 0; i < chainLength; i++) {
            var chainLink = game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius);
            game.physics.p2.enable(chainLink, globals_1.DebugRender);
            var chainBody = chainLink.body;
            chainBody.clearShapes();
            chainBody.addCircle(chainRadius);
            chainBody.mass *= 0.1;
            //Link to last
            game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius, undefined, undefined, chainForce);
            lastBody = chainBody;
            lastBodySize = chainRadius;
        }
        var mace = game.add.sprite(lastBody.x, lastBody.y + lastBodySize);
        game.physics.p2.enable(mace, globals_1.DebugRender);
        this.maceBody = mace.body;
        this.maceBody.clearShapes();
        this.maceBody.addCircle(maceRadius);
        this.maceBody.mass *= 0.5;
        this.maceBody.fixedRotation = true;
        game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius, undefined, undefined, chainForce);
        this.bodyMass = this.body.mass;
        this.maceMass = this.maceBody.mass;
        this.body.data.player = this;
        this.body.data.isPlayer = true;
        this.maceBody.data.player = this;
        this.maceBody.data.isMace = true;
    }
    //force = Math.random() * 20;
    Player.prototype.update = function () {
        if (!this.pad.connected) {
            return;
        }
        var scale = 5;
        this.body.applyImpulseLocal([-this.pad.axis(0) * scale, -this.pad.axis(1) * scale], 0, 0);
        if (this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER).isDown) {
            var bodyPoint = new Phaser.Point(this.body.x, this.body.y);
            var macePoint = new Phaser.Point(this.maceBody.x, this.maceBody.y);
            var angle = bodyPoint.angle(macePoint, true);
            var rotated = new Phaser.Point(2, 0).rotate(0, 0, angle + 90, true);
            //debugger;
            this.maceBody.applyImpulseLocal([rotated.x, rotated.y], 0, 0);
            this.body.mass = this.bodyMass * 10;
        }
        else {
            this.body.mass = this.bodyMass;
        }
        /*if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown) {
            this.body.mass = this.bodyMass * 3;
            this.maceBody.mass = this.maceMass * 0.1;
        } else {
            this.body.mass = this.bodyMass;
            this.maceBody.mass = this.maceMass;
        }*/
    };
    return Player;
}());
exports.Player = Player;
//# sourceMappingURL=player.js.map