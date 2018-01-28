webpackJsonp([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderWidth = 1920;
exports.RenderHeight = 1080;
exports.DebugRender = false;
exports.FontName = 'SF Cartoonist Hand';
exports.Names = [
    'rat',
    'mis',
    'nos',
    'sin',
];
exports.InitialLives = 6;


/***/ }),
/* 2 */,
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WeaponType;
(function (WeaponType) {
    WeaponType[WeaponType["Chain"] = 0] = "Chain";
    WeaponType[WeaponType["Arrow"] = 1] = "Arrow";
    WeaponType[WeaponType["Sword"] = 2] = "Sword";
    WeaponType[WeaponType["Count"] = 3] = "Count";
})(WeaponType = exports.WeaponType || (exports.WeaponType = {}));


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Phaser = __webpack_require__(0);
var globals_1 = __webpack_require__(1);
var G = __webpack_require__(1);
var weaponType_1 = __webpack_require__(3);
exports.MaxTurboTimeSeconds = 3;
exports.TurboRechargeSecondsPerSecond = .7;
exports.MaxHealth = 100;
exports.TimeToDie = 1000;
var bodyRadius = 30;
var arrowLength = 100;
var arrowWidth = 40;
var arrowSpeed = 80;
var swordLength = 120;
var swordWidth = 40;
var shadowOffset = 44;
var deathBubbleOffset = -100;
var Player = /** @class */ (function () {
    function Player(game, backgroundGroup, middleGroup, pad, startX, startY, weaponType, hideBars) {
        this.game = game;
        this.backgroundGroup = backgroundGroup;
        this.middleGroup = middleGroup;
        this.pad = pad;
        this.startX = startX;
        this.startY = startY;
        this.weaponType = weaponType;
        this.chains = new Array();
        this.chainBgs = new Array();
        this.turboAmount = exports.MaxTurboTimeSeconds;
        this.health = exports.MaxHealth;
        this.allThingsToDestroy = new Array();
        this.constraints = new Array();
        this.wasHoldingBumper = false;
        this.holdingArrow = true;
        pad.deadZone = 0;
        this.createBody(startX, startY);
        switch (weaponType) {
            case weaponType_1.WeaponType.Chain:
                this.createChain();
                break;
            case weaponType_1.WeaponType.Arrow:
                this.createArrowAim();
                break;
            case weaponType_1.WeaponType.Sword:
                this.createSword();
                break;
        }
        this.turboBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40, middleGroup);
        this.healthBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40, middleGroup);
        this.allThingsToDestroy.push(this.turboBar);
        this.allThingsToDestroy.push(this.healthBar);
        if (this.weaponType == weaponType_1.WeaponType.Arrow || hideBars) {
            this.turboBar.visible = false;
        }
        if (hideBars) {
            this.healthBar.visible = false;
        }
    }
    Player.prototype.destroy = function () {
        var _this = this;
        this.allThingsToDestroy.forEach(function (t) { return t.destroy(); });
        this.constraints.forEach(function (c) { return _this.game.physics.p2.removeConstraint(c); });
        if (this.arrow != null) {
            this.arrow.destroy();
        }
        if (this.arrowBg) {
            this.arrowBg.destroy();
        }
    };
    Player.prototype.createBody = function (x, y) {
        this.sprite = this.game.add.sprite(x, y, 'NE', undefined, this.middleGroup);
        this.sprite.scale.set(0.5);
        this.allThingsToDestroy.push(this.sprite);
        this.game.physics.p2.enable(this.sprite, globals_1.DebugRender);
        this.sprite.anchor.y = 0.4;
        this.shadow = this.game.add.sprite(x, y + shadowOffset, 'shadow', undefined, this.backgroundGroup);
        this.allThingsToDestroy.push(this.shadow);
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(0.4);
        this.spriteBg = this.game.add.sprite(x, y, 'NE_border', undefined, this.backgroundGroup);
        this.spriteBg.scale.set(0.5);
        this.spriteBg.anchor.set(0.5);
        this.allThingsToDestroy.push(this.spriteBg);
        this.spriteBg.anchor.y = 0.4;
        this.body = this.sprite.body;
        this.body.clearShapes();
        this.body.addCircle(bodyRadius);
        this.body.fixedRotation = true;
        this.body.angularDamping = 1;
        this.body.damping = .999;
        this.body.collideWorldBounds = true;
        this.bodyMass = this.body.mass;
        this.body.data.player = this;
        this.body.data.isPlayer = true;
    };
    Player.prototype.createChain = function () {
        //Add the chain
        var maceRadius = 20;
        var chainRadius = 10;
        var chainLength = 10; //5-10
        var lastBody = this.body;
        var lastBodySize = bodyRadius;
        for (var i = 0; i < chainLength; i++) {
            var chainLink = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius, 'chain', undefined, this.middleGroup);
            chainLink.scale.set(0.15);
            this.chains.push(chainLink);
            this.allThingsToDestroy.push(chainLink);
            var chainBg = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius, 'chain_border', undefined, this.backgroundGroup);
            chainBg.scale.set(0.15);
            this.chainBgs.push(chainBg);
            this.allThingsToDestroy.push(chainBg);
            chainBg.anchor.set(0.5);
            this.game.physics.p2.enable(chainLink, globals_1.DebugRender);
            var chainBody = chainLink.body;
            chainBody.data.isChain = true;
            chainBody.clearShapes();
            chainBody.addCircle(chainRadius * 2);
            chainBody.mass *= 0.1;
            //Link to last
            var ctr_1 = this.game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius);
            this.constraints.push(ctr_1);
            lastBody = chainBody;
            lastBodySize = chainRadius;
        }
        this.mace = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize, 'mace', undefined, this.middleGroup);
        this.mace.scale.set(0.4);
        this.allThingsToDestroy.push(this.mace);
        this.maceBg = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize, 'mace_border', undefined, this.backgroundGroup);
        this.allThingsToDestroy.push(this.maceBg);
        this.maceBg.scale.set(0.4);
        this.maceBg.anchor.set(0.5);
        this.game.physics.p2.enable(this.mace, globals_1.DebugRender);
        this.maceBody = this.mace.body;
        this.maceBody.clearShapes();
        this.maceBody.addCircle(maceRadius);
        this.maceBody.mass *= 0.5;
        this.maceBody.fixedRotation = true;
        var ctr = this.game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius);
        this.constraints.push(ctr);
        this.maceBody.data.player = this;
        this.maceBody.data.isWeapon = true;
    };
    Player.prototype.createSword = function () {
        this.sword = this.game.add.sprite(this.body.x, this.body.y - bodyRadius - swordLength * 0.6, 'axe', undefined, this.middleGroup);
        this.swordBg = this.game.add.sprite(this.body.x, this.body.y - bodyRadius - swordLength * 0.6, 'axe_border', undefined, this.backgroundGroup);
        this.swordBg.anchor.set(0.5);
        this.allThingsToDestroy.push(this.sword);
        this.allThingsToDestroy.push(this.swordBg);
        this.game.physics.p2.enable(this.sword, globals_1.DebugRender);
        var body = this.sword.body;
        body.clearShapes();
        var rect = body.addRectangle(swordWidth, swordLength);
        body.mass *= 0.5;
        var ctr = this.game.physics.p2.createRevoluteConstraint(this.body, [0, 0], body, [0, bodyRadius + swordLength * 0.6]);
        this.constraints.push(ctr);
        body.data.player = this;
        body.data.isWeapon = true;
    };
    Player.prototype.createArrowAim = function () {
        this.arrowForAim = this.game.add.sprite(this.body.x, this.body.y, 'bow', undefined, this.middleGroup);
        this.arrowForAim.anchor.set(0.5);
        this.allThingsToDestroy.push(this.arrowForAim);
        this.arrowForAimBg = this.game.add.sprite(this.body.x, this.body.y, 'bow_border', undefined, this.backgroundGroup);
        this.arrowForAimBg.anchor.set(0.5);
        this.allThingsToDestroy.push(this.arrowForAimBg);
    };
    Player.prototype.createArrow = function (rotation) {
        this.arrow = this.game.add.sprite(this.body.x, this.body.y, 'arrow', undefined, this.middleGroup);
        this.arrow.scale.set(0.8);
        this.arrowBg = this.game.add.sprite(this.body.x, this.body.y, 'arrow_border', undefined, this.backgroundGroup);
        this.arrowBg.scale.set(0.8);
        this.arrowBg.anchor.set(0.5);
        this.game.physics.p2.enable(this.arrow, globals_1.DebugRender);
        var body = this.arrow.body;
        body.damping = 0.5;
        body.angularDamping = 0.5;
        body.clearShapes();
        var rect = body.addRectangle(arrowWidth, arrowLength, 0, 0);
        body.data.player = this;
        body.data.isWeapon = true;
        body.data.isArrow = true;
        this.game.physics.p2.world.disableBodyCollision(body.data, this.body.data);
        var vel = new Phaser.Point(0, -arrowSpeed);
        vel.rotate(0, 0, rotation + Math.PI / 2);
        body.applyImpulseLocal([vel.x, vel.y], 0, 0);
        body.rotation = rotation - Math.PI / 2;
        this.game.add.audio('bow_fire').play();
    };
    Player.prototype.allowArrowCollection = function () {
        this.game.physics.p2.world.enableBodyCollision(this.arrow.body.data, this.body.data);
    };
    Player.prototype.returnArrow = function () {
        this.arrowForAim.visible = true;
        this.arrowForAimBg.visible = true;
        this.holdingArrow = true;
        //Destroy the arrow
        this.arrow.destroy();
        this.arrow = null;
        this.arrowBg.destroy();
        this.arrowBg = null;
    };
    Player.prototype.updateTurboBar = function () {
        this.turboBar.x = this.sprite.x - 40;
        this.turboBar.y = this.sprite.y - 40;
        this.turboBar.clear();
        this.turboBar.beginFill(0xffffff);
        this.turboBar.drawRect(-2, -2, 84, 14);
        this.turboBar.endFill();
        this.turboBar.beginFill(0x888888);
        this.turboBar.drawRect(0, 0, 80 * this.turboAmount / exports.MaxTurboTimeSeconds, 10);
        this.turboBar.endFill();
    };
    Player.prototype.updateHealthBar = function () {
        this.healthBar.x = this.sprite.x - 40;
        this.healthBar.y = this.sprite.y - 28;
        this.healthBar.clear();
        this.healthBar.beginFill(0xffffff);
        this.healthBar.drawRect(-2, -2, 84, 14);
        this.healthBar.endFill();
        this.healthBar.beginFill(0x000000);
        this.healthBar.drawRect(0, 0, 80 * this.health / exports.MaxHealth, 10);
        this.healthBar.endFill();
    };
    Player.prototype.takeDamage = function (damage) {
        //damage = this.health;
        this.health -= damage;
        if (this.health < 0) {
            this.health = 0;
        }
        var text = this.game.add.text(this.body.x, this.body.y, "" + damage, {
            fontSize: 40 + damage,
            font: G.FontName,
            fill: '#000000'
        });
        text.anchor.set(0.5);
        //Fade in
        text.alpha = 0;
        text.scale.set(.4);
        this.game.add.tween(text.scale)
            .to({ x: 1, y: 1 }, 100, undefined, true);
        this.game.add.tween(text)
            .to({ alpha: 1 }, 100, undefined, true)
            .chain(this.game.add.tween(text)
            .to({ alpha: 0 }, 600));
        if (damage > 20) {
            this.game.camera.shake(damage * 0.001, 200);
        }
        if (this.health == 0) {
            var timeToDie = exports.TimeToDie * 0.7;
            //Lie down
            this.game.add.tween(this.sprite)
                .to({ rotation: Math.PI / 2 }, timeToDie, undefined, true);
            this.game.add.tween(this.sprite.anchor)
                .to({ x: 0, y: 0.8 }, timeToDie, undefined, true);
            this.game.add.tween(this.spriteBg.anchor)
                .to({ x: 0, y: 0.8 }, timeToDie, undefined, true);
            this.game.add.tween(this.shadow.scale)
                .to({ x: 0.7, y: 0.7 }, timeToDie, undefined, true);
            //swear about it
            this.deathBubble = this.game.add.sprite(this.sprite.x, this.sprite.y + deathBubbleOffset, 'ah_shit');
            this.deathBubble.scale.set(0.7);
            this.allThingsToDestroy.push(this.deathBubble);
        }
    };
    Player.prototype.update = function () {
        if (!this.pad.connected || this.pad.getButton(Phaser.Gamepad.BUTTON_0) == null) {
            return;
        }
        if (this.health > 0) {
            var scale = 5;
            var elapsedSeconds = this.game.time.elapsed / 1000;
            if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown && this.turboAmount > elapsedSeconds) {
                this.turboAmount -= elapsedSeconds;
                scale *= 3;
                this.body.mass = this.bodyMass * 3;
            }
            else {
                this.turboAmount = Math.min(exports.MaxTurboTimeSeconds, this.turboAmount + elapsedSeconds * exports.TurboRechargeSecondsPerSecond);
                this.body.mass = this.bodyMass;
            }
            if (this.weaponType == weaponType_1.WeaponType.Arrow) {
                this.arrowForAim.x = this.sprite.x;
                this.arrowForAim.y = this.sprite.y;
                if (this.holdingArrow) {
                    //Point the arrowForAim in the right direction
                    var rotation = this.arrowForAim.rotation;
                    var vel = new Phaser.Point(this.pad.axis(2), this.pad.axis(3));
                    var mag = vel.getMagnitude();
                    if (mag > 0.5) {
                        vel.normalize();
                        rotation = vel.angle(new Phaser.Point());
                        this.arrowForAim.rotation = rotation;
                    }
                    else {
                        vel = new Phaser.Point(0, 1);
                        vel.rotate(0, 0, this.arrowForAim.rotation);
                    }
                    var bumperIsDown = [
                        this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_BUMPER).isDown,
                        this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER).isDown,
                        this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER).isDown,
                        this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER).isDown
                    ].some(function (a) { return a; });
                    if (bumperIsDown && !this.wasHoldingBumper) {
                        this.wasHoldingBumper = true;
                        this.holdingArrow = false;
                        this.arrowForAim.visible = false;
                        this.arrowForAimBg.visible = false;
                        this.createArrow(rotation);
                    }
                    if (!bumperIsDown) {
                        this.wasHoldingBumper = false;
                    }
                }
            }
            this.body.applyImpulseLocal([-this.pad.axis(0) * scale, -this.pad.axis(1) * scale], 0, 0);
        }
    };
    Player.prototype.preRender = function () {
        var last = this.body;
        for (var i = 0; i < this.chains.length; i++) {
            var now = this.chains[i];
            var next = (i == this.chains.length - 1) ? this.maceBody : this.chains[i + 1];
            var pt = new Phaser.Point(last.x, last.y);
            var angle = pt.angle(new Phaser.Point(next.x, next.y));
            now.body.rotation = angle;
            last = now;
        }
        this.updateTurboBar();
        this.updateHealthBar();
        //Update backgrounds
        this.copyPasta(this.spriteBg, this.sprite);
        this.shadow.x = this.sprite.x;
        this.shadow.y = this.sprite.y + shadowOffset;
        if (this.deathBubble) {
            this.deathBubble.x = this.sprite.x;
            this.deathBubble.y = this.sprite.y + deathBubbleOffset;
        }
        if (this.sword) {
            this.copyPasta(this.swordBg, this.sword);
        }
        if (this.arrowForAim) {
            this.copyPasta(this.arrowForAimBg, this.arrowForAim);
        }
        if (this.arrow) {
            this.copyPasta(this.arrowBg, this.arrow);
        }
        if (this.mace) {
            this.copyPasta(this.maceBg, this.mace);
        }
        for (var i_1 = 0; i_1 < this.chains.length; i_1++) {
            this.copyPasta(this.chainBgs[i_1], this.chains[i_1]);
        }
        if (Math.abs(this.body.velocity.x) > 0.05 && Math.abs(this.body.velocity.y) > 0.05) {
            if (this.body.velocity.x > 0 && this.body.velocity.y > 0) {
                this.setSprite('SE');
            }
            if (this.body.velocity.x <= 0 && this.body.velocity.y > 0) {
                this.setSprite('SW');
            }
            if (this.body.velocity.x <= 0 && this.body.velocity.y <= 0) {
                this.setSprite('NW');
            }
            if (this.body.velocity.x > 0 && this.body.velocity.y <= 0) {
                this.setSprite('NE');
            }
        }
    };
    Player.prototype.setSprite = function (dir) {
        this.sprite.loadTexture(dir);
        this.spriteBg.loadTexture(dir + '_border');
    };
    Player.prototype.copyPasta = function (dest, source) {
        dest.x = source.x;
        dest.y = source.y;
        dest.rotation = source.rotation;
        dest.updateTransform();
    };
    return Player;
}());
exports.Player = Player;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(6);
__webpack_require__(8);
var Phaser = __webpack_require__(0);
__webpack_require__(12);
var gameState_1 = __webpack_require__(13);
var loadingState_1 = __webpack_require__(15);
var splashScreenState_1 = __webpack_require__(71);
var G = __webpack_require__(1);
new gameState_1.default();
new loadingState_1.default();
var SimpleGame = /** @class */ (function () {
    function SimpleGame() {
        this.game = new Phaser.Game(G.RenderWidth, G.RenderHeight, Phaser.AUTO, "content");
        this.game.state.add('loading', loadingState_1.default);
        this.game.state.add('splashscreen', splashScreenState_1.default);
        this.game.state.add('game', gameState_1.default);
        this.game.state.start('loading');
    }
    return SimpleGame;
}());
var game = new SimpleGame();


/***/ }),
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

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
var Phaser = __webpack_require__(0);
var player_1 = __webpack_require__(4);
var G = __webpack_require__(1);
var weaponType_1 = __webpack_require__(3);
var shuffle_1 = __webpack_require__(14);
var remainingLives = [
    G.InitialLives, G.InitialLives, G.InitialLives, G.InitialLives
];
var ImpactDamageMultiplier = 0.7;
var GameState = /** @class */ (function (_super) {
    __extends(GameState, _super);
    function GameState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.losingPlayer = null;
        return _this;
    }
    GameState.prototype.init = function () {
        //TODO
        this.losingPlayer = null;
        this.taunts = [
            'taunt_1',
            'taunt_2',
            'taunt_3',
            'taunt_4',
            'taunt_5',
            'taunt_6',
        ];
        shuffle_1.Shuffle(this.taunts);
        this.tauntsIndex = 0;
        this.weaponClashes = [
            'steel_hit_1',
            'steel_hit_2',
            'steel_hit_3',
            'steel_hit_4',
            'steel_hit_5',
        ];
        shuffle_1.Shuffle(this.weaponClashes);
        this.weaponClashIndex = 0;
        this.playerHits = [
            'player_hit_1',
            'player_hit_2',
            'player_hit_3',
            'player_hit_4',
            'player_hit_5',
            'player_hit_6',
            'player_hit_7',
        ];
        shuffle_1.Shuffle(this.playerHits);
        this.playerHitIndex = 0;
        this.bowHits = [
            'bow_hit_1',
            'bow_hit_2',
            'bow_hit_3',
            'bow_hit_4',
            'bow_hit_5',
            'bow_hit_6',
            'bow_hit_7',
        ];
        shuffle_1.Shuffle(this.bowHits);
        this.bowHitIndex = 0;
        this.playerWeapons = [
            [weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Sword, weaponType_1.WeaponType.Sword,],
            [weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Sword, weaponType_1.WeaponType.Sword,],
            [weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Sword, weaponType_1.WeaponType.Sword,],
            [weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Arrow, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Chain, weaponType_1.WeaponType.Sword, weaponType_1.WeaponType.Sword,],
        ];
        this.playerWeapons.forEach(function (w) {
            var anyMatch = false;
            do {
                shuffle_1.Shuffle(w);
                anyMatch = false;
                for (var i = 1; i < w.length; i++) {
                    if (w[i] == w[i - 1]) {
                        anyMatch = true;
                    }
                }
            } while (anyMatch);
        });
    };
    GameState.prototype.preload = function () {
        var _this = this;
        this.game.camera.shake(0, 0);
        if (!this.splatter) {
            this.splatter = this.game.add.graphics();
        }
        else {
            this.game.add.existing(this.splatter);
        }
        //let text = this.add.text(this.world.centerX, this.world.centerY, 'Loaded, lets go ', { font: '42px Bangers', fill: '#999999', align: 'center' });
        //text.anchor.setTo(0.5, 0.5);
        this.physics.startSystem(Phaser.Physics.P2JS);
        this.physics.p2.setImpactEvents(true);
        this.physics.p2.restitution = 0.4;
        this.underBloodGroupForLotsOfBlood = this.game.add.group();
        this.underBloodGroup = this.game.add.group(this.underBloodGroupForLotsOfBlood);
        this.backgroundGroup = this.game.add.group();
        this.middleGroup = this.game.add.group();
        this.players = [
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad1, 200, 200, this.playerWeapons[0][remainingLives[0] - 1]),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad2, G.RenderWidth - 200, 200, this.playerWeapons[1][remainingLives[1] - 1]),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad3, G.RenderWidth - 100, 720 - 40, this.playerWeapons[2][remainingLives[2] - 1]),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad4, 40, 720 - 40, this.playerWeapons[3][remainingLives[3] - 1]),
        ];
        this.sparkEmitter = this.game.add.emitter(0, 0, 1000);
        //(<any>this.sparkEmitter).blendMode = PIXI.blendModes.DARKEN;
        this.sparkEmitter.setAlpha(1, 0, 400);
        this.sparkEmitter.setRotation(0, 360);
        this.sparkEmitter.setScale(.3, .3, .3, .3);
        this.sparkEmitter.setXSpeed(-400, 400);
        this.sparkEmitter.setYSpeed(-400, 400);
        this.sparkEmitter.makeParticles('particle_1');
        this.overBloodGroup = this.game.add.group();
        //Random circle
        /*{
            let sprite = this.game.add.sprite(G.RenderWidth / 2, G.RenderHeight / 2);
            this.physics.p2.enable(sprite, G.DebugRender);
            let body = <Phaser.Physics.P2.Body>sprite.body;
            body.clearShapes();
            body.addCircle(30);
            body.damping = 0.6;
        }*/
        this.nameText = [
            this.add.text(80, 80 - 50, G.Names[0], {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(G.RenderWidth - 80, 80 - 50, G.Names[1], {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(G.RenderWidth - 80, G.RenderHeight - 80, G.Names[2], {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(80, G.RenderHeight - 80, G.Names[3], {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            })
        ];
        this.nameText.forEach(function (s) { return s.anchor.set(0.5); });
        this.scoreText = [
            this.add.text(80, 80, "" + G.InitialLives, {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(G.RenderWidth - 80, 80, "" + G.InitialLives, {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(G.RenderWidth - 80, G.RenderHeight - 80 + 50, "" + G.InitialLives, {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            }),
            this.add.text(80, G.RenderHeight - 80 + 50, "" + G.InitialLives, {
                fontSize: 60,
                font: G.FontName,
                fill: '#000000'
            })
        ];
        this.scoreText.forEach(function (s) { return s.anchor.set(0.5); });
        this.physics.p2.onBeginContact.removeAll();
        this.physics.p2.onBeginContact.add(function (a, b, c, d, e) {
            if (_this.losingPlayer === null) {
                //Arrow returning
                if (b.isArrow) {
                    var tmp = a;
                    a = b;
                    b = tmp;
                }
                if (a.isArrow) {
                    a.player.allowArrowCollection();
                    if (b.isPlayer && a.player == b.player) {
                        a.player.returnArrow();
                        return;
                    }
                    if (!b.isWeapon && !b.isPlayer && !b.isChain) {
                        _this.game.add.audio(_this.bowHits[_this.bowHitIndex]).play(undefined, undefined, 0.5);
                        _this.bowHitIndex = (_this.bowHitIndex + 1) % _this.bowHits.length;
                    }
                }
                if (a.isWeapon && b.isWeapon && e[0].firstImpact) {
                    var ec = _this.getCollisionCenter(e);
                    _this.sparkEmitter.x = ec.x;
                    _this.sparkEmitter.y = ec.y;
                    _this.sparkEmitter.start(true, 400, null, 10);
                    _this.game.add.audio(_this.weaponClashes[_this.weaponClashIndex]).play();
                    _this.weaponClashIndex = (_this.weaponClashIndex + 1) % _this.weaponClashes.length;
                }
                var force = 0;
                var p = null;
                var weaponBody = void 0;
                if (a.isPlayer && b.isWeapon && e[0].firstImpact) {
                    force = e[0].getVelocityAlongNormal();
                    p = a.player;
                    weaponBody = b;
                }
                if (b.isPlayer && a.isWeapon && e[0].firstImpact) {
                    force = e[0].getVelocityAlongNormal();
                    p = b.player;
                    weaponBody = a;
                }
                //Deal less damage to yourself
                if (p && weaponBody && p == weaponBody.player) {
                    force *= 0.2;
                }
                force = Math.round(Math.abs(force * ImpactDamageMultiplier));
                if (p && force > 0) {
                    if (weaponBody.isArrow && weaponBody.player == p) {
                        p.returnArrow();
                    }
                    else {
                        var damagingSelf = p == weaponBody.player;
                        //Don't let players kill themselves
                        if ((!damagingSelf || p.health > force) && p.health > 0) {
                            p.takeDamage(force);
                            _this.drawSplatter(force, a, b, e, p.health == 0);
                            //check players for death or something
                            if (p.health <= 0) {
                                var killerIndex = _this.players.indexOf(weaponBody.player);
                                var deadIndex_1 = _this.players.indexOf(p);
                                remainingLives[deadIndex_1]--;
                                _this.updateLivesText(deadIndex_1);
                                var text_1 = _this.add.text(1920 / 2, 80, G.Names[killerIndex] + " killed " + G.Names[deadIndex_1], {
                                    fontSize: 60,
                                    font: G.FontName,
                                    fill: '#000000'
                                });
                                text_1.anchor.set(0.5);
                                _this.add.tween(text_1)
                                    .to({}, player_1.TimeToDie * 1.5, undefined, true)
                                    .onComplete.add(function () {
                                    text_1.destroy();
                                    _this.replacePlayer(deadIndex_1);
                                });
                                _this.game.add.audio(_this.taunts[_this.tauntsIndex]).play();
                                _this.tauntsIndex = (_this.tauntsIndex + 1) % _this.taunts.length;
                            }
                            else {
                                _this.game.add.audio(_this.playerHits[_this.playerHitIndex]).play();
                                _this.playerHitIndex = (_this.playerHitIndex + 1) % _this.playerHits.length;
                            }
                        }
                    }
                }
            }
        });
        for (var i = 0; i < 20; i++) {
            //Underneath Blood
            var x = Math.random() * G.RenderWidth;
            var y = Math.random() * G.RenderHeight;
            var sprite = this.add.sprite(x, y, 'blood_sheet', (Math.floor(Math.random() * 4)), this.underBloodGroup);
            sprite.anchor.set(0.5);
            //Angle based on hit angle
            var angle = Math.random() * 4;
            sprite.rotation = angle;
            var r = ((128 + Math.random() * 70) | 0) * 0x10000;
            sprite.tint = r | r >> 8 | r >> 16;
            sprite.scale.set(0.2 + Math.random());
            sprite.alpha = 0.4;
        }
    };
    GameState.prototype.replacePlayer = function (index) {
        if (remainingLives[index] <= 0) {
            //TODO: Gravestone
            var x_1 = this.players[index].body.x;
            var y_1 = this.players[index].body.y;
            this.players[index].destroy();
            this.players[index] = null;
            var sprite = this.game.add.sprite(x_1, y_1, 'grave', undefined, this.backgroundGroup);
            this.physics.p2.enable(sprite, G.DebugRender);
            var body = sprite.body;
            body.clearShapes();
            body.addCircle(30);
            body.damping = 0.99;
            body.fixedRotation = true;
            sprite.anchor.set(0.5, 0.8);
            var aliveAmount = remainingLives.filter(function (a) { return a > 0; }).length;
            if (aliveAmount == 0) {
                var text = this.game.add.text(G.RenderWidth / 2, G.RenderHeight / 2, "it's a draw!", {
                    font: G.FontName,
                    fontSize: 100,
                    fill: '#000000'
                });
                text.anchor.set(0.5);
            }
            else if (aliveAmount == 1) {
                var winnerIndex = remainingLives.findIndex(function (a) { return a > 0; });
                var text = this.game.add.text(G.RenderWidth / 2, G.RenderHeight / 2, G.Names[winnerIndex] + " wins!", {
                    font: G.FontName,
                    fontSize: 100,
                    fill: '#000000'
                });
                text.anchor.set(0.5);
                this.add.audio('victory').play();
            }
            return;
        }
        var x = this.players[index].body.x;
        var y = this.players[index].body.y;
        var oldWeaponType = this.players[index].weaponType;
        this.players[index].destroy();
        //Random weapon type that isn't the one we had before
        var weaponType = this.playerWeapons[index][remainingLives[index] - 1];
        this.players[index] = new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.players[index].pad, x, y, weaponType);
    };
    GameState.prototype.update = function () {
        this.players.forEach(function (p) { if (p) {
            p.update();
        } });
    };
    GameState.prototype.preRender = function () {
        this.players.forEach(function (p) { if (p) {
            p.preRender();
        } });
    };
    GameState.prototype.drawSplatter = function (force, a, b, e, died) {
        var _this = this;
        var ec = this.getCollisionCenter(e);
        var targetScale = (10 + force) / 32;
        var bloodTime = 300;
        var spread = 10 + force * 2;
        var amount = Math.min(10, 3 + force);
        var _loop_1 = function (i) {
            var xMod = (Math.random() * spread - spread / 2);
            var yMod = (Math.random() * spread - spread / 2);
            var x_2 = ec.x + xMod;
            var y_2 = ec.y + yMod;
            //On top blood
            var sprite_1 = this_1.add.sprite(ec.x, ec.y, 'blood_p', undefined, this_1.overBloodGroup);
            sprite_1.anchor.set(0.5);
            var r_1 = ((128 + Math.random() * 70) | 0) * 0x10000;
            sprite_1.tint = r_1;
            sprite_1.scale.set(0.3);
            this_1.game.add.tween(sprite_1.scale)
                .to({ x: targetScale, y: targetScale }, bloodTime, Phaser.Easing.power2, true);
            sprite_1.alpha = 0.9;
            this_1.game.add.tween(sprite_1)
                .to({ alpha: 0 }, bloodTime, Phaser.Easing.Cubic.Out, true);
            this_1.game.add.tween(sprite_1)
                .to({ x: ec.x + xMod * 3, y: ec.y + yMod * 3 }, bloodTime, Phaser.Easing.Cubic.In, true)
                .onComplete.add(function () {
                sprite_1.destroy();
                if (_this.underBloodGroup.children.length > 500) {
                    //console.log("CACHING THE THING TO DO IT FAST");
                    _this.underBloodGroup.cacheAsBitmap = true;
                    _this.underBloodGroup = _this.game.add.group(_this.underBloodGroupForLotsOfBlood);
                }
            });
        };
        var this_1 = this;
        for (var i = 0; i < amount; i++) {
            _loop_1(i);
        }
        //Underneath Blood
        var x = ec.x;
        var y = ec.y;
        var sprite = this.add.sprite(x, y, 'blood_sheet', (Math.floor(Math.random() * 4)), this.underBloodGroup);
        sprite.anchor.set(0.5);
        //Angle based on hit angle
        var anglePoint = new Phaser.Point(a.position[0], a.position[1]);
        var angle = anglePoint.angle(new Phaser.Point(b.position[0], b.position[1]));
        angle -= Math.PI / 2;
        //One of these is the weapon and one the player, reverse then
        if (a.isPlayer) {
            angle = angle + Math.PI;
        }
        sprite.rotation = angle;
        var scaleScale = 4;
        targetScale = (0.3 + (3 * force / 100)) / scaleScale;
        var bloodTime2 = 200;
        var r = ((128 + Math.random() * 70) | 0) * 0x10000;
        sprite.tint = r;
        sprite.scale.set(0.3 / scaleScale);
        this.game.add.tween(sprite.scale)
            .to({ x: targetScale, y: targetScale }, bloodTime2, Phaser.Easing.Cubic.In, true);
        sprite.alpha = 0.1;
        this.game.add.tween(sprite)
            .to({ alpha: Math.random() * 0.1 + 0.9 }, bloodTime2, Phaser.Easing.power2, true);
        //this.splatter.cacheAsBitmap = true;
        //this.underBloodGroup.cacheAsBitmap = true;
    };
    GameState.prototype.getCollisionCenter = function (e) {
        //http://www.html5gamedevs.com/topic/26125-p2-physics-contact-point-between-2-bodies/
        var pos = e[0].bodyA.position;
        var pt = e[0].contactPointA;
        var x = this.game.physics.p2.mpxi(pos[0] + pt[0]);
        var y = this.game.physics.p2.mpxi(pos[1] + pt[1]);
        return { x: x, y: y };
    };
    GameState.prototype.updateLivesText = function (index) {
        this.scoreText[index].text = "" + remainingLives[index];
    };
    return GameState;
}(Phaser.State));
exports.default = GameState;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function Shuffle(arr) {
    var collection = arr, len = arr.length, rng = Math.random, random, temp;
    while (len) {
        random = Math.floor(rng() * len);
        len -= 1;
        temp = collection[len];
        collection[len] = collection[random];
        collection[random] = temp;
    }
}
exports.Shuffle = Shuffle;
;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

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
var Phaser = __webpack_require__(0);
var WebFont = __webpack_require__(16);
var LoadingState = /** @class */ (function (_super) {
    __extends(LoadingState, _super);
    function LoadingState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.loaded = 0;
        return _this;
    }
    LoadingState.prototype.init = function () {
        this.game.stage.backgroundColor = '#eeeeee';
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.stage.disableVisibilityChange = true;
    };
    LoadingState.prototype.preload = function () {
        var _this = this;
        WebFont.load({
            google: {
                families: ['Bangers']
            },
            custom: {
                families: ['SF Cartoonist Hand']
            },
            active: function () { return _this.create(undefined, 'font'); }
        });
        this.load.image('mushroom2', __webpack_require__(17));
        this.load.image('arrow', __webpack_require__(18));
        this.load.image('axe', __webpack_require__(19));
        this.load.image('bow', __webpack_require__(20));
        this.load.image('chain', __webpack_require__(21));
        this.load.image('mace', __webpack_require__(22));
        this.load.image('arrow_border', __webpack_require__(23));
        this.load.image('axe_border', __webpack_require__(24));
        this.load.image('bow_border', __webpack_require__(25));
        this.load.image('chain_border', __webpack_require__(26));
        this.load.image('mace_border', __webpack_require__(27));
        this.load.image('splash', __webpack_require__(28));
        this.load.image('NE', __webpack_require__(29));
        this.load.image('SE', __webpack_require__(30));
        this.load.image('NW', __webpack_require__(31));
        this.load.image('SW', __webpack_require__(32));
        this.load.image('NE_border', __webpack_require__(33));
        this.load.image('SE_border', __webpack_require__(34));
        this.load.image('NW_border', __webpack_require__(35));
        this.load.image('SW_border', __webpack_require__(36));
        this.load.image('particle_1', __webpack_require__(37));
        this.load.image('blood_p', __webpack_require__(38));
        this.load.image('ah_shit', __webpack_require__(39));
        this.load.image('grave', __webpack_require__(40));
        this.load.image('shadow', __webpack_require__(41));
        this.load.audio('taunt_1', __webpack_require__(42));
        this.load.audio('taunt_2', __webpack_require__(43));
        this.load.audio('taunt_3', __webpack_require__(44));
        this.load.audio('taunt_4', __webpack_require__(45));
        this.load.audio('taunt_5', __webpack_require__(46));
        this.load.audio('taunt_6', __webpack_require__(47));
        this.load.audio('victory', __webpack_require__(48));
        this.load.audio('steel_hit_1', __webpack_require__(49));
        this.load.audio('steel_hit_2', __webpack_require__(50));
        this.load.audio('steel_hit_3', __webpack_require__(51));
        this.load.audio('steel_hit_4', __webpack_require__(52));
        this.load.audio('steel_hit_5', __webpack_require__(53));
        this.load.audio('bow_fire', __webpack_require__(54));
        this.load.audio('bow_hit_1', __webpack_require__(55));
        this.load.audio('bow_hit_2', __webpack_require__(56));
        this.load.audio('bow_hit_3', __webpack_require__(57));
        this.load.audio('bow_hit_4', __webpack_require__(58));
        this.load.audio('bow_hit_5', __webpack_require__(59));
        this.load.audio('bow_hit_6', __webpack_require__(60));
        this.load.audio('bow_hit_7', __webpack_require__(61));
        this.load.audio('bow_hit_8', __webpack_require__(62));
        this.load.audio('player_hit_1', __webpack_require__(63));
        this.load.audio('player_hit_2', __webpack_require__(64));
        this.load.audio('player_hit_3', __webpack_require__(65));
        this.load.audio('player_hit_4', __webpack_require__(66));
        this.load.audio('player_hit_5', __webpack_require__(67));
        this.load.audio('player_hit_6', __webpack_require__(68));
        this.load.audio('player_hit_7', __webpack_require__(69));
        /*
                this.load.image('blood_1', require('./assets/images/blood/blood1.png'));
                this.load.image('blood_2', require('./assets/images/blood/blood2.png'));
                this.load.image('blood_3', require('./assets/images/blood/blood3.png'));
                this.load.image('blood_4', require('./assets/images/blood/blood4.png'));
        */
        this.load.spritesheet('blood_sheet', __webpack_require__(70), 2048, 2048);
        var text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', {
            font: '16px Arial',
            fill: '#000000',
            align: 'center'
        });
        text.anchor.setTo(0.5, 0.5);
        this.input.gamepad.start();
    };
    LoadingState.prototype.create = function (game, label) {
        console.log('create', label);
        this.loaded++;
        if (this.loaded >= 2) {
            this.state.start('splashscreen');
            //this.state.start('game');
        }
    };
    return LoadingState;
}(Phaser.State));
exports.default = LoadingState;


/***/ }),
/* 16 */,
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "bfd7f2fb9488329e9f3e8ca1993118ca.png";

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "1a593edb9a7c38d5175e9cfd8379f715.svg";

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4e5695f307f17c095365ab075565ef66.svg";

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fa2f9d5c76dfee1386b3f04559875fba.svg";

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e200c14baac583e70b1a33a322b2514e.svg";

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "77c08e1b0b11080e70410e957194b127.svg";

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "a4a81c7768bdf66ff75c5f07b3cddbca.svg";

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "b94d93b23ef61e3dfbd6199669c1b41a.svg";

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "31beaea177b7bc41661650841faa22cf.svg";

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "0aa20f247e3977bc436ea9711805f730.svg";

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "ddf536d718d62487c2957d7ee53a7770.svg";

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "55bfe8061dd16267644529a6bcc780e3.png";

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "12674d480f315f2c4a7c626fe58edb87.svg";

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e61553ea50189488bb539afde0d56c4a.svg";

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "553d4bc3d37349dbb46fb6f032bddb32.svg";

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "9ef35883fe1a1a378705ccf45d04c3f4.svg";

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "8fce4a7d63988ca5dc5b64ff9b07d9e4.svg";

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "bfc5009ca5f6b4d56c61d6255bd8dd00.svg";

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "6bc789c00648f8c71a1058a99532fe82.svg";

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "0e190270e0767f2f325902035eae70d5.svg";

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "6f7ed9b2fc19e92499c2f755414b9a5d.svg";

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "ecdeb219e01786ca14a947d75247824b.png";

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "899613481e66bfef3b557655a3018b3b.svg";

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "3688469bf7e908c5fc39aed6f27f16f0.svg";

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "9b6bef54dcd11e501f27f1b1d340719c.svg";

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "682a3db089101536549190191cfd2682.opus";

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "c73cd6e775fe6ab7cf7e3c1ac80ef325.opus";

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "1692de8d09a590174fd5baba753c2781.opus";

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "fa9f63f6ea44112bed40365bddeaab96.opus";

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "9cf6e1ba45ac56b4a92d375984ea594b.opus";

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "aca0a2f4e775a94dd3ffdc33cc122fcb.opus";

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "4c39e532c245ec83df64459517186c71.opus";

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "33697e61a8727d50246a0b7b70c1867f.opus";

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "b75331a138a1c456abdb3be734e92bbd.opus";

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "3e2fba97a942619d4c7c05270a274ac0.opus";

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "ff26259c8e3b0aa1f4770e93d514fa44.opus";

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "5af4da6ec5b9900a0f11777627c873ec.opus";

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "bcdcab5c298659b2cf1c0ab6451ffdd1.opus";

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "3dfe323fbd7722a45fd8ad2330c58e7f.opus";

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "8fd02cb2b4f91d8265217d7510358d1c.opus";

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "850e30137665c22ef048c8829693076b.opus";

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "5a5314c02f4500dbd5df10ea7db73b44.opus";

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "d56ad7de357c64ffde452a3bd72f2b71.opus";

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "f5310ec5302287f3248a95e6edcdb2c2.opus";

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "7a809ba50a9da7a4cc9ece42e0735133.opus";

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "a6ae9cc96d9bb8e2eceb161ceb9af1cf.opus";

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "d9dfa0fe96ed21bfd6cabdfc3586f572.opus";

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "b9b8283688120469e73ab59f01af3f6f.opus";

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "8c5dc1f8c991aac569d50af0a643988f.opus";

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "ece60a5ce91bb7a1cbcc87489091d636.opus";

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e656f143067eb85ea1ed997593d7054d.opus";

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "40e757d1e7396033a5a7d6d2f91e02e7.opus";

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "e46160e6be6c59a50caf8c6be4b3ae8e.opus";

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "d2484b9c20ddc85de18961945a436aa1.png";

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

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
var Phaser = __webpack_require__(0);
var G = __webpack_require__(1);
var player_1 = __webpack_require__(4);
var weaponType_1 = __webpack_require__(3);
var SplashScreenState = /** @class */ (function (_super) {
    __extends(SplashScreenState, _super);
    function SplashScreenState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SplashScreenState.prototype.create = function () {
        this.physics.startSystem(Phaser.Physics.P2JS);
        for (var i = 0; i < 20; i++) {
            //Underneath Blood
            var x = Math.random() * G.RenderWidth;
            var y = Math.random() * G.RenderHeight;
            var sprite_1 = this.add.sprite(x, y, 'blood_sheet', (Math.floor(Math.random() * 4)));
            sprite_1.anchor.set(0.5);
            //Angle based on hit angle
            var angle = Math.random() * 4;
            sprite_1.rotation = angle;
            var r = ((128 + Math.random() * 70) | 0) * 0x10000;
            sprite_1.tint = r | r >> 8 | r >> 16;
            sprite_1.scale.set(0.2 + Math.random());
            sprite_1.alpha = 0.4;
        }
        this.backgroundGroup = this.add.group();
        this.middleGroup = this.add.group();
        //Make sure this is in gpu by showing it somewhere
        var sprite = this.add.sprite(G.RenderWidth, G.RenderHeight, 'blood_sheet', 1);
        /*
                let titleText = this.add.text(this.world.centerX, 60, 'Blunt Force Transmission', {
                    font: '120px ' + G.FontName,
                    fill: '#000000',
                    align: 'center'
                });*/
        //titleText.anchor.set(0.5, 0.5);
        this.padsText = this.add.text(this.world.centerX, this.world.height - 120, 'TODO', {
            font: '60px ' + G.FontName,
            fill: '#000000',
            align: 'center'
        });
        this.padsText.anchor.setTo(0.5, 0.5);
        this.startToPlay = this.add.text(this.world.centerX, this.world.height - 60, 'Press Start to Play', {
            font: '60px ' + G.FontName,
            fill: '#000000',
            align: 'center'
        });
        this.startToPlay.anchor.setTo(0.5, 0.5);
        this.add.text(400, 500, "Axe / Mace", {
            font: '70px ' + G.FontName,
            fill: '#000000',
        });
        this.add.text(400, 580, "Spin with Left Stick", {
            font: '60px ' + G.FontName,
            fill: '#000000',
        });
        this.add.text(400, 640, "(A) Spin harder", {
            font: '60px ' + G.FontName,
            fill: '#000000',
        });
        var rightText = 1100;
        this.add.text(rightText, 500 - 40, "Bow", {
            font: '70px ' + G.FontName,
            fill: '#000000',
        });
        this.add.text(rightText, 580 - 40, "Move with Left Stick", {
            font: '60px ' + G.FontName,
            fill: '#000000',
        });
        this.add.text(rightText, 640 - 40, "Aim with Right Stick", {
            font: '60px ' + G.FontName,
            fill: '#000000',
        });
        this.add.text(rightText, 700 - 40, "(L/R) Fire", {
            font: '60px ' + G.FontName,
            fill: '#000000',
        });
        var goal = this.add.text(G.RenderWidth / 2, 800, "You have 6 lives. Last Player alive wins", {
            font: '80px ' + G.FontName,
            fill: '#000000',
            align: 'center'
        });
        goal.anchor.set(0.5);
        this.players = [
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad1, 100, 100, weaponType_1.WeaponType.Chain, true),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad2, G.RenderWidth - 100, 100, weaponType_1.WeaponType.Chain, true),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad3, G.RenderWidth - 200, 900, weaponType_1.WeaponType.Sword, true),
            new player_1.Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad4, 200, 900, weaponType_1.WeaponType.Sword, true),
        ];
        this.add.sprite(0, 0, 'splash');
    };
    SplashScreenState.prototype.update = function () {
        this.padsText.text = this.input.gamepad.padsConnected + ' Pads Connected';
        if (!this.input.gamepad.enabled || !this.input.gamepad.active) {
            this.padsText.text += '. Press a button to enable maybe';
        }
        this.startToPlay.visible = (this.input.gamepad.padsConnected >= 2);
        if (this.startToPlay.visible) {
            if (this.input.gamepad.pad1.isDown(9) || this.input.gamepad.pad2.isDown(9) || this.input.gamepad.pad3.isDown(9) || this.input.gamepad.pad4.isDown(9)) {
                this.state.start('game');
            }
        }
        this.players.forEach(function (p) { if (p) {
            p.update();
        } });
    };
    SplashScreenState.prototype.preRender = function () {
        this.players.forEach(function (p) { if (p) {
            p.preRender();
        } });
    };
    return SplashScreenState;
}(Phaser.State));
exports.default = SplashScreenState;


/***/ })
],[5]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9nbG9iYWxzLnRzIiwid2VicGFjazovLy8uL3dlYXBvblR5cGUudHMiLCJ3ZWJwYWNrOi8vLy4vcGxheWVyLnRzIiwid2VicGFjazovLy8uL2luZGV4LnRzIiwid2VicGFjazovLy8uL2Nzcy9yZXNldC5jc3MiLCJ3ZWJwYWNrOi8vLy4vZ2FtZVN0YXRlLnRzIiwid2VicGFjazovLy8uL3NodWZmbGUudHMiLCJ3ZWJwYWNrOi8vLy4vbG9hZGluZ1N0YXRlLnRzIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvbXVzaHJvb20yLnBuZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2Fycm93LnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2F4ZS5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9ib3cuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhaW4uc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvbWFjZS5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9hcnJvd19ib3JkZXIuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvYXhlX2JvcmRlci5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9ib3dfYm9yZGVyLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2NoYWluX2JvcmRlci5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9tYWNlX2JvcmRlci5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9zcGxhc2gucG5nIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05FLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9TRS5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvTlcuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL1NXLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9ORV9ib3JkZXIuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL1NFX2JvcmRlci5zdmciLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvTldfYm9yZGVyLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9TV19ib3JkZXIuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvc3BhcmtzLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2Jsb29kXzIucG5nIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL2FoX3NoaXQuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL2dyYXZlLnN2ZyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9zaGFkb3cuc3ZnIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvdGF1bnRzL2Ntb25feWFfcGFuc3kub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3RhdW50cy9pbV9pbnZpbmNpYmxlLm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy90YXVudHMvanVzdF9hX2ZsZXNoX3dvdW5kLm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy90YXVudHMvcmlnaHRfaWxsX2RvX3lhX2Zvcl90aGF0Lm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy90YXVudHMvdGlzX2J1dF9hX3NjcmF0Y2gub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3RhdW50cy93ZWxsX2NhbGxfaXRfYV9kcmF3Lm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy92aWN0b3J5X2lzX21pbmUub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gc21hbGwga25vY2sub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gU3dvcmRzbWFsbC5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvc3RlZWxfaGl0L1NvY2FwZXggLSBTd29yZHNtYWxsXzEub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gU3dvcmRzbWFsbF8yLm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGxfMy5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvYm93L2Jvd19maXJlLm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwMS5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDIub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDAzLm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwNC5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDUub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDA2Lm9wdXMiLCJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwNy5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDgub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIGh1cnQub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIE1vbnN0ZXJfSHVydC5vcHVzIiwid2VicGFjazovLy8uL2Fzc2V0cy9zb3VuZHMvcGxheWVyX2hpdC9Tb2NhcGV4IC0gbmV3X2hpdHMub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzXzIub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzXzUub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzXzgub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzXzkub3B1cyIsIndlYnBhY2s6Ly8vLi9hc3NldHMvaW1hZ2VzL2Jsb29kL2Jsb29kX3Nwcml0ZXNoZWV0LnBuZyIsIndlYnBhY2s6Ly8vLi9zcGxhc2hTY3JlZW5TdGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFhLG1CQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ25CLG9CQUFZLEdBQUcsSUFBSSxDQUFDO0FBRXBCLG1CQUFXLEdBQUcsS0FBSyxDQUFDO0FBRXBCLGdCQUFRLEdBQUcsb0JBQW9CLENBQUM7QUFFaEMsYUFBSyxHQUFHO0lBQ3BCLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7Q0FDTCxDQUFDO0FBRVcsb0JBQVksR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0FDZDlCLElBQVksVUFRWDtBQVJELFdBQVksVUFBVTtJQUNyQiw2Q0FBSztJQUNMLDZDQUFLO0lBQ0wsNkNBQUs7SUFJTCw2Q0FBSztBQUNOLENBQUMsRUFSVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQVFyQjs7Ozs7Ozs7OztBQ1JELG9DQUFvQztBQUNwQyx1Q0FBd0M7QUFDeEMsK0JBQStCO0FBQy9CLDBDQUEwQztBQUU3QiwyQkFBbUIsR0FBRyxDQUFDLENBQUM7QUFDeEIscUNBQTZCLEdBQUcsRUFBRSxDQUFDO0FBRW5DLGlCQUFTLEdBQUcsR0FBRyxD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QUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUUzQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztRQUcxQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3pGLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUU3QixJQUFJLENBQUMsSUFBSSxHQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNyRCxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FB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SUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDO0lBRU8sMEJBQVMsR0FBakIsVUFBa0IsR0FBVztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENB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UUFFRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUErQixDQUFDLENBQUMsQ0FBQztRQUV2RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsbUJBQU8sQ0FBQyxFQUEyQixDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QixDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QixDQUFDLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsbUJBQU8sQ0FBQyxFQUEyQixDQUFDLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsbUJBQU8sQ0FBQyxFQUEwQixDQUFDLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsbUJBQU8sQ0FBQyxFQUFnQyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsbUJBQU8sQ0FBQyxFQUFnQyxDQUFDLENBQUMsQ0FBQztRQUN6RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUFpQyxDQUFDLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsbUJBQU8sQ0FBQyxFQUE0QixDQUFDLENBQUMsQ0FBQztRQUVqRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsbUJBQU8sQ0FBQyxFQUFrQyxDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QyxDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QyxDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QyxDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUF5QyxDQUFDLENBQUMsQ0FBQztRQUVqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsbUJBQU8sQ0FBQyxFQUE0QixDQUFDLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUE2QixDQUFDLENBQUMsQ0FBQztRQUVuRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUF1QyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUV6RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsbUJBQU8sQ0FBQyxFQUFzQyxDQUFDLENBQUMsQ0FBQztRQUczRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUEyQyxDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUEyQyxDQUFDLENBQUMsQ0FBQztRQUNqRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUFnRCxDQUFDLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUM1RixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUErQyxDQUFDLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUFpRCxDQUFDLENBQUMsQ0FBQztRQUV2RixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsbUJBQU8sQ0FBQyxFQUFzQyxDQUFDLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUNoRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUFxRCxDQUFDLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUF1RCxDQUFDLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUF1RCxDQUFDLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsbUJBQU8sQ0FBQyxFQUF1RCxDQUFDLENBQUMsQ0FBQztRQUVqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsbUJBQU8sQ0FBQyxFQUFtQyxDQUFDLENBQUMsQ0FBQztRQUUxRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUM3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsbUJBQU8sQ0FBQyxFQUFxQyxDQUFDLENBQUMsQ0FBQztRQUU3RSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFnRCxDQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUF3RCxDQUFDLENBQUMsQ0FBQztRQUNuRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFvRCxDQUFDLENBQUMsQ0FBQztRQUMvRixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUNqRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsbUJBQU8sQ0FBQyxFQUFzRCxDQUFDLENBQUMsQ0FBQztRQUduRzs7Ozs7VUFLRTtRQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxtQkFBTyxDQUFDLEVBQTZDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekcsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFO1lBQ2pGLElBQUksRUFBRSxZQUFZO1lBQ2xCLElBQUksRUFBRSxTQUFTO1lBQ2YsS0FBSyxFQUFFLFFBQVE7U0FDZixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUdELDZCQUFNLEdBQU4sVUFBTyxJQUFpQixFQUFFLEtBQWM7UUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNqQywyQkFBMkI7UUFDNUIsQ0FBQztJQUNGLENBQUM7SUFDRixtQkFBQztBQUFELENBQUMsQ0FwSHlDLE1BQU0sQ0FBQyxLQUFLLEdBb0hyRDs7Ozs7Ozs7O0FDekhELGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxnRjs7Ozs7O0FDQUEsZ0Y7Ozs7OztBQ0FBLGdGOzs7Ozs7QUNBQSxpRjs7Ozs7O0FDQUEsaUY7Ozs7OztBQ0FBLGlGOzs7Ozs7QUNBQSxpRjs7Ozs7O0FDQUEsaUY7Ozs7OztBQ0FBLGlGOzs7Ozs7QUNBQSxpRjs7Ozs7O0FDQUEsaUY7Ozs7OztBQ0FBLGlGOzs7Ozs7QUNBQSxpRjs7Ozs7O0FDQUEsaUY7Ozs7OztBQ0FBLGlGOzs7Ozs7QUNBQSxpRjs7Ozs7O0FDQUEsaUY7Ozs7OztBQ0FBLGlGOzs7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LENBL0g4QyxNQUFNLENBQUMsS0FBSyxHQStIMUQiLCJmaWxlIjoibWFpbi5idW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgUmVuZGVyV2lkdGggPSAxOTIwO1xyXG5leHBvcnQgY29uc3QgUmVuZGVySGVpZ2h0ID0gMTA4MDtcclxuXHJcbmV4cG9ydCBjb25zdCBEZWJ1Z1JlbmRlciA9IGZhbHNlO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvbnROYW1lID0gJ1NGIENhcnRvb25pc3QgSGFuZCc7XHJcblxyXG5leHBvcnQgY29uc3QgTmFtZXMgPSBbXHJcblx0J3JhdCcsXHJcblx0J21pcycsXHJcblx0J25vcycsXHJcblx0J3NpbicsXHJcbl07XHJcblxyXG5leHBvcnQgY29uc3QgSW5pdGlhbExpdmVzID0gNjtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9nbG9iYWxzLnRzIiwiZXhwb3J0IGVudW0gV2VhcG9uVHlwZSB7XHJcblx0Q2hhaW4sXHJcblx0QXJyb3csXHJcblx0U3dvcmQsXHJcblxyXG5cclxuXHJcblx0Q291bnRcclxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3dlYXBvblR5cGUudHMiLCJpbXBvcnQgKiBhcyBQaGFzZXIgZnJvbSAncGhhc2VyLWNlJztcclxuaW1wb3J0IHsgRGVidWdSZW5kZXIgfSBmcm9tICcuL2dsb2JhbHMnO1xyXG5pbXBvcnQgKiBhcyBHIGZyb20gJy4vZ2xvYmFscyc7XHJcbmltcG9ydCB7IFdlYXBvblR5cGUgfSBmcm9tICcuL3dlYXBvblR5cGUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1heFR1cmJvVGltZVNlY29uZHMgPSAzO1xyXG5leHBvcnQgY29uc3QgVHVyYm9SZWNoYXJnZVNlY29uZHNQZXJTZWNvbmQgPSAuNztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXhIZWFsdGggPSAxMDA7XHJcblxyXG5leHBvcnQgY29uc3QgVGltZVRvRGllID0gMTAwMDtcclxuXHJcbmNvbnN0IGJvZHlSYWRpdXMgPSAzMDtcclxuXHJcbmNvbnN0IGFycm93TGVuZ3RoID0gMTAwO1xyXG5jb25zdCBhcnJvd1dpZHRoID0gNDA7XHJcbmNvbnN0IGFycm93U3BlZWQgPSA4MDtcclxuXHJcbmNvbnN0IHN3b3JkTGVuZ3RoID0gMTIwO1xyXG5jb25zdCBzd29yZFdpZHRoID0gNDA7XHJcblxyXG5jb25zdCBzaGFkb3dPZmZzZXQgPSA0NDtcclxuXHJcbmNvbnN0IGRlYXRoQnViYmxlT2Zmc2V0ID0gLTEwMDtcclxuXHJcbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xyXG5cdGJvZHk6IFBoYXNlci5QaHlzaWNzLlAyLkJvZHk7XHJcblx0c3ByaXRlOiBQaGFzZXIuU3ByaXRlO1xyXG5cdHNoYWRvdzogUGhhc2VyLlNwcml0ZTtcclxuXHRkZWF0aEJ1YmJsZTogUGhhc2VyLlNwcml0ZTtcclxuXHJcblx0Y2hhaW5zID0gbmV3IEFycmF5PFBoYXNlci5TcHJpdGU+KCk7XHJcblx0bWFjZTogUGhhc2VyLlNwcml0ZTtcclxuXHRtYWNlQm9keTogUGhhc2VyLlBoeXNpY3MuUDIuQm9keTtcclxuXHJcblx0YXJyb3dGb3JBaW06IFBoYXNlci5TcHJpdGU7XHJcblx0YXJyb3c6IFBoYXNlci5TcHJpdGU7XHJcblxyXG5cdHN3b3JkOiBQaGFzZXIuU3ByaXRlO1xyXG5cclxuXHRzcHJpdGVCZzogUGhhc2VyLlNwcml0ZTtcclxuXHRhcnJvd0ZvckFpbUJnOiBQaGFzZXIuU3ByaXRlO1xyXG5cdGFycm93Qmc6IFBoYXNlci5TcHJpdGU7XHJcblx0c3dvcmRCZzogUGhhc2VyLlNwcml0ZTtcclxuXHRtYWNlQmc6IFBoYXNlci5TcHJpdGU7XHJcblx0Y2hhaW5CZ3MgPSBuZXcgQXJyYXk8UGhhc2VyLlNwcml0ZT4oKTtcclxuXHJcblx0dHVyYm9BbW91bnQgPSBNYXhUdXJib1RpbWVTZWNvbmRzO1xyXG5cdHR1cmJvQmFyOiBQaGFzZXIuR3JhcGhpY3M7XHJcblxyXG5cdGhlYWx0aCA9IE1heEhlYWx0aDtcclxuXHRoZWFsdGhCYXI6IFBoYXNlci5HcmFwaGljcztcclxuXHJcblx0YWxsVGhpbmdzVG9EZXN0cm95ID0gbmV3IEFycmF5PHsgZGVzdHJveTogRnVuY3Rpb24gfT4oKTtcclxuXHRjb25zdHJhaW50cyA9IG5ldyBBcnJheTxhbnk+KCk7XHJcblxyXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgZ2FtZTogUGhhc2VyLkdhbWUsIHByaXZhdGUgYmFja2dyb3VuZEdyb3VwOiBQaGFzZXIuR3JvdXAsIHByaXZhdGUgbWlkZGxlR3JvdXA6IFBoYXNlci5Hcm91cCwgcHVibGljIHBhZDogUGhhc2VyLlNpbmdsZVBhZCwgcHVibGljIHN0YXJ0WDogbnVtYmVyLCBwdWJsaWMgc3RhcnRZOiBudW1iZXIsIHB1YmxpYyB3ZWFwb25UeXBlOiBXZWFwb25UeXBlLCBoaWRlQmFycz86IGJvb2xlYW4pIHtcclxuXHRcdHBhZC5kZWFkWm9uZSA9IDA7XHJcblxyXG5cdFx0dGhpcy5jcmVhdGVCb2R5KHN0YXJ0WCwgc3RhcnRZKTtcclxuXHJcblx0XHRzd2l0Y2ggKHdlYXBvblR5cGUpIHtcclxuXHRcdFx0Y2FzZSBXZWFwb25UeXBlLkNoYWluOlxyXG5cdFx0XHRcdHRoaXMuY3JlYXRlQ2hhaW4oKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBXZWFwb25UeXBlLkFycm93OlxyXG5cdFx0XHRcdHRoaXMuY3JlYXRlQXJyb3dBaW0oKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBXZWFwb25UeXBlLlN3b3JkOlxyXG5cdFx0XHRcdHRoaXMuY3JlYXRlU3dvcmQoKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnR1cmJvQmFyID0gdGhpcy5nYW1lLmFkZC5ncmFwaGljcyh0aGlzLnNwcml0ZS54LCB0aGlzLnNwcml0ZS55IC0gNDAsIG1pZGRsZUdyb3VwKTtcclxuXHRcdHRoaXMuaGVhbHRoQmFyID0gdGhpcy5nYW1lLmFkZC5ncmFwaGljcyh0aGlzLnNwcml0ZS54LCB0aGlzLnNwcml0ZS55IC0gNDAsIG1pZGRsZUdyb3VwKTtcclxuXHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LnB1c2godGhpcy50dXJib0Jhcik7XHJcblx0XHR0aGlzLmFsbFRoaW5nc1RvRGVzdHJveS5wdXNoKHRoaXMuaGVhbHRoQmFyKTtcclxuXHJcblx0XHRpZiAodGhpcy53ZWFwb25UeXBlID09IFdlYXBvblR5cGUuQXJyb3cgfHwgaGlkZUJhcnMpIHtcclxuXHRcdFx0dGhpcy50dXJib0Jhci52aXNpYmxlID0gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRpZiAoaGlkZUJhcnMpIHtcclxuXHRcdFx0dGhpcy5oZWFsdGhCYXIudmlzaWJsZSA9IGZhbHNlO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZGVzdHJveSgpIHtcclxuXHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LmZvckVhY2godCA9PiB0LmRlc3Ryb3koKSk7XHJcblxyXG5cdFx0dGhpcy5jb25zdHJhaW50cy5mb3JFYWNoKGMgPT4gdGhpcy5nYW1lLnBoeXNpY3MucDIucmVtb3ZlQ29uc3RyYWludChjKSk7XHJcblxyXG5cdFx0aWYgKHRoaXMuYXJyb3cgIT0gbnVsbCkge1xyXG5cdFx0XHR0aGlzLmFycm93LmRlc3Ryb3koKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmFycm93QmcpIHsgdGhpcy5hcnJvd0JnLmRlc3Ryb3koKSB9XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNyZWF0ZUJvZHkoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuXHRcdHRoaXMuc3ByaXRlID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUoeCwgeSwgJ05FJywgdW5kZWZpbmVkLCB0aGlzLm1pZGRsZUdyb3VwKTtcclxuXHRcdHRoaXMuc3ByaXRlLnNjYWxlLnNldCgwLjUpXHJcblx0XHR0aGlzLmFsbFRoaW5nc1RvRGVzdHJveS5wdXNoKHRoaXMuc3ByaXRlKTtcclxuXHRcdHRoaXMuZ2FtZS5waHlzaWNzLnAyLmVuYWJsZSh0aGlzLnNwcml0ZSwgRGVidWdSZW5kZXIpO1xyXG5cdFx0dGhpcy5zcHJpdGUuYW5jaG9yLnkgPSAwLjQ7XHJcblxyXG5cdFx0dGhpcy5zaGFkb3cgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh4LCB5ICsgc2hhZG93T2Zmc2V0LCAnc2hhZG93JywgdW5kZWZpbmVkLCB0aGlzLmJhY2tncm91bmRHcm91cCk7XHJcblx0XHR0aGlzLmFsbFRoaW5nc1RvRGVzdHJveS5wdXNoKHRoaXMuc2hhZG93KTtcclxuXHRcdHRoaXMuc2hhZG93LmFuY2hvci5zZXQoMC41KTtcclxuXHRcdHRoaXMuc2hhZG93LnNjYWxlLnNldCgwLjQpXHJcblxyXG5cclxuXHRcdHRoaXMuc3ByaXRlQmcgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh4LCB5LCAnTkVfYm9yZGVyJywgdW5kZWZpbmVkLCB0aGlzLmJhY2tncm91bmRHcm91cCk7XHJcblx0XHR0aGlzLnNwcml0ZUJnLnNjYWxlLnNldCgwLjUpO1xyXG5cdFx0dGhpcy5zcHJpdGVCZy5hbmNob3Iuc2V0KDAuNSk7XHJcblx0XHR0aGlzLmFsbFRoaW5nc1RvRGVzdHJveS5wdXNoKHRoaXMuc3ByaXRlQmcpO1xyXG5cdFx0dGhpcy5zcHJpdGVCZy5hbmNob3IueSA9IDAuNDtcclxuXHJcblx0XHR0aGlzLmJvZHkgPSA8UGhhc2VyLlBoeXNpY3MuUDIuQm9keT50aGlzLnNwcml0ZS5ib2R5O1xyXG5cdFx0dGhpcy5ib2R5LmNsZWFyU2hhcGVzKCk7XHJcblx0XHR0aGlzLmJvZHkuYWRkQ2lyY2xlKGJvZHlSYWRpdXMpO1xyXG5cclxuXHRcdHRoaXMuYm9keS5maXhlZFJvdGF0aW9uID0gdHJ1ZTtcclxuXHRcdHRoaXMuYm9keS5hbmd1bGFyRGFtcGluZyA9IDE7XHJcblx0XHR0aGlzLmJvZHkuZGFtcGluZyA9IC45OTk7XHJcblx0XHR0aGlzLmJvZHkuY29sbGlkZVdvcmxkQm91bmRzID0gdHJ1ZTtcclxuXHJcblx0XHR0aGlzLmJvZHlNYXNzID0gdGhpcy5ib2R5Lm1hc3M7XHJcblxyXG5cdFx0KDxhbnk+dGhpcy5ib2R5LmRhdGEpLnBsYXllciA9IHRoaXM7XHJcblx0XHQoPGFueT50aGlzLmJvZHkuZGF0YSkuaXNQbGF5ZXIgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjcmVhdGVDaGFpbigpIHtcclxuXHJcblx0XHQvL0FkZCB0aGUgY2hhaW5cclxuXHRcdGNvbnN0IG1hY2VSYWRpdXMgPSAyMDtcclxuXHJcblx0XHRjb25zdCBjaGFpblJhZGl1cyA9IDEwO1xyXG5cdFx0Y29uc3QgY2hhaW5MZW5ndGggPSAxMDsvLzUtMTBcclxuXHJcblx0XHRsZXQgbGFzdEJvZHkgPSB0aGlzLmJvZHk7XHJcblx0XHRsZXQgbGFzdEJvZHlTaXplID0gYm9keVJhZGl1cztcclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY2hhaW5MZW5ndGg7IGkrKykge1xyXG5cdFx0XHRsZXQgY2hhaW5MaW5rID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUobGFzdEJvZHkueCwgbGFzdEJvZHkueSArIGxhc3RCb2R5U2l6ZSArIGNoYWluUmFkaXVzLCAnY2hhaW4nLCB1bmRlZmluZWQsIHRoaXMubWlkZGxlR3JvdXApO1xyXG5cdFx0XHRjaGFpbkxpbmsuc2NhbGUuc2V0KDAuMTUpO1xyXG5cdFx0XHR0aGlzLmNoYWlucy5wdXNoKGNoYWluTGluayk7XHJcblx0XHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LnB1c2goY2hhaW5MaW5rKTtcclxuXHJcblx0XHRcdGxldCBjaGFpbkJnID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUobGFzdEJvZHkueCwgbGFzdEJvZHkueSArIGxhc3RCb2R5U2l6ZSArIGNoYWluUmFkaXVzLCAnY2hhaW5fYm9yZGVyJywgdW5kZWZpbmVkLCB0aGlzLmJhY2tncm91bmRHcm91cCk7XHJcblx0XHRcdGNoYWluQmcuc2NhbGUuc2V0KDAuMTUpO1xyXG5cdFx0XHR0aGlzLmNoYWluQmdzLnB1c2goY2hhaW5CZyk7XHJcblx0XHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LnB1c2goY2hhaW5CZyk7XHJcblx0XHRcdGNoYWluQmcuYW5jaG9yLnNldCgwLjUpO1xyXG5cclxuXHRcdFx0dGhpcy5nYW1lLnBoeXNpY3MucDIuZW5hYmxlKGNoYWluTGluaywgRGVidWdSZW5kZXIpO1xyXG5cdFx0XHRsZXQgY2hhaW5Cb2R5ID0gPFBoYXNlci5QaHlzaWNzLlAyLkJvZHk+Y2hhaW5MaW5rLmJvZHk7XHJcblx0XHRcdCg8YW55PmNoYWluQm9keS5kYXRhKS5pc0NoYWluID0gdHJ1ZTtcclxuXHRcdFx0Y2hhaW5Cb2R5LmNsZWFyU2hhcGVzKCk7XHJcblx0XHRcdGNoYWluQm9keS5hZGRDaXJjbGUoY2hhaW5SYWRpdXMgKiAyKTtcclxuXHRcdFx0Y2hhaW5Cb2R5Lm1hc3MgKj0gMC4xO1xyXG5cclxuXHRcdFx0Ly9MaW5rIHRvIGxhc3RcclxuXHRcdFx0bGV0IGN0ciA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZURpc3RhbmNlQ29uc3RyYWludChsYXN0Qm9keSwgY2hhaW5Cb2R5LCBsYXN0Qm9keVNpemUgKyBjaGFpblJhZGl1cyk7XHJcblx0XHRcdHRoaXMuY29uc3RyYWludHMucHVzaChjdHIpO1xyXG5cclxuXHRcdFx0bGFzdEJvZHkgPSBjaGFpbkJvZHk7XHJcblx0XHRcdGxhc3RCb2R5U2l6ZSA9IGNoYWluUmFkaXVzO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMubWFjZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKGxhc3RCb2R5LngsIGxhc3RCb2R5LnkgKyBsYXN0Qm9keVNpemUsICdtYWNlJywgdW5kZWZpbmVkLCB0aGlzLm1pZGRsZUdyb3VwKTtcclxuXHRcdHRoaXMubWFjZS5zY2FsZS5zZXQoMC40KTtcclxuXHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LnB1c2godGhpcy5tYWNlKTtcclxuXHJcblx0XHR0aGlzLm1hY2VCZyA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKGxhc3RCb2R5LngsIGxhc3RCb2R5LnkgKyBsYXN0Qm9keVNpemUsICdtYWNlX2JvcmRlcicsIHVuZGVmaW5lZCwgdGhpcy5iYWNrZ3JvdW5kR3JvdXApO1xyXG5cdFx0dGhpcy5hbGxUaGluZ3NUb0Rlc3Ryb3kucHVzaCh0aGlzLm1hY2VCZyk7XHJcblx0XHR0aGlzLm1hY2VCZy5zY2FsZS5zZXQoMC40KTtcclxuXHRcdHRoaXMubWFjZUJnLmFuY2hvci5zZXQoMC41KTtcclxuXHJcblx0XHR0aGlzLmdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcy5tYWNlLCBEZWJ1Z1JlbmRlcik7XHJcblx0XHR0aGlzLm1hY2VCb2R5ID0gPFBoYXNlci5QaHlzaWNzLlAyLkJvZHk+dGhpcy5tYWNlLmJvZHk7XHJcblx0XHR0aGlzLm1hY2VCb2R5LmNsZWFyU2hhcGVzKCk7XHJcblx0XHR0aGlzLm1hY2VCb2R5LmFkZENpcmNsZShtYWNlUmFkaXVzKTtcclxuXHRcdHRoaXMubWFjZUJvZHkubWFzcyAqPSAwLjU7XHJcblx0XHR0aGlzLm1hY2VCb2R5LmZpeGVkUm90YXRpb24gPSB0cnVlO1xyXG5cdFx0bGV0IGN0ciA9IHRoaXMuZ2FtZS5waHlzaWNzLnAyLmNyZWF0ZURpc3RhbmNlQ29uc3RyYWludChsYXN0Qm9keSwgdGhpcy5tYWNlQm9keSwgbGFzdEJvZHlTaXplICsgbWFjZVJhZGl1cyk7XHJcblx0XHR0aGlzLmNvbnN0cmFpbnRzLnB1c2goY3RyKTtcclxuXHJcblxyXG5cdFx0KDxhbnk+dGhpcy5tYWNlQm9keS5kYXRhKS5wbGF5ZXIgPSB0aGlzO1xyXG5cdFx0KDxhbnk+dGhpcy5tYWNlQm9keS5kYXRhKS5pc1dlYXBvbiA9IHRydWU7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGNyZWF0ZVN3b3JkKCkge1xyXG5cdFx0dGhpcy5zd29yZCA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuYm9keS54LCB0aGlzLmJvZHkueSAtIGJvZHlSYWRpdXMgLSBzd29yZExlbmd0aCAqIDAuNiwgJ2F4ZScsIHVuZGVmaW5lZCwgdGhpcy5taWRkbGVHcm91cCk7XHJcblx0XHR0aGlzLnN3b3JkQmcgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmJvZHkueCwgdGhpcy5ib2R5LnkgLSBib2R5UmFkaXVzIC0gc3dvcmRMZW5ndGggKiAwLjYsICdheGVfYm9yZGVyJywgdW5kZWZpbmVkLCB0aGlzLmJhY2tncm91bmRHcm91cCk7XHJcblx0XHR0aGlzLnN3b3JkQmcuYW5jaG9yLnNldCgwLjUpO1xyXG5cdFx0dGhpcy5hbGxUaGluZ3NUb0Rlc3Ryb3kucHVzaCh0aGlzLnN3b3JkKTtcclxuXHRcdHRoaXMuYWxsVGhpbmdzVG9EZXN0cm95LnB1c2godGhpcy5zd29yZEJnKTtcclxuXHJcblx0XHR0aGlzLmdhbWUucGh5c2ljcy5wMi5lbmFibGUodGhpcy5zd29yZCwgRGVidWdSZW5kZXIpO1xyXG5cdFx0bGV0IGJvZHkgPSA8UGhhc2VyLlBoeXNpY3MuUDIuQm9keT50aGlzLnN3b3JkLmJvZHk7XHJcblxyXG5cdFx0Ym9keS5jbGVhclNoYXBlcygpO1xyXG5cdFx0bGV0IHJlY3QgPSBib2R5LmFkZFJlY3RhbmdsZShzd29yZFdpZHRoLCBzd29yZExlbmd0aCk7XHJcblx0XHRib2R5Lm1hc3MgKj0gMC41O1xyXG5cclxuXHRcdGxldCBjdHIgPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5jcmVhdGVSZXZvbHV0ZUNvbnN0cmFpbnQodGhpcy5ib2R5LCBbMCwgMF0sIGJvZHksIFswLCBib2R5UmFkaXVzICsgc3dvcmRMZW5ndGggKiAwLjZdKTtcclxuXHRcdHRoaXMuY29uc3RyYWludHMucHVzaChjdHIpO1xyXG5cclxuXHJcblx0XHQoPGFueT5ib2R5LmRhdGEpLnBsYXllciA9IHRoaXM7XHJcblx0XHQoPGFueT5ib2R5LmRhdGEpLmlzV2VhcG9uID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgY3JlYXRlQXJyb3dBaW0oKSB7XHJcblx0XHR0aGlzLmFycm93Rm9yQWltID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5ib2R5LngsIHRoaXMuYm9keS55LCAnYm93JywgdW5kZWZpbmVkLCB0aGlzLm1pZGRsZUdyb3VwKTtcclxuXHRcdHRoaXMuYXJyb3dGb3JBaW0uYW5jaG9yLnNldCgwLjUpO1xyXG5cdFx0dGhpcy5hbGxUaGluZ3NUb0Rlc3Ryb3kucHVzaCh0aGlzLmFycm93Rm9yQWltKTtcclxuXHJcblx0XHR0aGlzLmFycm93Rm9yQWltQmcgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmJvZHkueCwgdGhpcy5ib2R5LnksICdib3dfYm9yZGVyJywgdW5kZWZpbmVkLCB0aGlzLmJhY2tncm91bmRHcm91cCk7XHJcblx0XHR0aGlzLmFycm93Rm9yQWltQmcuYW5jaG9yLnNldCgwLjUpO1xyXG5cdFx0dGhpcy5hbGxUaGluZ3NUb0Rlc3Ryb3kucHVzaCh0aGlzLmFycm93Rm9yQWltQmcpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjcmVhdGVBcnJvdyhyb3RhdGlvbjogbnVtYmVyKSB7XHJcblx0XHR0aGlzLmFycm93ID0gdGhpcy5nYW1lLmFkZC5zcHJpdGUodGhpcy5ib2R5LngsIHRoaXMuYm9keS55LCAnYXJyb3cnLCB1bmRlZmluZWQsIHRoaXMubWlkZGxlR3JvdXApO1xyXG5cdFx0dGhpcy5hcnJvdy5zY2FsZS5zZXQoMC44KTtcclxuXHJcblx0XHR0aGlzLmFycm93QmcgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh0aGlzLmJvZHkueCwgdGhpcy5ib2R5LnksICdhcnJvd19ib3JkZXInLCB1bmRlZmluZWQsIHRoaXMuYmFja2dyb3VuZEdyb3VwKTtcclxuXHRcdHRoaXMuYXJyb3dCZy5zY2FsZS5zZXQoMC44KTtcclxuXHRcdHRoaXMuYXJyb3dCZy5hbmNob3Iuc2V0KDAuNSk7XHJcblxyXG5cdFx0dGhpcy5nYW1lLnBoeXNpY3MucDIuZW5hYmxlKHRoaXMuYXJyb3csIERlYnVnUmVuZGVyKTtcclxuXHRcdGxldCBib2R5ID0gPFBoYXNlci5QaHlzaWNzLlAyLkJvZHk+dGhpcy5hcnJvdy5ib2R5O1xyXG5cdFx0Ym9keS5kYW1waW5nID0gMC41O1xyXG5cdFx0Ym9keS5hbmd1bGFyRGFtcGluZyA9IDAuNTtcclxuXHJcblx0XHRib2R5LmNsZWFyU2hhcGVzKCk7XHJcblx0XHRsZXQgcmVjdCA9IGJvZHkuYWRkUmVjdGFuZ2xlKGFycm93V2lkdGgsIGFycm93TGVuZ3RoLCAwLCAwKTtcclxuXHJcblx0XHQoPGFueT5ib2R5LmRhdGEpLnBsYXllciA9IHRoaXM7XHJcblx0XHQoPGFueT5ib2R5LmRhdGEpLmlzV2VhcG9uID0gdHJ1ZTtcclxuXHRcdCg8YW55PmJvZHkuZGF0YSkuaXNBcnJvdyA9IHRydWU7XHJcblxyXG5cdFx0dGhpcy5nYW1lLnBoeXNpY3MucDIud29ybGQuZGlzYWJsZUJvZHlDb2xsaXNpb24oYm9keS5kYXRhLCB0aGlzLmJvZHkuZGF0YSk7XHJcblxyXG5cdFx0bGV0IHZlbCA9IG5ldyBQaGFzZXIuUG9pbnQoMCwgLWFycm93U3BlZWQpO1xyXG5cdFx0dmVsLnJvdGF0ZSgwLCAwLCByb3RhdGlvbiArIE1hdGguUEkgLyAyKTtcclxuXHRcdGJvZHkuYXBwbHlJbXB1bHNlTG9jYWwoW3ZlbC54LCB2ZWwueV0sIDAsIDApO1xyXG5cclxuXHRcdGJvZHkucm90YXRpb24gPSByb3RhdGlvbiAtIE1hdGguUEkgLyAyO1xyXG5cclxuXHRcdHRoaXMuZ2FtZS5hZGQuYXVkaW8oJ2Jvd19maXJlJykucGxheSgpO1xyXG5cdH1cclxuXHJcblx0YWxsb3dBcnJvd0NvbGxlY3Rpb24oKSB7XHJcblx0XHR0aGlzLmdhbWUucGh5c2ljcy5wMi53b3JsZC5lbmFibGVCb2R5Q29sbGlzaW9uKHRoaXMuYXJyb3cuYm9keS5kYXRhLCB0aGlzLmJvZHkuZGF0YSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm5BcnJvdygpIHtcclxuXHRcdHRoaXMuYXJyb3dGb3JBaW0udmlzaWJsZSA9IHRydWU7XHJcblx0XHR0aGlzLmFycm93Rm9yQWltQmcudmlzaWJsZSA9IHRydWU7XHJcblx0XHR0aGlzLmhvbGRpbmdBcnJvdyA9IHRydWU7XHJcblxyXG5cdFx0Ly9EZXN0cm95IHRoZSBhcnJvd1xyXG5cdFx0dGhpcy5hcnJvdy5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmFycm93ID0gbnVsbDtcclxuXHRcdHRoaXMuYXJyb3dCZy5kZXN0cm95KCk7XHJcblx0XHR0aGlzLmFycm93QmcgPSBudWxsO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSB1cGRhdGVUdXJib0JhcigpIHtcclxuXHRcdHRoaXMudHVyYm9CYXIueCA9IHRoaXMuc3ByaXRlLnggLSA0MDtcclxuXHRcdHRoaXMudHVyYm9CYXIueSA9IHRoaXMuc3ByaXRlLnkgLSA0MDtcclxuXHJcblx0XHR0aGlzLnR1cmJvQmFyLmNsZWFyKCk7XHJcblx0XHR0aGlzLnR1cmJvQmFyLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcblx0XHR0aGlzLnR1cmJvQmFyLmRyYXdSZWN0KC0yLCAtMiwgODQsIDE0KTtcclxuXHRcdHRoaXMudHVyYm9CYXIuZW5kRmlsbCgpO1xyXG5cdFx0dGhpcy50dXJib0Jhci5iZWdpbkZpbGwoMHg4ODg4ODgpO1xyXG5cdFx0dGhpcy50dXJib0Jhci5kcmF3UmVjdCgwLCAwLCA4MCAqIHRoaXMudHVyYm9BbW91bnQgLyBNYXhUdXJib1RpbWVTZWNvbmRzLCAxMCk7XHJcblx0XHR0aGlzLnR1cmJvQmFyLmVuZEZpbGwoKTtcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgdXBkYXRlSGVhbHRoQmFyKCkge1xyXG5cdFx0dGhpcy5oZWFsdGhCYXIueCA9IHRoaXMuc3ByaXRlLnggLSA0MDtcclxuXHRcdHRoaXMuaGVhbHRoQmFyLnkgPSB0aGlzLnNwcml0ZS55IC0gMjg7XHJcblxyXG5cdFx0dGhpcy5oZWFsdGhCYXIuY2xlYXIoKTtcclxuXHRcdHRoaXMuaGVhbHRoQmFyLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcblx0XHR0aGlzLmhlYWx0aEJhci5kcmF3UmVjdCgtMiwgLTIsIDg0LCAxNCk7XHJcblx0XHR0aGlzLmhlYWx0aEJhci5lbmRGaWxsKCk7XHJcblx0XHR0aGlzLmhlYWx0aEJhci5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG5cdFx0dGhpcy5oZWFsdGhCYXIuZHJhd1JlY3QoMCwgMCwgODAgKiB0aGlzLmhlYWx0aCAvIE1heEhlYWx0aCwgMTApO1xyXG5cdFx0dGhpcy5oZWFsdGhCYXIuZW5kRmlsbCgpO1xyXG5cdH1cclxuXHJcblx0dGFrZURhbWFnZShkYW1hZ2U6IG51bWJlcikge1xyXG5cdFx0Ly9kYW1hZ2UgPSB0aGlzLmhlYWx0aDtcclxuXHRcdHRoaXMuaGVhbHRoIC09IGRhbWFnZTtcclxuXHRcdGlmICh0aGlzLmhlYWx0aCA8IDApIHtcclxuXHRcdFx0dGhpcy5oZWFsdGggPSAwO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB0ZXh0ID0gdGhpcy5nYW1lLmFkZC50ZXh0KHRoaXMuYm9keS54LCB0aGlzLmJvZHkueSwgXCJcIiArIGRhbWFnZSwge1xyXG5cdFx0XHRmb250U2l6ZTogNDAgKyBkYW1hZ2UsXHJcblx0XHRcdGZvbnQ6IEcuRm9udE5hbWUsXHJcblx0XHRcdGZpbGw6ICcjMDAwMDAwJ1xyXG5cdFx0fSk7XHJcblx0XHR0ZXh0LmFuY2hvci5zZXQoMC41KTtcclxuXHJcblx0XHQvL0ZhZGUgaW5cclxuXHRcdHRleHQuYWxwaGEgPSAwO1xyXG5cdFx0dGV4dC5zY2FsZS5zZXQoLjQpO1xyXG5cdFx0dGhpcy5nYW1lLmFkZC50d2Vlbih0ZXh0LnNjYWxlKVxyXG5cdFx0XHQudG8oeyB4OiAxLCB5OiAxIH0sIDEwMCwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcblx0XHR0aGlzLmdhbWUuYWRkLnR3ZWVuKHRleHQpXHJcblx0XHRcdC50byh7IGFscGhhOiAxIH0sIDEwMCwgdW5kZWZpbmVkLCB0cnVlKVxyXG5cdFx0XHQuY2hhaW4odGhpcy5nYW1lLmFkZC50d2Vlbih0ZXh0KVxyXG5cdFx0XHRcdC50byh7IGFscGhhOiAwIH0sIDYwMCkpO1xyXG5cclxuXHRcdGlmIChkYW1hZ2UgPiAyMCkge1xyXG5cdFx0XHR0aGlzLmdhbWUuY2FtZXJhLnNoYWtlKGRhbWFnZSAqIDAuMDAxLCAyMDApO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0aGlzLmhlYWx0aCA9PSAwKSB7XHJcblx0XHRcdGxldCB0aW1lVG9EaWUgPSBUaW1lVG9EaWUgKiAwLjc7XHJcblxyXG5cdFx0XHQvL0xpZSBkb3duXHJcblx0XHRcdHRoaXMuZ2FtZS5hZGQudHdlZW4odGhpcy5zcHJpdGUpXHJcblx0XHRcdFx0LnRvKHsgcm90YXRpb246IE1hdGguUEkgLyAyIH0sIHRpbWVUb0RpZSwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHRcdFx0dGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLnNwcml0ZS5hbmNob3IpXHJcblx0XHRcdFx0LnRvKHsgeDogMCwgeTogMC44IH0sIHRpbWVUb0RpZSwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHRcdFx0dGhpcy5nYW1lLmFkZC50d2Vlbih0aGlzLnNwcml0ZUJnLmFuY2hvcilcclxuXHRcdFx0XHQudG8oeyB4OiAwLCB5OiAwLjggfSwgdGltZVRvRGllLCB1bmRlZmluZWQsIHRydWUpO1xyXG5cdFx0XHR0aGlzLmdhbWUuYWRkLnR3ZWVuKHRoaXMuc2hhZG93LnNjYWxlKVxyXG5cdFx0XHRcdC50byh7IHg6IDAuNywgeTogMC43IH0sIHRpbWVUb0RpZSwgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcblx0XHRcdC8vc3dlYXIgYWJvdXQgaXRcclxuXHRcdFx0dGhpcy5kZWF0aEJ1YmJsZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKHRoaXMuc3ByaXRlLngsIHRoaXMuc3ByaXRlLnkgKyBkZWF0aEJ1YmJsZU9mZnNldCwgJ2FoX3NoaXQnKTtcclxuXHRcdFx0dGhpcy5kZWF0aEJ1YmJsZS5zY2FsZS5zZXQoMC43KTtcclxuXHRcdFx0dGhpcy5hbGxUaGluZ3NUb0Rlc3Ryb3kucHVzaCh0aGlzLmRlYXRoQnViYmxlKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGJvZHlNYXNzOiBudW1iZXI7XHJcblxyXG5cclxuXHR3YXNIb2xkaW5nQnVtcGVyID0gZmFsc2U7XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdGlmICghdGhpcy5wYWQuY29ubmVjdGVkIHx8IHRoaXMucGFkLmdldEJ1dHRvbihQaGFzZXIuR2FtZXBhZC5CVVRUT05fMCkgPT0gbnVsbCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuaGVhbHRoID4gMCkge1xyXG5cdFx0XHRsZXQgc2NhbGUgPSA1O1xyXG5cclxuXHRcdFx0bGV0IGVsYXBzZWRTZWNvbmRzID0gdGhpcy5nYW1lLnRpbWUuZWxhcHNlZCAvIDEwMDA7XHJcblx0XHRcdGlmICh0aGlzLnBhZC5nZXRCdXR0b24oUGhhc2VyLkdhbWVwYWQuQlVUVE9OXzApLmlzRG93biAmJiB0aGlzLnR1cmJvQW1vdW50ID4gZWxhcHNlZFNlY29uZHMpIHtcclxuXHRcdFx0XHR0aGlzLnR1cmJvQW1vdW50IC09IGVsYXBzZWRTZWNvbmRzO1xyXG5cdFx0XHRcdHNjYWxlICo9IDM7XHJcblx0XHRcdFx0dGhpcy5ib2R5Lm1hc3MgPSB0aGlzLmJvZHlNYXNzICogMztcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0aGlzLnR1cmJvQW1vdW50ID0gTWF0aC5taW4oTWF4VHVyYm9UaW1lU2Vjb25kcywgdGhpcy50dXJib0Ftb3VudCArIGVsYXBzZWRTZWNvbmRzICogVHVyYm9SZWNoYXJnZVNlY29uZHNQZXJTZWNvbmQpO1xyXG5cdFx0XHRcdHRoaXMuYm9keS5tYXNzID0gdGhpcy5ib2R5TWFzcztcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHRoaXMud2VhcG9uVHlwZSA9PSBXZWFwb25UeXBlLkFycm93KSB7XHJcblx0XHRcdFx0dGhpcy5hcnJvd0ZvckFpbS54ID0gdGhpcy5zcHJpdGUueDtcclxuXHRcdFx0XHR0aGlzLmFycm93Rm9yQWltLnkgPSB0aGlzLnNwcml0ZS55O1xyXG5cdFx0XHRcdGlmICh0aGlzLmhvbGRpbmdBcnJvdykge1xyXG5cclxuXHRcdFx0XHRcdC8vUG9pbnQgdGhlIGFycm93Rm9yQWltIGluIHRoZSByaWdodCBkaXJlY3Rpb25cclxuXHRcdFx0XHRcdGxldCByb3RhdGlvbiA9IHRoaXMuYXJyb3dGb3JBaW0ucm90YXRpb247XHJcblx0XHRcdFx0XHRsZXQgdmVsID0gbmV3IFBoYXNlci5Qb2ludCh0aGlzLnBhZC5heGlzKDIpLCB0aGlzLnBhZC5heGlzKDMpKTtcclxuXHRcdFx0XHRcdGxldCBtYWcgPSB2ZWwuZ2V0TWFnbml0dWRlKCk7XHJcblx0XHRcdFx0XHRpZiAobWFnID4gMC41KSB7XHJcblx0XHRcdFx0XHRcdHZlbC5ub3JtYWxpemUoKTtcclxuXHRcdFx0XHRcdFx0cm90YXRpb24gPSB2ZWwuYW5nbGUobmV3IFBoYXNlci5Qb2ludCgpKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5hcnJvd0ZvckFpbS5yb3RhdGlvbiA9IHJvdGF0aW9uO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dmVsID0gbmV3IFBoYXNlci5Qb2ludCgwLCAxKTtcclxuXHRcdFx0XHRcdFx0dmVsLnJvdGF0ZSgwLCAwLCB0aGlzLmFycm93Rm9yQWltLnJvdGF0aW9uKTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRsZXQgYnVtcGVySXNEb3duID0gW1xyXG5cdFx0XHRcdFx0XHR0aGlzLnBhZC5nZXRCdXR0b24oUGhhc2VyLkdhbWVwYWQuWEJPWDM2MF9SSUdIVF9CVU1QRVIpLmlzRG93biwgXHJcblx0XHRcdFx0XHRcdHRoaXMucGFkLmdldEJ1dHRvbihQaGFzZXIuR2FtZXBhZC5YQk9YMzYwX0xFRlRfQlVNUEVSKS5pc0Rvd24sIFxyXG5cdFx0XHRcdFx0XHR0aGlzLnBhZC5nZXRCdXR0b24oUGhhc2VyLkdhbWVwYWQuWEJPWDM2MF9SSUdIVF9UUklHR0VSKS5pc0Rvd24sIFxyXG5cdFx0XHRcdFx0XHR0aGlzLnBhZC5nZXRCdXR0b24oUGhhc2VyLkdhbWVwYWQuWEJPWDM2MF9MRUZUX1RSSUdHRVIpLmlzRG93blxyXG5cdFx0XHRcdFx0XS5zb21lKGEgPT4gYSk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKGJ1bXBlcklzRG93biAmJiAhdGhpcy53YXNIb2xkaW5nQnVtcGVyKSB7XHJcblx0XHRcdFx0XHRcdHRoaXMud2FzSG9sZGluZ0J1bXBlciA9IHRydWU7XHJcblx0XHRcdFx0XHRcdHRoaXMuaG9sZGluZ0Fycm93ID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHRoaXMuYXJyb3dGb3JBaW0udmlzaWJsZSA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHR0aGlzLmFycm93Rm9yQWltQmcudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRcdFx0dGhpcy5jcmVhdGVBcnJvdyhyb3RhdGlvbik7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCFidW1wZXJJc0Rvd24pIHtcclxuXHRcdFx0XHRcdFx0dGhpcy53YXNIb2xkaW5nQnVtcGVyID0gZmFsc2U7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHR0aGlzLmJvZHkuYXBwbHlJbXB1bHNlTG9jYWwoWy10aGlzLnBhZC5heGlzKDApICogc2NhbGUsIC10aGlzLnBhZC5heGlzKDEpICogc2NhbGVdLCAwLCAwKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByZVJlbmRlcigpIHtcclxuXHRcdGxldCBsYXN0ID0gdGhpcy5ib2R5O1xyXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNoYWlucy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRsZXQgbm93ID0gdGhpcy5jaGFpbnNbaV07XHJcblx0XHRcdGxldCBuZXh0ID0gKGkgPT0gdGhpcy5jaGFpbnMubGVuZ3RoIC0gMSkgPyB0aGlzLm1hY2VCb2R5IDogdGhpcy5jaGFpbnNbaSArIDFdO1xyXG5cclxuXHRcdFx0bGV0IHB0ID0gbmV3IFBoYXNlci5Qb2ludChsYXN0LngsIGxhc3QueSk7XHJcblx0XHRcdGxldCBhbmdsZSA9IHB0LmFuZ2xlKG5ldyBQaGFzZXIuUG9pbnQobmV4dC54LCBuZXh0LnkpKTtcclxuXHRcdFx0KDxQaGFzZXIuUGh5c2ljcy5QMi5Cb2R5Pm5vdy5ib2R5KS5yb3RhdGlvbiA9IGFuZ2xlO1xyXG5cdFx0XHRsYXN0ID0gPGFueT5ub3c7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy51cGRhdGVUdXJib0JhcigpO1xyXG5cdFx0dGhpcy51cGRhdGVIZWFsdGhCYXIoKTtcclxuXHJcblxyXG5cdFx0Ly9VcGRhdGUgYmFja2dyb3VuZHNcclxuXHRcdHRoaXMuY29weVBhc3RhKHRoaXMuc3ByaXRlQmcsIHRoaXMuc3ByaXRlKTtcclxuXHRcdHRoaXMuc2hhZG93LnggPSB0aGlzLnNwcml0ZS54O1xyXG5cdFx0dGhpcy5zaGFkb3cueSA9IHRoaXMuc3ByaXRlLnkgKyBzaGFkb3dPZmZzZXQ7XHJcblx0XHRpZiAodGhpcy5kZWF0aEJ1YmJsZSkge1xyXG5cdFx0XHR0aGlzLmRlYXRoQnViYmxlLnggPSB0aGlzLnNwcml0ZS54O1xyXG5cdFx0XHR0aGlzLmRlYXRoQnViYmxlLnkgPSB0aGlzLnNwcml0ZS55ICsgZGVhdGhCdWJibGVPZmZzZXQ7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMuc3dvcmQpIHtcclxuXHRcdFx0dGhpcy5jb3B5UGFzdGEodGhpcy5zd29yZEJnLCB0aGlzLnN3b3JkKTtcclxuXHRcdH1cclxuXHRcdGlmICh0aGlzLmFycm93Rm9yQWltKSB7XHJcblx0XHRcdHRoaXMuY29weVBhc3RhKHRoaXMuYXJyb3dGb3JBaW1CZywgdGhpcy5hcnJvd0ZvckFpbSk7XHJcblx0XHR9XHJcblx0XHRpZiAodGhpcy5hcnJvdykge1xyXG5cdFx0XHR0aGlzLmNvcHlQYXN0YSh0aGlzLmFycm93QmcsIHRoaXMuYXJyb3cpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMubWFjZSkge1xyXG5cdFx0XHR0aGlzLmNvcHlQYXN0YSh0aGlzLm1hY2VCZywgdGhpcy5tYWNlKTtcclxuXHRcdH1cclxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jaGFpbnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0dGhpcy5jb3B5UGFzdGEodGhpcy5jaGFpbkJnc1tpXSwgdGhpcy5jaGFpbnNbaV0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChNYXRoLmFicyh0aGlzLmJvZHkudmVsb2NpdHkueCkgPiAwLjA1ICYmIE1hdGguYWJzKHRoaXMuYm9keS52ZWxvY2l0eS55KSA+IDAuMDUpIHtcclxuXHRcdFx0aWYgKHRoaXMuYm9keS52ZWxvY2l0eS54ID4gMCAmJiB0aGlzLmJvZHkudmVsb2NpdHkueSA+IDApIHtcclxuXHRcdFx0XHR0aGlzLnNldFNwcml0ZSgnU0UnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnggPD0gMCAmJiB0aGlzLmJvZHkudmVsb2NpdHkueSA+IDApIHtcclxuXHRcdFx0XHR0aGlzLnNldFNwcml0ZSgnU1cnKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRpZiAodGhpcy5ib2R5LnZlbG9jaXR5LnggPD0gMCAmJiB0aGlzLmJvZHkudmVsb2NpdHkueSA8PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5zZXRTcHJpdGUoJ05XJyk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKHRoaXMuYm9keS52ZWxvY2l0eS54ID4gMCAmJiB0aGlzLmJvZHkudmVsb2NpdHkueSA8PSAwKSB7XHJcblx0XHRcdFx0dGhpcy5zZXRTcHJpdGUoJ05FJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHByaXZhdGUgc2V0U3ByaXRlKGRpcjogc3RyaW5nKSB7XHJcblx0XHR0aGlzLnNwcml0ZS5sb2FkVGV4dHVyZShkaXIpO1xyXG5cdFx0dGhpcy5zcHJpdGVCZy5sb2FkVGV4dHVyZShkaXIgKyAnX2JvcmRlcicpO1xyXG5cdH1cclxuXHJcblx0cHJpdmF0ZSBjb3B5UGFzdGEoZGVzdDogUGhhc2VyLlNwcml0ZSwgc291cmNlOiBQaGFzZXIuU3ByaXRlKSB7XHJcblx0XHRkZXN0LnggPSBzb3VyY2UueDtcclxuXHRcdGRlc3QueSA9IHNvdXJjZS55O1xyXG5cdFx0ZGVzdC5yb3RhdGlvbiA9IHNvdXJjZS5yb3RhdGlvbjtcclxuXHRcdGRlc3QudXBkYXRlVHJhbnNmb3JtKCk7XHJcblx0fVxyXG5cclxuXHRob2xkaW5nQXJyb3cgPSB0cnVlO1xyXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcGxheWVyLnRzIiwiaW1wb3J0ICdwaXhpJztcclxuaW1wb3J0ICdwMic7XHJcbmltcG9ydCAqIGFzIFBoYXNlciBmcm9tICdwaGFzZXItY2UnO1xyXG5pbXBvcnQgJy4vY3NzL3Jlc2V0LmNzcyc7XHJcblxyXG5pbXBvcnQgR2FtZVN0YXRlIGZyb20gJy4vZ2FtZVN0YXRlJztcclxuaW1wb3J0IExvYWRpbmdTdGF0ZSBmcm9tICcuL2xvYWRpbmdTdGF0ZSc7XHJcbmltcG9ydCBTcGxhc2hTY3JlZW5TdGF0ZSBmcm9tICcuL3NwbGFzaFNjcmVlblN0YXRlJztcclxuaW1wb3J0ICogYXMgRyBmcm9tICcuL2dsb2JhbHMnO1xyXG5cclxubmV3IEdhbWVTdGF0ZSgpO1xyXG5uZXcgTG9hZGluZ1N0YXRlKCk7XHJcbmRlY2xhcmUgZnVuY3Rpb24gcmVxdWlyZShmaWxlbmFtZTogc3RyaW5nKTogYW55O1xyXG5cclxuY2xhc3MgU2ltcGxlR2FtZSB7XHJcblx0Z2FtZTogUGhhc2VyLkdhbWU7XHJcblx0bG9nbzogUGhhc2VyLlNwcml0ZTtcclxuXHRjdXJzb3JzOiBQaGFzZXIuQ3Vyc29yS2V5cztcclxuXHJcblx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUoRy5SZW5kZXJXaWR0aCwgRy5SZW5kZXJIZWlnaHQsIFBoYXNlci5BVVRPLCBcImNvbnRlbnRcIik7XHJcblxyXG5cdFx0dGhpcy5nYW1lLnN0YXRlLmFkZCgnbG9hZGluZycsIExvYWRpbmdTdGF0ZSk7XHJcblx0XHR0aGlzLmdhbWUuc3RhdGUuYWRkKCdzcGxhc2hzY3JlZW4nLCBTcGxhc2hTY3JlZW5TdGF0ZSk7XHJcblx0XHR0aGlzLmdhbWUuc3RhdGUuYWRkKCdnYW1lJywgR2FtZVN0YXRlKTtcclxuXHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgnbG9hZGluZycpO1xyXG5cdH1cclxufVxyXG5cclxuY29uc3QgZ2FtZSA9IG5ldyBTaW1wbGVHYW1lKCk7XHJcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LnRzIiwiLy8gcmVtb3ZlZCBieSBleHRyYWN0LXRleHQtd2VicGFjay1wbHVnaW5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Nzcy9yZXNldC5jc3Ncbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCAqIGFzIFBoYXNlciBmcm9tICdwaGFzZXItY2UnO1xyXG5pbXBvcnQgKiBhcyBXZWJGb250IGZyb20gJ3dlYmZvbnRsb2FkZXInO1xyXG5pbXBvcnQgeyBQbGF5ZXIsIFRpbWVUb0RpZSB9IGZyb20gJy4vcGxheWVyJztcclxuaW1wb3J0ICogYXMgRyBmcm9tICcuL2dsb2JhbHMnO1xyXG5pbXBvcnQgeyBXZWFwb25UeXBlIH0gZnJvbSAnLi93ZWFwb25UeXBlJztcclxuaW1wb3J0IHsgU2h1ZmZsZSB9IGZyb20gJy4vc2h1ZmZsZSc7XHJcblxyXG5cclxubGV0IHJlbWFpbmluZ0xpdmVzID0gW1xyXG5cdEcuSW5pdGlhbExpdmVzLCBHLkluaXRpYWxMaXZlcywgRy5Jbml0aWFsTGl2ZXMsIEcuSW5pdGlhbExpdmVzXHJcbl07XHJcblxyXG5jb25zdCBJbXBhY3REYW1hZ2VNdWx0aXBsaWVyID0gMC43O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FtZVN0YXRlIGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcclxuXHRwbGF5ZXJXZWFwb25zOiBXZWFwb25UeXBlW11bXTtcclxuXHRib3dIaXRJbmRleDogbnVtYmVyO1xyXG5cdGJvd0hpdHM6IHN0cmluZ1tdO1xyXG5cdHBsYXllckhpdEluZGV4OiBudW1iZXI7XHJcblx0cGxheWVySGl0czogc3RyaW5nW107XHJcblx0d2VhcG9uQ2xhc2hJbmRleDogbnVtYmVyO1xyXG5cdHdlYXBvbkNsYXNoZXM6IHN0cmluZ1tdO1xyXG5cdG5hbWVUZXh0OiBQaGFzZXIuVGV4dFtdO1xyXG5cdHRhdW50c0luZGV4OiBudW1iZXI7XHJcblx0dGF1bnRzOiBzdHJpbmdbXTtcclxuXHRzY29yZVRleHQ6IFBoYXNlci5UZXh0W107XHJcblx0dW5kZXJCbG9vZEdyb3VwRm9yTG90c09mQmxvb2Q6IFBoYXNlci5Hcm91cDtcclxuXHRtaWRkbGVHcm91cDogUGhhc2VyLkdyb3VwO1xyXG5cdG92ZXJCbG9vZEdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblx0c3BsYXR0ZXI6IFBoYXNlci5HcmFwaGljcztcclxuXHR1bmRlckJsb29kR3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcblx0YmFja2dyb3VuZEdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblx0c3BhcmtFbWl0dGVyOiBQaGFzZXIuUGFydGljbGVzLkFyY2FkZS5FbWl0dGVyO1xyXG5cdHBsYXllcnM6IFBsYXllcltdO1xyXG5cdGluaXQoKSB7XHJcblx0XHQvL1RPRE9cclxuXHRcdHRoaXMubG9zaW5nUGxheWVyID0gbnVsbDtcclxuXHJcblxyXG5cdFx0dGhpcy50YXVudHMgPSBbXHJcblx0XHRcdCd0YXVudF8xJyxcclxuXHRcdFx0J3RhdW50XzInLFxyXG5cdFx0XHQndGF1bnRfMycsXHJcblx0XHRcdCd0YXVudF80JyxcclxuXHRcdFx0J3RhdW50XzUnLFxyXG5cdFx0XHQndGF1bnRfNicsXHJcblx0XHRdXHJcblx0XHRTaHVmZmxlKHRoaXMudGF1bnRzKTtcclxuXHRcdHRoaXMudGF1bnRzSW5kZXggPSAwO1xyXG5cclxuXHRcdHRoaXMud2VhcG9uQ2xhc2hlcyA9IFtcclxuXHRcdFx0J3N0ZWVsX2hpdF8xJyxcclxuXHRcdFx0J3N0ZWVsX2hpdF8yJyxcclxuXHRcdFx0J3N0ZWVsX2hpdF8zJyxcclxuXHRcdFx0J3N0ZWVsX2hpdF80JyxcclxuXHRcdFx0J3N0ZWVsX2hpdF81JyxcclxuXHRcdF07XHJcblx0XHRTaHVmZmxlKHRoaXMud2VhcG9uQ2xhc2hlcyk7XHJcblx0XHR0aGlzLndlYXBvbkNsYXNoSW5kZXggPSAwO1xyXG5cclxuXHRcdHRoaXMucGxheWVySGl0cyA9IFtcclxuXHRcdFx0J3BsYXllcl9oaXRfMScsXHJcblx0XHRcdCdwbGF5ZXJfaGl0XzInLFxyXG5cdFx0XHQncGxheWVyX2hpdF8zJyxcclxuXHRcdFx0J3BsYXllcl9oaXRfNCcsXHJcblx0XHRcdCdwbGF5ZXJfaGl0XzUnLFxyXG5cdFx0XHQncGxheWVyX2hpdF82JyxcclxuXHRcdFx0J3BsYXllcl9oaXRfNycsXHJcblx0XHRdO1xyXG5cdFx0U2h1ZmZsZSh0aGlzLnBsYXllckhpdHMpO1xyXG5cdFx0dGhpcy5wbGF5ZXJIaXRJbmRleCA9IDA7XHJcblxyXG5cclxuXHRcdHRoaXMuYm93SGl0cyA9IFtcclxuXHRcdFx0J2Jvd19oaXRfMScsXHJcblx0XHRcdCdib3dfaGl0XzInLFxyXG5cdFx0XHQnYm93X2hpdF8zJyxcclxuXHRcdFx0J2Jvd19oaXRfNCcsXHJcblx0XHRcdCdib3dfaGl0XzUnLFxyXG5cdFx0XHQnYm93X2hpdF82JyxcclxuXHRcdFx0J2Jvd19oaXRfNycsXHJcblx0XHRdO1xyXG5cdFx0U2h1ZmZsZSh0aGlzLmJvd0hpdHMpO1xyXG5cdFx0dGhpcy5ib3dIaXRJbmRleCA9IDA7XHJcblxyXG5cdFx0dGhpcy5wbGF5ZXJXZWFwb25zID0gW1xyXG5cdFx0XHRbV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5Td29yZCwgV2VhcG9uVHlwZS5Td29yZCxdLFxyXG5cdFx0XHRbV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5Td29yZCwgV2VhcG9uVHlwZS5Td29yZCxdLFxyXG5cdFx0XHRbV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5Td29yZCwgV2VhcG9uVHlwZS5Td29yZCxdLFxyXG5cdFx0XHRbV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5BcnJvdywgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5DaGFpbiwgV2VhcG9uVHlwZS5Td29yZCwgV2VhcG9uVHlwZS5Td29yZCxdLFxyXG5cdFx0XTtcclxuXHRcdHRoaXMucGxheWVyV2VhcG9ucy5mb3JFYWNoKHcgPT4ge1xyXG5cdFx0XHRsZXQgYW55TWF0Y2ggPSBmYWxzZTtcclxuXHRcdFx0ZG8ge1xyXG5cdFx0XHRcdFNodWZmbGUodyk7XHJcblxyXG5cdFx0XHRcdGFueU1hdGNoID0gZmFsc2U7XHJcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCB3Lmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHRpZiAod1tpXSA9PSB3W2kgLSAxXSkge1xyXG5cdFx0XHRcdFx0XHRhbnlNYXRjaCA9IHRydWU7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IHdoaWxlIChhbnlNYXRjaCk7XHJcblx0XHR9KVxyXG5cdH1cclxuXHRsb3NpbmdQbGF5ZXI6IG51bWJlciA9IG51bGw7XHJcblxyXG5cdHByZWxvYWQoKSB7XHJcblx0XHR0aGlzLmdhbWUuY2FtZXJhLnNoYWtlKDAsIDApO1xyXG5cclxuXHRcdGlmICghdGhpcy5zcGxhdHRlcikge1xyXG5cdFx0XHR0aGlzLnNwbGF0dGVyID0gdGhpcy5nYW1lLmFkZC5ncmFwaGljcygpO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMuZ2FtZS5hZGQuZXhpc3RpbmcodGhpcy5zcGxhdHRlcik7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly9sZXQgdGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy53b3JsZC5jZW50ZXJYLCB0aGlzLndvcmxkLmNlbnRlclksICdMb2FkZWQsIGxldHMgZ28gJywgeyBmb250OiAnNDJweCBCYW5nZXJzJywgZmlsbDogJyM5OTk5OTknLCBhbGlnbjogJ2NlbnRlcicgfSk7XHJcblx0XHQvL3RleHQuYW5jaG9yLnNldFRvKDAuNSwgMC41KTtcclxuXHJcblx0XHR0aGlzLnBoeXNpY3Muc3RhcnRTeXN0ZW0oUGhhc2VyLlBoeXNpY3MuUDJKUyk7XHJcblx0XHR0aGlzLnBoeXNpY3MucDIuc2V0SW1wYWN0RXZlbnRzKHRydWUpO1xyXG5cclxuXHRcdHRoaXMucGh5c2ljcy5wMi5yZXN0aXR1dGlvbiA9IDAuNDtcclxuXHRcdHRoaXMudW5kZXJCbG9vZEdyb3VwRm9yTG90c09mQmxvb2QgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcblxyXG5cdFx0dGhpcy51bmRlckJsb29kR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKHRoaXMudW5kZXJCbG9vZEdyb3VwRm9yTG90c09mQmxvb2QpO1xyXG5cclxuXHRcdHRoaXMuYmFja2dyb3VuZEdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG5cdFx0dGhpcy5taWRkbGVHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHJcblxyXG5cclxuXHRcdHRoaXMucGxheWVycyA9IFtcclxuXHRcdFx0bmV3IFBsYXllcih0aGlzLmdhbWUsIHRoaXMuYmFja2dyb3VuZEdyb3VwLCB0aGlzLm1pZGRsZUdyb3VwLCB0aGlzLmdhbWUuaW5wdXQuZ2FtZXBhZC5wYWQxLCAyMDAsIDIwMCwgdGhpcy5wbGF5ZXJXZWFwb25zWzBdW3JlbWFpbmluZ0xpdmVzWzBdIC0gMV0pLFxyXG5cdFx0XHRuZXcgUGxheWVyKHRoaXMuZ2FtZSwgdGhpcy5iYWNrZ3JvdW5kR3JvdXAsIHRoaXMubWlkZGxlR3JvdXAsIHRoaXMuZ2FtZS5pbnB1dC5nYW1lcGFkLnBhZDIsIEcuUmVuZGVyV2lkdGggLSAyMDAsIDIwMCwgdGhpcy5wbGF5ZXJXZWFwb25zWzFdW3JlbWFpbmluZ0xpdmVzWzFdIC0gMV0pLFxyXG5cdFx0XHRuZXcgUGxheWVyKHRoaXMuZ2FtZSwgdGhpcy5iYWNrZ3JvdW5kR3JvdXAsIHRoaXMubWlkZGxlR3JvdXAsIHRoaXMuZ2FtZS5pbnB1dC5nYW1lcGFkLnBhZDMsIEcuUmVuZGVyV2lkdGggLSAxMDAsIDcyMCAtIDQwLCB0aGlzLnBsYXllcldlYXBvbnNbMl1bcmVtYWluaW5nTGl2ZXNbMl0gLSAxXSksXHJcblx0XHRcdG5ldyBQbGF5ZXIodGhpcy5nYW1lLCB0aGlzLmJhY2tncm91bmRHcm91cCwgdGhpcy5taWRkbGVHcm91cCwgdGhpcy5nYW1lLmlucHV0LmdhbWVwYWQucGFkNCwgNDAsIDcyMCAtIDQwLCB0aGlzLnBsYXllcldlYXBvbnNbM11bcmVtYWluaW5nTGl2ZXNbM10gLSAxXSksXHJcblx0XHRdO1xyXG5cclxuXHJcblx0XHR0aGlzLnNwYXJrRW1pdHRlciA9IHRoaXMuZ2FtZS5hZGQuZW1pdHRlcigwLCAwLCAxMDAwKTtcclxuXHRcdC8vKDxhbnk+dGhpcy5zcGFya0VtaXR0ZXIpLmJsZW5kTW9kZSA9IFBJWEkuYmxlbmRNb2Rlcy5EQVJLRU47XHJcblx0XHR0aGlzLnNwYXJrRW1pdHRlci5zZXRBbHBoYSgxLCAwLCA0MDApO1xyXG5cdFx0dGhpcy5zcGFya0VtaXR0ZXIuc2V0Um90YXRpb24oMCwgMzYwKTtcclxuXHRcdHRoaXMuc3BhcmtFbWl0dGVyLnNldFNjYWxlKC4zLCAuMywgLjMsIC4zKVxyXG5cdFx0dGhpcy5zcGFya0VtaXR0ZXIuc2V0WFNwZWVkKC00MDAsIDQwMCk7XHJcblx0XHR0aGlzLnNwYXJrRW1pdHRlci5zZXRZU3BlZWQoLTQwMCwgNDAwKTtcclxuXHJcblx0XHR0aGlzLnNwYXJrRW1pdHRlci5tYWtlUGFydGljbGVzKCdwYXJ0aWNsZV8xJyk7XHJcblxyXG5cdFx0dGhpcy5vdmVyQmxvb2RHcm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuXHJcblxyXG5cdFx0Ly9SYW5kb20gY2lyY2xlXHJcblx0XHQvKntcclxuXHRcdFx0bGV0IHNwcml0ZSA9IHRoaXMuZ2FtZS5hZGQuc3ByaXRlKEcuUmVuZGVyV2lkdGggLyAyLCBHLlJlbmRlckhlaWdodCAvIDIpO1xyXG5cdFx0XHR0aGlzLnBoeXNpY3MucDIuZW5hYmxlKHNwcml0ZSwgRy5EZWJ1Z1JlbmRlcik7XHJcblx0XHRcdGxldCBib2R5ID0gPFBoYXNlci5QaHlzaWNzLlAyLkJvZHk+c3ByaXRlLmJvZHk7XHJcblx0XHRcdGJvZHkuY2xlYXJTaGFwZXMoKTtcclxuXHRcdFx0Ym9keS5hZGRDaXJjbGUoMzApO1xyXG5cdFx0XHRib2R5LmRhbXBpbmcgPSAwLjY7XHJcblx0XHR9Ki9cclxuXHJcblx0XHR0aGlzLm5hbWVUZXh0ID0gW1xyXG5cdFx0XHR0aGlzLmFkZC50ZXh0KDgwLCA4MCAtIDUwLCBHLk5hbWVzWzBdLCB7XHJcblx0XHRcdFx0Zm9udFNpemU6IDYwLFxyXG5cdFx0XHRcdGZvbnQ6IEcuRm9udE5hbWUsXHJcblx0XHRcdFx0ZmlsbDogJyMwMDAwMDAnXHJcblx0XHRcdH0pLFxyXG5cdFx0XHR0aGlzLmFkZC50ZXh0KEcuUmVuZGVyV2lkdGggLSA4MCwgODAgLSA1MCwgRy5OYW1lc1sxXSwge1xyXG5cdFx0XHRcdGZvbnRTaXplOiA2MCxcclxuXHRcdFx0XHRmb250OiBHLkZvbnROYW1lLFxyXG5cdFx0XHRcdGZpbGw6ICcjMDAwMDAwJ1xyXG5cdFx0XHR9KSxcclxuXHRcdFx0dGhpcy5hZGQudGV4dChHLlJlbmRlcldpZHRoIC0gODAsIEcuUmVuZGVySGVpZ2h0IC0gODAsIEcuTmFtZXNbMl0sIHtcclxuXHRcdFx0XHRmb250U2l6ZTogNjAsXHJcblx0XHRcdFx0Zm9udDogRy5Gb250TmFtZSxcclxuXHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0fSksXHJcblx0XHRcdHRoaXMuYWRkLnRleHQoODAsIEcuUmVuZGVySGVpZ2h0IC0gODAsIEcuTmFtZXNbM10sIHtcclxuXHRcdFx0XHRmb250U2l6ZTogNjAsXHJcblx0XHRcdFx0Zm9udDogRy5Gb250TmFtZSxcclxuXHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0fSlcclxuXHRcdF07XHJcblx0XHR0aGlzLm5hbWVUZXh0LmZvckVhY2gocyA9PiBzLmFuY2hvci5zZXQoMC41KSk7XHJcblxyXG5cdFx0dGhpcy5zY29yZVRleHQgPSBbXHJcblx0XHRcdHRoaXMuYWRkLnRleHQoODAsIDgwLCBcIlwiICsgRy5Jbml0aWFsTGl2ZXMsIHtcclxuXHRcdFx0XHRmb250U2l6ZTogNjAsXHJcblx0XHRcdFx0Zm9udDogRy5Gb250TmFtZSxcclxuXHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0fSksXHJcblx0XHRcdHRoaXMuYWRkLnRleHQoRy5SZW5kZXJXaWR0aCAtIDgwLCA4MCwgXCJcIiArIEcuSW5pdGlhbExpdmVzLCB7XHJcblx0XHRcdFx0Zm9udFNpemU6IDYwLFxyXG5cdFx0XHRcdGZvbnQ6IEcuRm9udE5hbWUsXHJcblx0XHRcdFx0ZmlsbDogJyMwMDAwMDAnXHJcblx0XHRcdH0pLFxyXG5cdFx0XHR0aGlzLmFkZC50ZXh0KEcuUmVuZGVyV2lkdGggLSA4MCwgRy5SZW5kZXJIZWlnaHQgLSA4MCArIDUwLCBcIlwiICsgRy5Jbml0aWFsTGl2ZXMsIHtcclxuXHRcdFx0XHRmb250U2l6ZTogNjAsXHJcblx0XHRcdFx0Zm9udDogRy5Gb250TmFtZSxcclxuXHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0fSksXHJcblx0XHRcdHRoaXMuYWRkLnRleHQoODAsIEcuUmVuZGVySGVpZ2h0IC0gODAgKyA1MCwgXCJcIiArIEcuSW5pdGlhbExpdmVzLCB7XHJcblx0XHRcdFx0Zm9udFNpemU6IDYwLFxyXG5cdFx0XHRcdGZvbnQ6IEcuRm9udE5hbWUsXHJcblx0XHRcdFx0ZmlsbDogJyMwMDAwMDAnXHJcblx0XHRcdH0pXHJcblx0XHRdO1xyXG5cdFx0dGhpcy5zY29yZVRleHQuZm9yRWFjaChzID0+IHMuYW5jaG9yLnNldCgwLjUpKTtcclxuXHJcblx0XHR0aGlzLnBoeXNpY3MucDIub25CZWdpbkNvbnRhY3QucmVtb3ZlQWxsKCk7XHJcblx0XHR0aGlzLnBoeXNpY3MucDIub25CZWdpbkNvbnRhY3QuYWRkKChhLCBiLCBjLCBkLCBlKSA9PiB7XHJcblx0XHRcdGlmICh0aGlzLmxvc2luZ1BsYXllciA9PT0gbnVsbCkge1xyXG5cclxuXHRcdFx0XHQvL0Fycm93IHJldHVybmluZ1xyXG5cdFx0XHRcdGlmIChiLmlzQXJyb3cpIHtcclxuXHRcdFx0XHRcdGxldCB0bXAgPSBhO1xyXG5cdFx0XHRcdFx0YSA9IGI7XHJcblx0XHRcdFx0XHRiID0gdG1wO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0aWYgKGEuaXNBcnJvdykge1xyXG5cdFx0XHRcdFx0YS5wbGF5ZXIuYWxsb3dBcnJvd0NvbGxlY3Rpb24oKTtcclxuXHJcblx0XHRcdFx0XHRpZiAoYi5pc1BsYXllciAmJiBhLnBsYXllciA9PSBiLnBsYXllcikge1xyXG5cdFx0XHRcdFx0XHRhLnBsYXllci5yZXR1cm5BcnJvdygpO1xyXG5cdFx0XHRcdFx0XHRyZXR1cm47XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYgKCFiLmlzV2VhcG9uICYmICFiLmlzUGxheWVyICYmICFiLmlzQ2hhaW4pIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5nYW1lLmFkZC5hdWRpbyh0aGlzLmJvd0hpdHNbdGhpcy5ib3dIaXRJbmRleF0pLnBsYXkodW5kZWZpbmVkLCB1bmRlZmluZWQsIDAuNSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuYm93SGl0SW5kZXggPSAodGhpcy5ib3dIaXRJbmRleCArIDEpICUgdGhpcy5ib3dIaXRzLmxlbmd0aDtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChhLmlzV2VhcG9uICYmIGIuaXNXZWFwb24gJiYgZVswXS5maXJzdEltcGFjdCkge1xyXG5cdFx0XHRcdFx0bGV0IGVjID0gdGhpcy5nZXRDb2xsaXNpb25DZW50ZXIoZSk7XHJcblx0XHRcdFx0XHR0aGlzLnNwYXJrRW1pdHRlci54ID0gZWMueDtcclxuXHRcdFx0XHRcdHRoaXMuc3BhcmtFbWl0dGVyLnkgPSBlYy55O1xyXG5cdFx0XHRcdFx0dGhpcy5zcGFya0VtaXR0ZXIuc3RhcnQodHJ1ZSwgNDAwLCBudWxsLCAxMCk7XHJcblxyXG5cdFx0XHRcdFx0dGhpcy5nYW1lLmFkZC5hdWRpbyh0aGlzLndlYXBvbkNsYXNoZXNbdGhpcy53ZWFwb25DbGFzaEluZGV4XSkucGxheSgpO1xyXG5cdFx0XHRcdFx0dGhpcy53ZWFwb25DbGFzaEluZGV4ID0gKHRoaXMud2VhcG9uQ2xhc2hJbmRleCArIDEpICUgdGhpcy53ZWFwb25DbGFzaGVzLmxlbmd0aDtcclxuXHRcdFx0XHR9XHJcblxyXG5cclxuXHRcdFx0XHRsZXQgZm9yY2U6IG51bWJlciA9IDA7XHJcblx0XHRcdFx0bGV0IHA6IFBsYXllciA9IG51bGw7XHJcblx0XHRcdFx0bGV0IHdlYXBvbkJvZHk6IGFueTtcclxuXHJcblx0XHRcdFx0aWYgKGEuaXNQbGF5ZXIgJiYgYi5pc1dlYXBvbiAmJiBlWzBdLmZpcnN0SW1wYWN0KSB7XHJcblx0XHRcdFx0XHRmb3JjZSA9IGVbMF0uZ2V0VmVsb2NpdHlBbG9uZ05vcm1hbCgpO1xyXG5cdFx0XHRcdFx0cCA9IGEucGxheWVyO1xyXG5cdFx0XHRcdFx0d2VhcG9uQm9keSA9IGI7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGlmIChiLmlzUGxheWVyICYmIGEuaXNXZWFwb24gJiYgZVswXS5maXJzdEltcGFjdCkge1xyXG5cdFx0XHRcdFx0Zm9yY2UgPSBlWzBdLmdldFZlbG9jaXR5QWxvbmdOb3JtYWwoKTtcclxuXHRcdFx0XHRcdHAgPSBiLnBsYXllcjtcclxuXHRcdFx0XHRcdHdlYXBvbkJvZHkgPSBhO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0Ly9EZWFsIGxlc3MgZGFtYWdlIHRvIHlvdXJzZWxmXHJcblx0XHRcdFx0aWYgKHAgJiYgd2VhcG9uQm9keSAmJiBwID09IHdlYXBvbkJvZHkucGxheWVyKSB7XHJcblx0XHRcdFx0XHRmb3JjZSAqPSAwLjI7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRmb3JjZSA9IE1hdGgucm91bmQoTWF0aC5hYnMoZm9yY2UgKiBJbXBhY3REYW1hZ2VNdWx0aXBsaWVyKSk7XHJcblxyXG5cdFx0XHRcdGlmIChwICYmIGZvcmNlID4gMCkge1xyXG5cclxuXHRcdFx0XHRcdGlmICh3ZWFwb25Cb2R5LmlzQXJyb3cgJiYgd2VhcG9uQm9keS5wbGF5ZXIgPT0gcCkge1xyXG5cdFx0XHRcdFx0XHRwLnJldHVybkFycm93KCk7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHRsZXQgZGFtYWdpbmdTZWxmID0gcCA9PSB3ZWFwb25Cb2R5LnBsYXllcjtcclxuXHJcblx0XHRcdFx0XHRcdC8vRG9uJ3QgbGV0IHBsYXllcnMga2lsbCB0aGVtc2VsdmVzXHJcblx0XHRcdFx0XHRcdGlmICgoIWRhbWFnaW5nU2VsZiB8fCBwLmhlYWx0aCA+IGZvcmNlKSAmJiBwLmhlYWx0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0XHRwLnRha2VEYW1hZ2UoZm9yY2UpO1xyXG5cdFx0XHRcdFx0XHRcdHRoaXMuZHJhd1NwbGF0dGVyKGZvcmNlLCBhLCBiLCBlLCBwLmhlYWx0aCA9PSAwKTtcclxuXHJcblx0XHRcdFx0XHRcdFx0Ly9jaGVjayBwbGF5ZXJzIGZvciBkZWF0aCBvciBzb21ldGhpbmdcclxuXHRcdFx0XHRcdFx0XHRpZiAocC5oZWFsdGggPD0gMCkge1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGtpbGxlckluZGV4ID0gdGhpcy5wbGF5ZXJzLmluZGV4T2Yod2VhcG9uQm9keS5wbGF5ZXIpO1xyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IGRlYWRJbmRleCA9IHRoaXMucGxheWVycy5pbmRleE9mKHApO1xyXG5cclxuXHRcdFx0XHRcdFx0XHRcdHJlbWFpbmluZ0xpdmVzW2RlYWRJbmRleF0tLTtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlTGl2ZXNUZXh0KGRlYWRJbmRleCk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0bGV0IHRleHQgPSB0aGlzLmFkZC50ZXh0KDE5MjAgLyAyLCA4MCwgRy5OYW1lc1traWxsZXJJbmRleF0gKyBcIiBraWxsZWQgXCIgKyBHLk5hbWVzW2RlYWRJbmRleF0sIHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IDYwLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmb250OiBHLkZvbnROYW1lLFxyXG5cdFx0XHRcdFx0XHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0XHRcdFx0XHRcdH0pO1xyXG5cdFx0XHRcdFx0XHRcdFx0dGV4dC5hbmNob3Iuc2V0KDAuNSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hZGQudHdlZW4odGV4dClcclxuXHRcdFx0XHRcdFx0XHRcdFx0LnRvKHt9LCBUaW1lVG9EaWUgKiAxLjUsIHVuZGVmaW5lZCwgdHJ1ZSlcclxuXHRcdFx0XHRcdFx0XHRcdFx0Lm9uQ29tcGxldGUuYWRkKCgpID0+IHtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0LmRlc3Ryb3koKTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnJlcGxhY2VQbGF5ZXIoZGVhZEluZGV4KTtcclxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5nYW1lLmFkZC5hdWRpbyh0aGlzLnRhdW50c1t0aGlzLnRhdW50c0luZGV4XSkucGxheSgpO1xyXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy50YXVudHNJbmRleCA9ICh0aGlzLnRhdW50c0luZGV4ICsgMSkgJSB0aGlzLnRhdW50cy5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZ2FtZS5hZGQuYXVkaW8odGhpcy5wbGF5ZXJIaXRzW3RoaXMucGxheWVySGl0SW5kZXhdKS5wbGF5KCk7XHJcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnBsYXllckhpdEluZGV4ID0gKHRoaXMucGxheWVySGl0SW5kZXggKyAxKSAlIHRoaXMucGxheWVySGl0cy5sZW5ndGg7XHJcblx0XHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuXHJcblx0XHRcdC8vVW5kZXJuZWF0aCBCbG9vZFxyXG5cdFx0XHRsZXQgeCA9IE1hdGgucmFuZG9tKCkgKiBHLlJlbmRlcldpZHRoO1xyXG5cdFx0XHRsZXQgeSA9IE1hdGgucmFuZG9tKCkgKiBHLlJlbmRlckhlaWdodDtcclxuXHRcdFx0bGV0IHNwcml0ZSA9IHRoaXMuYWRkLnNwcml0ZSh4LCB5LCAnYmxvb2Rfc2hlZXQnLCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCkpLCB0aGlzLnVuZGVyQmxvb2RHcm91cCk7XHJcblx0XHRcdHNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XHJcblxyXG5cdFx0XHQvL0FuZ2xlIGJhc2VkIG9uIGhpdCBhbmdsZVxyXG5cdFx0XHRsZXQgYW5nbGUgPSBNYXRoLnJhbmRvbSgpICogNDtcclxuXHRcdFx0c3ByaXRlLnJvdGF0aW9uID0gYW5nbGU7XHJcblxyXG5cdFx0XHRsZXQgciA9ICgoMTI4ICsgTWF0aC5yYW5kb20oKSAqIDcwKSB8IDApICogMHgxMDAwMDtcclxuXHRcdFx0c3ByaXRlLnRpbnQgPSByIHwgciA+PiA4IHwgciA+PiAxNjtcclxuXHRcdFx0c3ByaXRlLnNjYWxlLnNldCgwLjIgKyBNYXRoLnJhbmRvbSgpKTtcclxuXHRcdFx0c3ByaXRlLmFscGhhID0gMC40O1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmVwbGFjZVBsYXllcihpbmRleDogbnVtYmVyKSB7XHJcblx0XHRpZiAocmVtYWluaW5nTGl2ZXNbaW5kZXhdIDw9IDApIHtcclxuXHRcdFx0Ly9UT0RPOiBHcmF2ZXN0b25lXHJcblx0XHRcdGxldCB4ID0gdGhpcy5wbGF5ZXJzW2luZGV4XS5ib2R5Lng7XHJcblx0XHRcdGxldCB5ID0gdGhpcy5wbGF5ZXJzW2luZGV4XS5ib2R5Lnk7XHJcblx0XHRcdHRoaXMucGxheWVyc1tpbmRleF0uZGVzdHJveSgpO1xyXG5cdFx0XHR0aGlzLnBsYXllcnNbaW5kZXhdID0gbnVsbDtcclxuXHJcblx0XHRcdGxldCBzcHJpdGUgPSB0aGlzLmdhbWUuYWRkLnNwcml0ZSh4LCB5LCAnZ3JhdmUnLCB1bmRlZmluZWQsIHRoaXMuYmFja2dyb3VuZEdyb3VwKTtcclxuXHRcdFx0dGhpcy5waHlzaWNzLnAyLmVuYWJsZShzcHJpdGUsIEcuRGVidWdSZW5kZXIpO1xyXG5cdFx0XHRsZXQgYm9keSA9IDxQaGFzZXIuUGh5c2ljcy5QMi5Cb2R5PnNwcml0ZS5ib2R5O1xyXG5cdFx0XHRib2R5LmNsZWFyU2hhcGVzKCk7XHJcblx0XHRcdGJvZHkuYWRkQ2lyY2xlKDMwKTtcclxuXHRcdFx0Ym9keS5kYW1waW5nID0gMC45OTtcclxuXHRcdFx0Ym9keS5maXhlZFJvdGF0aW9uID0gdHJ1ZTtcclxuXHRcdFx0c3ByaXRlLmFuY2hvci5zZXQoMC41LCAwLjgpO1xyXG5cclxuXHRcdFx0bGV0IGFsaXZlQW1vdW50ID0gcmVtYWluaW5nTGl2ZXMuZmlsdGVyKGEgPT4gYSA+IDApLmxlbmd0aDtcclxuXHJcblx0XHRcdGlmIChhbGl2ZUFtb3VudCA9PSAwKSB7XHJcblx0XHRcdFx0bGV0IHRleHQgPSB0aGlzLmdhbWUuYWRkLnRleHQoRy5SZW5kZXJXaWR0aCAvIDIsIEcuUmVuZGVySGVpZ2h0IC8gMiwgXCJpdCdzIGEgZHJhdyFcIiwge1xyXG5cdFx0XHRcdFx0Zm9udDogRy5Gb250TmFtZSxcclxuXHRcdFx0XHRcdGZvbnRTaXplOiAxMDAsXHJcblx0XHRcdFx0XHRmaWxsOiAnIzAwMDAwMCdcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR0ZXh0LmFuY2hvci5zZXQoMC41KTtcclxuXHRcdFx0fSBlbHNlIGlmIChhbGl2ZUFtb3VudCA9PSAxKSB7XHJcblx0XHRcdFx0bGV0IHdpbm5lckluZGV4ID0gcmVtYWluaW5nTGl2ZXMuZmluZEluZGV4KGEgPT4gYSA+IDApO1xyXG5cclxuXHRcdFx0XHRsZXQgdGV4dCA9IHRoaXMuZ2FtZS5hZGQudGV4dChHLlJlbmRlcldpZHRoIC8gMiwgRy5SZW5kZXJIZWlnaHQgLyAyLCBHLk5hbWVzW3dpbm5lckluZGV4XSArIFwiIHdpbnMhXCIsIHtcclxuXHRcdFx0XHRcdGZvbnQ6IEcuRm9udE5hbWUsXHJcblx0XHRcdFx0XHRmb250U2l6ZTogMTAwLFxyXG5cdFx0XHRcdFx0ZmlsbDogJyMwMDAwMDAnXHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0dGV4dC5hbmNob3Iuc2V0KDAuNSk7XHJcblxyXG5cdFx0XHRcdHRoaXMuYWRkLmF1ZGlvKCd2aWN0b3J5JykucGxheSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IHggPSB0aGlzLnBsYXllcnNbaW5kZXhdLmJvZHkueDtcclxuXHRcdGxldCB5ID0gdGhpcy5wbGF5ZXJzW2luZGV4XS5ib2R5Lnk7XHJcblx0XHRsZXQgb2xkV2VhcG9uVHlwZSA9IHRoaXMucGxheWVyc1tpbmRleF0ud2VhcG9uVHlwZTtcclxuXHRcdHRoaXMucGxheWVyc1tpbmRleF0uZGVzdHJveSgpO1xyXG5cclxuXHRcdC8vUmFuZG9tIHdlYXBvbiB0eXBlIHRoYXQgaXNuJ3QgdGhlIG9uZSB3ZSBoYWQgYmVmb3JlXHJcblx0XHRsZXQgd2VhcG9uVHlwZSA9IHRoaXMucGxheWVyV2VhcG9uc1tpbmRleF1bcmVtYWluaW5nTGl2ZXNbaW5kZXhdIC0gMV07XHJcblxyXG5cdFx0dGhpcy5wbGF5ZXJzW2luZGV4XSA9IG5ldyBQbGF5ZXIodGhpcy5nYW1lLCB0aGlzLmJhY2tncm91bmRHcm91cCwgdGhpcy5taWRkbGVHcm91cCwgdGhpcy5wbGF5ZXJzW2luZGV4XS5wYWQsIHgsIHksIHdlYXBvblR5cGUpXHJcblx0fVxyXG5cclxuXHR1cGRhdGUoKSB7XHJcblx0XHR0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHsgaWYgKHApIHsgcC51cGRhdGUoKSB9IH0pO1xyXG5cdH1cclxuXHJcblx0cHJlUmVuZGVyKCkge1xyXG5cdFx0dGhpcy5wbGF5ZXJzLmZvckVhY2gocCA9PiB7IGlmIChwKSB7IHAucHJlUmVuZGVyKCkgfSB9KTtcclxuXHR9XHJcblxyXG5cdGRyYXdTcGxhdHRlcihmb3JjZTogbnVtYmVyLCBhLCBiLCBlLCBkaWVkOiBib29sZWFuKSB7XHJcblx0XHRsZXQgZWMgPSB0aGlzLmdldENvbGxpc2lvbkNlbnRlcihlKTtcclxuXHRcdGxldCB0YXJnZXRTY2FsZSA9ICgxMCArIGZvcmNlKSAvIDMyO1xyXG5cclxuXHRcdGNvbnN0IGJsb29kVGltZSA9IDMwMDtcclxuXHJcblx0XHR2YXIgc3ByZWFkID0gMTAgKyBmb3JjZSAqIDI7XHJcblx0XHRsZXQgYW1vdW50ID0gTWF0aC5taW4oMTAsIDMgKyBmb3JjZSk7XHJcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFtb3VudDsgaSsrKSB7XHJcblx0XHRcdGxldCB4TW9kID0gKE1hdGgucmFuZG9tKCkgKiBzcHJlYWQgLSBzcHJlYWQgLyAyKTtcclxuXHRcdFx0bGV0IHlNb2QgPSAoTWF0aC5yYW5kb20oKSAqIHNwcmVhZCAtIHNwcmVhZCAvIDIpO1xyXG5cdFx0XHRsZXQgeCA9IGVjLnggKyB4TW9kO1xyXG5cdFx0XHRsZXQgeSA9IGVjLnkgKyB5TW9kO1xyXG5cclxuXHJcblx0XHRcdC8vT24gdG9wIGJsb29kXHJcblx0XHRcdGxldCBzcHJpdGUgPSB0aGlzLmFkZC5zcHJpdGUoZWMueCwgZWMueSwgJ2Jsb29kX3AnLCB1bmRlZmluZWQsIHRoaXMub3ZlckJsb29kR3JvdXApO1xyXG5cdFx0XHRzcHJpdGUuYW5jaG9yLnNldCgwLjUpO1xyXG5cdFx0XHRsZXQgciA9ICgoMTI4ICsgTWF0aC5yYW5kb20oKSAqIDcwKSB8IDApICogMHgxMDAwMDtcclxuXHRcdFx0c3ByaXRlLnRpbnQgPSByO1xyXG5cclxuXHRcdFx0c3ByaXRlLnNjYWxlLnNldCgwLjMpO1xyXG5cdFx0XHR0aGlzLmdhbWUuYWRkLnR3ZWVuKHNwcml0ZS5zY2FsZSlcclxuXHRcdFx0XHQudG8oeyB4OiB0YXJnZXRTY2FsZSwgeTogdGFyZ2V0U2NhbGUgfSwgYmxvb2RUaW1lLCBQaGFzZXIuRWFzaW5nLnBvd2VyMiwgdHJ1ZSk7XHJcblxyXG5cdFx0XHRzcHJpdGUuYWxwaGEgPSAwLjk7XHJcblx0XHRcdHRoaXMuZ2FtZS5hZGQudHdlZW4oc3ByaXRlKVxyXG5cdFx0XHRcdC50byh7IGFscGhhOiAwIH0sIGJsb29kVGltZSwgUGhhc2VyLkVhc2luZy5DdWJpYy5PdXQsIHRydWUpXHJcblx0XHRcdHRoaXMuZ2FtZS5hZGQudHdlZW4oc3ByaXRlKVxyXG5cdFx0XHRcdC50byh7IHg6IGVjLnggKyB4TW9kICogMywgeTogZWMueSArIHlNb2QgKiAzIH0sIGJsb29kVGltZSwgUGhhc2VyLkVhc2luZy5DdWJpYy5JbiwgdHJ1ZSlcclxuXHRcdFx0XHQub25Db21wbGV0ZS5hZGQoKCkgPT4ge1xyXG5cdFx0XHRcdFx0c3ByaXRlLmRlc3Ryb3koKTtcclxuXHJcblx0XHRcdFx0XHRpZiAodGhpcy51bmRlckJsb29kR3JvdXAuY2hpbGRyZW4ubGVuZ3RoID4gNTAwKSB7XHJcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coXCJDQUNISU5HIFRIRSBUSElORyBUTyBETyBJVCBGQVNUXCIpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLnVuZGVyQmxvb2RHcm91cC5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcclxuXHRcdFx0XHRcdFx0dGhpcy51bmRlckJsb29kR3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKHRoaXMudW5kZXJCbG9vZEdyb3VwRm9yTG90c09mQmxvb2QpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vVW5kZXJuZWF0aCBCbG9vZFxyXG5cdFx0bGV0IHggPSBlYy54O1xyXG5cdFx0bGV0IHkgPSBlYy55O1xyXG5cdFx0bGV0IHNwcml0ZSA9IHRoaXMuYWRkLnNwcml0ZSh4LCB5LCAnYmxvb2Rfc2hlZXQnLCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCkpLCB0aGlzLnVuZGVyQmxvb2RHcm91cCk7XHJcblx0XHRzcHJpdGUuYW5jaG9yLnNldCgwLjUpO1xyXG5cclxuXHRcdC8vQW5nbGUgYmFzZWQgb24gaGl0IGFuZ2xlXHJcblx0XHRsZXQgYW5nbGVQb2ludCA9IG5ldyBQaGFzZXIuUG9pbnQoYS5wb3NpdGlvblswXSwgYS5wb3NpdGlvblsxXSk7XHJcblx0XHRsZXQgYW5nbGUgPSBhbmdsZVBvaW50LmFuZ2xlKG5ldyBQaGFzZXIuUG9pbnQoYi5wb3NpdGlvblswXSwgYi5wb3NpdGlvblsxXSkpO1xyXG5cclxuXHRcdGFuZ2xlIC09IE1hdGguUEkgLyAyO1xyXG5cdFx0Ly9PbmUgb2YgdGhlc2UgaXMgdGhlIHdlYXBvbiBhbmQgb25lIHRoZSBwbGF5ZXIsIHJldmVyc2UgdGhlblxyXG5cdFx0aWYgKGEuaXNQbGF5ZXIpIHtcclxuXHRcdFx0YW5nbGUgPSBhbmdsZSArIE1hdGguUEk7XHJcblx0XHR9XHJcblxyXG5cdFx0c3ByaXRlLnJvdGF0aW9uID0gYW5nbGU7XHJcblxyXG5cdFx0dmFyIHNjYWxlU2NhbGUgPSA0O1xyXG5cdFx0dGFyZ2V0U2NhbGUgPSAoMC4zICsgKDMgKiBmb3JjZSAvIDEwMCkpIC8gc2NhbGVTY2FsZTtcclxuXHJcblx0XHRjb25zdCBibG9vZFRpbWUyID0gMjAwO1xyXG5cclxuXHRcdGxldCByID0gKCgxMjggKyBNYXRoLnJhbmRvbSgpICogNzApIHwgMCkgKiAweDEwMDAwO1xyXG5cdFx0c3ByaXRlLnRpbnQgPSByO1xyXG5cdFx0c3ByaXRlLnNjYWxlLnNldCgwLjMgLyBzY2FsZVNjYWxlKTtcclxuXHRcdHRoaXMuZ2FtZS5hZGQudHdlZW4oc3ByaXRlLnNjYWxlKVxyXG5cdFx0XHQudG8oeyB4OiB0YXJnZXRTY2FsZSwgeTogdGFyZ2V0U2NhbGUgfSwgYmxvb2RUaW1lMiwgUGhhc2VyLkVhc2luZy5DdWJpYy5JbiwgdHJ1ZSk7XHJcblxyXG5cdFx0c3ByaXRlLmFscGhhID0gMC4xO1xyXG5cdFx0dGhpcy5nYW1lLmFkZC50d2VlbihzcHJpdGUpXHJcblx0XHRcdC50byh7IGFscGhhOiBNYXRoLnJhbmRvbSgpICogMC4xICsgMC45IH0sIGJsb29kVGltZTIsIFBoYXNlci5FYXNpbmcucG93ZXIyLCB0cnVlKTtcclxuXHJcblx0XHQvL3RoaXMuc3BsYXR0ZXIuY2FjaGVBc0JpdG1hcCA9IHRydWU7XHJcblx0XHQvL3RoaXMudW5kZXJCbG9vZEdyb3VwLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0Z2V0Q29sbGlzaW9uQ2VudGVyKGUpIHtcclxuXHRcdC8vaHR0cDovL3d3dy5odG1sNWdhbWVkZXZzLmNvbS90b3BpYy8yNjEyNS1wMi1waHlzaWNzLWNvbnRhY3QtcG9pbnQtYmV0d2Vlbi0yLWJvZGllcy9cclxuXHRcdGxldCBwb3MgPSBlWzBdLmJvZHlBLnBvc2l0aW9uO1xyXG5cdFx0bGV0IHB0ID0gZVswXS5jb250YWN0UG9pbnRBO1xyXG5cdFx0bGV0IHggPSB0aGlzLmdhbWUucGh5c2ljcy5wMi5tcHhpKHBvc1swXSArIHB0WzBdKTtcclxuXHRcdGxldCB5ID0gdGhpcy5nYW1lLnBoeXNpY3MucDIubXB4aShwb3NbMV0gKyBwdFsxXSk7XHJcblx0XHRyZXR1cm4geyB4LCB5IH07XHJcblx0fVxyXG5cclxuXHR1cGRhdGVMaXZlc1RleHQoaW5kZXg6IG51bWJlcikge1xyXG5cdFx0dGhpcy5zY29yZVRleHRbaW5kZXhdLnRleHQgPSBcIlwiICsgcmVtYWluaW5nTGl2ZXNbaW5kZXhdO1xyXG5cdH1cclxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2dhbWVTdGF0ZS50cyIsImV4cG9ydCBmdW5jdGlvbiBTaHVmZmxlKGFycjogQXJyYXk8YW55Pikge1xyXG5cdHZhciBjb2xsZWN0aW9uID0gYXJyLFxyXG5cdFx0bGVuID0gYXJyLmxlbmd0aCxcclxuXHRcdHJuZyA9IE1hdGgucmFuZG9tLFxyXG5cdFx0cmFuZG9tLFxyXG5cdFx0dGVtcDtcclxuXHJcblx0d2hpbGUgKGxlbikge1xyXG5cdFx0cmFuZG9tID0gTWF0aC5mbG9vcihybmcoKSAqIGxlbik7XHJcblx0XHRsZW4gLT0gMTtcclxuXHRcdHRlbXAgPSBjb2xsZWN0aW9uW2xlbl07XHJcblx0XHRjb2xsZWN0aW9uW2xlbl0gPSBjb2xsZWN0aW9uW3JhbmRvbV07XHJcblx0XHRjb2xsZWN0aW9uW3JhbmRvbV0gPSB0ZW1wO1xyXG5cdH1cclxufTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zaHVmZmxlLnRzIiwiaW1wb3J0ICogYXMgUGhhc2VyIGZyb20gJ3BoYXNlci1jZSc7XHJcbmltcG9ydCAqIGFzIFdlYkZvbnQgZnJvbSAnd2ViZm9udGxvYWRlcic7XHJcblxyXG5kZWNsYXJlIGZ1bmN0aW9uIHJlcXVpcmUodXJsOiBzdHJpbmcpOiBzdHJpbmc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2FkaW5nU3RhdGUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cdGluaXQoKSB7XHJcblx0XHR0aGlzLmdhbWUuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gJyNlZWVlZWUnO1xyXG5cdFx0dGhpcy5nYW1lLnNjYWxlLmZ1bGxTY3JlZW5TY2FsZU1vZGUgPSBQaGFzZXIuU2NhbGVNYW5hZ2VyLlNIT1dfQUxMO1xyXG5cdFx0dGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XHJcblx0XHR0aGlzLmdhbWUuc3RhZ2UuZGlzYWJsZVZpc2liaWxpdHlDaGFuZ2UgPSB0cnVlO1xyXG5cdH1cclxuXHJcblx0cHJlbG9hZCgpIHtcclxuXHRcdFdlYkZvbnQubG9hZCh7XHJcblx0XHRcdGdvb2dsZToge1xyXG5cdFx0XHRcdGZhbWlsaWVzOiBbJ0JhbmdlcnMnXVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjdXN0b206IHtcclxuXHRcdFx0XHRmYW1pbGllczogWydTRiBDYXJ0b29uaXN0IEhhbmQnXVxyXG5cdFx0XHR9LFxyXG5cdFx0XHRhY3RpdmU6ICgpID0+IHRoaXMuY3JlYXRlKHVuZGVmaW5lZCwgJ2ZvbnQnKVxyXG5cdFx0fSlcclxuXHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ211c2hyb29tMicsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9tdXNocm9vbTIucG5nJykpO1xyXG5cclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnYXJyb3cnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvYXJyb3cuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdheGUnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvYXhlLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnYm93JywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2Jvdy5zdmcnKSk7XHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ2NoYWluJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2NoYWluLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnbWFjZScsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9tYWNlLnN2ZycpKTtcclxuXHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ2Fycm93X2JvcmRlcicsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9hcnJvd19ib3JkZXIuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdheGVfYm9yZGVyJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2F4ZV9ib3JkZXIuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdib3dfYm9yZGVyJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2Jvd19ib3JkZXIuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdjaGFpbl9ib3JkZXInLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhaW5fYm9yZGVyLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnbWFjZV9ib3JkZXInLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvbWFjZV9ib3JkZXIuc3ZnJykpO1xyXG5cclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnc3BsYXNoJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL3NwbGFzaC5wbmcnKSk7XHJcblx0XHRcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnTkUnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05FLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnU0UnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL1NFLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnTlcnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05XLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnU1cnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL1NXLnN2ZycpKTtcclxuXHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ05FX2JvcmRlcicsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvTkVfYm9yZGVyLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnU0VfYm9yZGVyJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9TRV9ib3JkZXIuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdOV19ib3JkZXInLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05XX2JvcmRlci5zdmcnKSk7XHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ1NXX2JvcmRlcicsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvU1dfYm9yZGVyLnN2ZycpKTtcclxuXHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ3BhcnRpY2xlXzEnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvc3BhcmtzLnN2ZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnYmxvb2RfcCcsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9ibG9vZF8yLnBuZycpKTtcclxuXHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ2FoX3NoaXQnLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL2FoX3NoaXQuc3ZnJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdncmF2ZScsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvZ3JhdmUuc3ZnJykpO1xyXG5cclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnc2hhZG93JywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9zaGFkb3cuc3ZnJykpO1xyXG5cclxuXHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3RhdW50XzEnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvdGF1bnRzL2Ntb25feWFfcGFuc3kub3B1cycpKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygndGF1bnRfMicsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy90YXVudHMvaW1faW52aW5jaWJsZS5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCd0YXVudF8zJywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL3RhdW50cy9qdXN0X2FfZmxlc2hfd291bmQub3B1cycpKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygndGF1bnRfNCcsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy90YXVudHMvcmlnaHRfaWxsX2RvX3lhX2Zvcl90aGF0Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3RhdW50XzUnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvdGF1bnRzL3Rpc19idXRfYV9zY3JhdGNoLm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3RhdW50XzYnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvdGF1bnRzL3dlbGxfY2FsbF9pdF9hX2RyYXcub3B1cycpKTtcclxuXHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3ZpY3RvcnknLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvdmljdG9yeV9pc19taW5lLm9wdXMnKSk7XHJcblxyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdzdGVlbF9oaXRfMScsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIHNtYWxsIGtub2NrLm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3N0ZWVsX2hpdF8yJywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gU3dvcmRzbWFsbC5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdzdGVlbF9oaXRfMycsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGxfMS5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdzdGVlbF9oaXRfNCcsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGxfMi5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdzdGVlbF9oaXRfNScsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGxfMy5vcHVzJykpO1xyXG5cclxuXHRcdHRoaXMubG9hZC5hdWRpbygnYm93X2ZpcmUnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvYm93L2Jvd19maXJlLm9wdXMnKSk7XHJcblx0XHRcclxuXHRcdHRoaXMubG9hZC5hdWRpbygnYm93X2hpdF8xJywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDAxLm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ2Jvd19oaXRfMicsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwMi5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdib3dfaGl0XzMnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDMub3B1cycpKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygnYm93X2hpdF80JywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDA0Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ2Jvd19oaXRfNScsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwNS5vcHVzJykpO1xyXG5cdFx0dGhpcy5sb2FkLmF1ZGlvKCdib3dfaGl0XzYnLCByZXF1aXJlKCcuL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDYub3B1cycpKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygnYm93X2hpdF83JywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDA3Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ2Jvd19oaXRfOCcsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwOC5vcHVzJykpO1xyXG5cdFx0XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfMScsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBodXJ0Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfMicsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBNb25zdGVyX0h1cnQub3B1cycpKTtcclxuXHRcdHRoaXMubG9hZC5hdWRpbygncGxheWVyX2hpdF8zJywgcmVxdWlyZSgnLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzLm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfNCcsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBuZXdfaGl0c18yLm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfNScsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBuZXdfaGl0c181Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfNicsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBuZXdfaGl0c184Lm9wdXMnKSk7XHJcblx0XHR0aGlzLmxvYWQuYXVkaW8oJ3BsYXllcl9oaXRfNycsIHJlcXVpcmUoJy4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBuZXdfaGl0c185Lm9wdXMnKSk7XHJcblx0XHRcclxuXHRcdFxyXG4vKlxyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdibG9vZF8xJywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2Jsb29kL2Jsb29kMS5wbmcnKSk7XHJcblx0XHR0aGlzLmxvYWQuaW1hZ2UoJ2Jsb29kXzInLCByZXF1aXJlKCcuL2Fzc2V0cy9pbWFnZXMvYmxvb2QvYmxvb2QyLnBuZycpKTtcclxuXHRcdHRoaXMubG9hZC5pbWFnZSgnYmxvb2RfMycsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9ibG9vZC9ibG9vZDMucG5nJykpO1xyXG5cdFx0dGhpcy5sb2FkLmltYWdlKCdibG9vZF80JywgcmVxdWlyZSgnLi9hc3NldHMvaW1hZ2VzL2Jsb29kL2Jsb29kNC5wbmcnKSk7XHJcbiovXHRcdFxyXG5cdFx0dGhpcy5sb2FkLnNwcml0ZXNoZWV0KCdibG9vZF9zaGVldCcsIHJlcXVpcmUoJy4vYXNzZXRzL2ltYWdlcy9ibG9vZC9ibG9vZF9zcHJpdGVzaGVldC5wbmcnKSwgMjA0OCwgMjA0OCk7XHJcblxyXG5cdFx0bGV0IHRleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCwgdGhpcy53b3JsZC5jZW50ZXJZLCAnbG9hZGluZyBmb250cycsIHtcclxuXHRcdFx0Zm9udDogJzE2cHggQXJpYWwnLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHRcdGFsaWduOiAnY2VudGVyJ1xyXG5cdFx0fSk7XHJcblx0XHR0ZXh0LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcblxyXG5cdFx0dGhpcy5pbnB1dC5nYW1lcGFkLnN0YXJ0KCk7XHJcblx0fVxyXG5cclxuXHRsb2FkZWQgPSAwO1xyXG5cdGNyZWF0ZShnYW1lOiBQaGFzZXIuR2FtZSwgbGFiZWw/OiBzdHJpbmcpIHtcclxuXHRcdGNvbnNvbGUubG9nKCdjcmVhdGUnLCBsYWJlbClcclxuXHRcdHRoaXMubG9hZGVkKys7XHJcblx0XHRpZiAodGhpcy5sb2FkZWQgPj0gMikge1xyXG5cdFx0XHR0aGlzLnN0YXRlLnN0YXJ0KCdzcGxhc2hzY3JlZW4nKTtcclxuXHRcdFx0Ly90aGlzLnN0YXRlLnN0YXJ0KCdnYW1lJyk7XHJcblx0XHR9XHJcblx0fVxyXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbG9hZGluZ1N0YXRlLnRzIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYmZkN2YyZmI5NDg4MzI5ZTlmM2U4Y2ExOTkzMTE4Y2EucG5nXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL211c2hyb29tMi5wbmdcbi8vIG1vZHVsZSBpZCA9IDE3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjFhNTkzZWRiOWE3YzM4ZDUxNzVlOWNmZDgzNzlmNzE1LnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9hcnJvdy5zdmdcbi8vIG1vZHVsZSBpZCA9IDE4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjRlNTY5NWYzMDdmMTdjMDk1MzY1YWIwNzU1NjVlZjY2LnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9heGUuc3ZnXG4vLyBtb2R1bGUgaWQgPSAxOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmYTJmOWQ1Yzc2ZGZlZTEzODZiM2YwNDU1OTg3NWZiYS5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvYm93LnN2Z1xuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiZTIwMGMxNGJhYWM1ODNlNzBiMWEzM2EzMjJiMjUxNGUuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYWluLnN2Z1xuLy8gbW9kdWxlIGlkID0gMjFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiNzdjMDhlMWIwYjExMDgwZTcwNDEwZTk1NzE5NGIxMjcuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL21hY2Uuc3ZnXG4vLyBtb2R1bGUgaWQgPSAyMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJhNGE4MWM3NzY4YmRmNjZmZjc1YzVmMDdiM2NkZGJjYS5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvYXJyb3dfYm9yZGVyLnN2Z1xuLy8gbW9kdWxlIGlkID0gMjNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYjk0ZDkzYjIzZWY2MWUzZGZiZDYxOTk2NjljMWI0MWEuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2F4ZV9ib3JkZXIuc3ZnXG4vLyBtb2R1bGUgaWQgPSAyNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCIzMWJlYWVhMTc3YjdiYzQxNjYxNjUwODQxZmFhMjJjZi5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvYm93X2JvcmRlci5zdmdcbi8vIG1vZHVsZSBpZCA9IDI1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjBhYTIwZjI0N2UzOTc3YmM0MzZlYTk3MTE4MDVmNzMwLnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9jaGFpbl9ib3JkZXIuc3ZnXG4vLyBtb2R1bGUgaWQgPSAyNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJkZGY1MzZkNzE4ZDYyNDg3YzI5NTdkN2VlNTNhNzc3MC5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvbWFjZV9ib3JkZXIuc3ZnXG4vLyBtb2R1bGUgaWQgPSAyN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI1NWJmZTgwNjFkZDE2MjY3NjQ0NTI5YTZiY2M3ODBlMy5wbmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvc3BsYXNoLnBuZ1xuLy8gbW9kdWxlIGlkID0gMjhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiMTI2NzRkNDgwZjMxNWYyYzRhN2M2MjZmZTU4ZWRiODcuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9ORS5zdmdcbi8vIG1vZHVsZSBpZCA9IDI5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImU2MTU1M2VhNTAxODk0ODhiYjUzOWFmZGUwZDU2YzRhLnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvU0Uuc3ZnXG4vLyBtb2R1bGUgaWQgPSAzMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI1NTNkNGJjM2QzNzM0OWRiYjQ2ZmI2ZjAzMmJkZGIzMi5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05XLnN2Z1xuLy8gbW9kdWxlIGlkID0gMzFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiOWVmMzU4ODNmZTFhMWEzNzg3MDVjY2Y0NWQwNGMzZjQuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9TVy5zdmdcbi8vIG1vZHVsZSBpZCA9IDMyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjhmY2U0YTdkNjM5ODhjYTVkYzViNjRmZjliMDdkOWU0LnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvTkVfYm9yZGVyLnN2Z1xuLy8gbW9kdWxlIGlkID0gMzNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYmZjNTAwOWNhNWY2YjRkNTZjNjFkNjI1NWJkOGRkMDAuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9TRV9ib3JkZXIuc3ZnXG4vLyBtb2R1bGUgaWQgPSAzNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI2YmM3ODljMDA2NDhmOGM3MWExMDU4YTk5NTMyZmU4Mi5zdmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvY2hhcmFjdGVyL05XX2JvcmRlci5zdmdcbi8vIG1vZHVsZSBpZCA9IDM1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjBlMTkwMjcwZTA3NjdmMmYzMjU5MDIwMzVlYWU3MGQ1LnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvU1dfYm9yZGVyLnN2Z1xuLy8gbW9kdWxlIGlkID0gMzZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiNmY3ZWQ5YjJmYzE5ZTkyNDk5YzJmNzU1NDE0YjlhNWQuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL3NwYXJrcy5zdmdcbi8vIG1vZHVsZSBpZCA9IDM3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImVjZGViMjE5ZTAxNzg2Y2ExNGE5NDdkNzUyNDc4MjRiLnBuZ1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9ibG9vZF8yLnBuZ1xuLy8gbW9kdWxlIGlkID0gMzhcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiODk5NjEzNDgxZTY2YmZlZjNiNTU3NjU1YTMwMThiM2Iuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9haF9zaGl0LnN2Z1xuLy8gbW9kdWxlIGlkID0gMzlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiMzY4ODQ2OWJmN2U5MDhjNWZjMzlhZWQ2ZjI3ZjE2ZjAuc3ZnXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvaW1hZ2VzL2NoYXJhY3Rlci9ncmF2ZS5zdmdcbi8vIG1vZHVsZSBpZCA9IDQwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjliNmJlZjU0ZGNkMTFlNTAxZjI3ZjFiMWQzNDA3MTljLnN2Z1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL2ltYWdlcy9jaGFyYWN0ZXIvc2hhZG93LnN2Z1xuLy8gbW9kdWxlIGlkID0gNDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiNjgyYTNkYjA4OTEwMTUzNjU0OTE5MDE5MWNmZDI2ODIub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy90YXVudHMvY21vbl95YV9wYW5zeS5vcHVzXG4vLyBtb2R1bGUgaWQgPSA0MlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJjNzNjZDZlNzc1ZmU2YWI3Y2Y3ZTNjMWFjODBlZjMyNS5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3RhdW50cy9pbV9pbnZpbmNpYmxlLm9wdXNcbi8vIG1vZHVsZSBpZCA9IDQzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjE2OTJkZThkMDlhNTkwMTc0ZmQ1YmFiYTc1M2MyNzgxLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvdGF1bnRzL2p1c3RfYV9mbGVzaF93b3VuZC5vcHVzXG4vLyBtb2R1bGUgaWQgPSA0NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmYTlmNjNmNmVhNDQxMTJiZWQ0MDM2NWJkZGVhYWI5Ni5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3RhdW50cy9yaWdodF9pbGxfZG9feWFfZm9yX3RoYXQub3B1c1xuLy8gbW9kdWxlIGlkID0gNDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiOWNmNmUxYmE0NWFjNTZiNGE5MmQzNzU5ODRlYTU5NGIub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy90YXVudHMvdGlzX2J1dF9hX3NjcmF0Y2gub3B1c1xuLy8gbW9kdWxlIGlkID0gNDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYWNhMGEyZjRlNzc1YTk0ZGQzZmZkYzMzY2MxMjJmY2Iub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy90YXVudHMvd2VsbF9jYWxsX2l0X2FfZHJhdy5vcHVzXG4vLyBtb2R1bGUgaWQgPSA0N1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI0YzM5ZTUzMmMyNDVlYzgzZGY2NDQ1OTUxNzE4NmM3MS5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3ZpY3RvcnlfaXNfbWluZS5vcHVzXG4vLyBtb2R1bGUgaWQgPSA0OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCIzMzY5N2U2MWE4NzI3ZDUwMjQ2YTBiN2I3MGMxODY3Zi5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gc21hbGwga25vY2sub3B1c1xuLy8gbW9kdWxlIGlkID0gNDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYjc1MzMxYTEzOGExYzQ1NmFiZGIzYmU3MzRlOTJiYmQub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGwub3B1c1xuLy8gbW9kdWxlIGlkID0gNTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiM2UyZmJhOTdhOTQyNjE5ZDRjN2MwNTI3MGEyNzRhYzAub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9zdGVlbF9oaXQvU29jYXBleCAtIFN3b3Jkc21hbGxfMS5vcHVzXG4vLyBtb2R1bGUgaWQgPSA1MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJmZjI2MjU5YzhlM2IwYWExZjQ3NzBlOTNkNTE0ZmE0NC5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3N0ZWVsX2hpdC9Tb2NhcGV4IC0gU3dvcmRzbWFsbF8yLm9wdXNcbi8vIG1vZHVsZSBpZCA9IDUyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjVhZjRkYTZlYzViOTkwMGEwZjExNzc3NjI3Yzg3M2VjLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvc3RlZWxfaGl0L1NvY2FwZXggLSBTd29yZHNtYWxsXzMub3B1c1xuLy8gbW9kdWxlIGlkID0gNTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiYmNkY2FiNWMyOTg2NTliMmNmMWMwYWI2NDUxZmZkZDEub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9ib3cvYm93X2ZpcmUub3B1c1xuLy8gbW9kdWxlIGlkID0gNTRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiM2RmZTMyM2ZiZDc3MjJhNDVmZDhhZDIzMzBjNThlN2Yub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwMS5vcHVzXG4vLyBtb2R1bGUgaWQgPSA1NVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI4ZmQwMmNiMmI0ZjkxZDgyNjUyMTdkNzUxMDM1OGQxYy5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDAyLm9wdXNcbi8vIG1vZHVsZSBpZCA9IDU2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcIjg1MGUzMDEzNzY2NWMyMmVmMDQ4Yzg4Mjk2OTMwNzZiLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDMub3B1c1xuLy8gbW9kdWxlIGlkID0gNTdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiNWE1MzE0YzAyZjQ1MDBkYmQ1ZGYxMGVhN2RiNzNiNDQub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwNC5vcHVzXG4vLyBtb2R1bGUgaWQgPSA1OFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJkNTZhZDdkZTM1N2M2NGZmZGU0NTJhM2JkNzJmMmI3MS5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDA1Lm9wdXNcbi8vIG1vZHVsZSBpZCA9IDU5XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImY1MzEwZWM1MzAyMjg3ZjMyNDhhOTVlNmVkY2RiMmMyLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvYm93L2Fycm93SGl0MDYub3B1c1xuLy8gbW9kdWxlIGlkID0gNjBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiN2E4MDliYTUwYTlkYTdhNGNjOWVjZTQyZTA3MzUxMzMub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9ib3cvYXJyb3dIaXQwNy5vcHVzXG4vLyBtb2R1bGUgaWQgPSA2MVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJhNmFlOWNjOTZkOWJiOGUyZWNlYjE2MWNlYjlhZjFjZi5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL2Jvdy9hcnJvd0hpdDA4Lm9wdXNcbi8vIG1vZHVsZSBpZCA9IDYyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImQ5ZGZhMGZlOTZlZDIxYmZkNmNhYmRmYzM1ODZmNTcyLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvcGxheWVyX2hpdC9Tb2NhcGV4IC0gaHVydC5vcHVzXG4vLyBtb2R1bGUgaWQgPSA2M1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJiOWI4MjgzNjg4MTIwNDY5ZTczYWI1OWYwMWFmM2Y2Zi5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIE1vbnN0ZXJfSHVydC5vcHVzXG4vLyBtb2R1bGUgaWQgPSA2NFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCI4YzVkYzFmOGM5OTFhYWM1NjlkNTBhZjBhNjQzOTg4Zi5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzLm9wdXNcbi8vIG1vZHVsZSBpZCA9IDY1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImVjZTYwYTVjZTkxYmI3YTFjYmNjODc0ODkwOTFkNjM2Lm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvcGxheWVyX2hpdC9Tb2NhcGV4IC0gbmV3X2hpdHNfMi5vcHVzXG4vLyBtb2R1bGUgaWQgPSA2NlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJlNjU2ZjE0MzA2N2ViODVlYTFlZDk5NzU5M2Q3MDU0ZC5vcHVzXCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9hc3NldHMvc291bmRzL3BsYXllcl9oaXQvU29jYXBleCAtIG5ld19oaXRzXzUub3B1c1xuLy8gbW9kdWxlIGlkID0gNjdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyArIFwiNDBlNzU3ZDFlNzM5NjAzM2E1YTdkNmQyZjkxZTAyZTcub3B1c1wiO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vYXNzZXRzL3NvdW5kcy9wbGF5ZXJfaGl0L1NvY2FwZXggLSBuZXdfaGl0c184Lm9wdXNcbi8vIG1vZHVsZSBpZCA9IDY4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gX193ZWJwYWNrX3B1YmxpY19wYXRoX18gKyBcImU0NjE2MGU2YmU2YzU5YTUwY2FmOGM2YmU0YjNhZThlLm9wdXNcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9zb3VuZHMvcGxheWVyX2hpdC9Tb2NhcGV4IC0gbmV3X2hpdHNfOS5vcHVzXG4vLyBtb2R1bGUgaWQgPSA2OVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJkMjQ4NGI5YzIwZGRjODVkZTE4OTYxOTQ1YTQzNmFhMS5wbmdcIjtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL2Fzc2V0cy9pbWFnZXMvYmxvb2QvYmxvb2Rfc3ByaXRlc2hlZXQucG5nXG4vLyBtb2R1bGUgaWQgPSA3MFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgKiBhcyBQaGFzZXIgZnJvbSAncGhhc2VyLWNlJztcclxuaW1wb3J0ICogYXMgRyBmcm9tICcuL2dsb2JhbHMnO1xyXG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XHJcbmltcG9ydCB7IFdlYXBvblR5cGUgfSBmcm9tICcuL3dlYXBvblR5cGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BsYXNoU2NyZWVuU3RhdGUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cdG1pZGRsZUdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblx0YmFja2dyb3VuZEdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblx0cGxheWVyczogYW55W107XHJcblxyXG5cdHBhZHNUZXh0OiBQaGFzZXIuVGV4dDtcclxuXHRzdGFydFRvUGxheTogUGhhc2VyLlRleHQ7XHJcblx0Y3JlYXRlKCkge1xyXG5cclxuXHRcdHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5QMkpTKTtcclxuXHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IDIwOyBpKyspIHtcclxuXHJcblx0XHRcdC8vVW5kZXJuZWF0aCBCbG9vZFxyXG5cdFx0XHRsZXQgeCA9IE1hdGgucmFuZG9tKCkgKiBHLlJlbmRlcldpZHRoO1xyXG5cdFx0XHRsZXQgeSA9IE1hdGgucmFuZG9tKCkgKiBHLlJlbmRlckhlaWdodDtcclxuXHRcdFx0bGV0IHNwcml0ZSA9IHRoaXMuYWRkLnNwcml0ZSh4LCB5LCAnYmxvb2Rfc2hlZXQnLCAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNCkpKTtcclxuXHRcdFx0c3ByaXRlLmFuY2hvci5zZXQoMC41KTtcclxuXHJcblx0XHRcdC8vQW5nbGUgYmFzZWQgb24gaGl0IGFuZ2xlXHJcblx0XHRcdGxldCBhbmdsZSA9IE1hdGgucmFuZG9tKCkgKiA0O1xyXG5cdFx0XHRzcHJpdGUucm90YXRpb24gPSBhbmdsZTtcclxuXHJcblx0XHRcdGxldCByID0gKCgxMjggKyBNYXRoLnJhbmRvbSgpICogNzApIHwgMCkgKiAweDEwMDAwO1xyXG5cdFx0XHRzcHJpdGUudGludCA9IHIgfCByID4+IDggfCByID4+IDE2O1xyXG5cdFx0XHRzcHJpdGUuc2NhbGUuc2V0KDAuMiArIE1hdGgucmFuZG9tKCkpO1xyXG5cdFx0XHRzcHJpdGUuYWxwaGEgPSAwLjQ7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5iYWNrZ3JvdW5kR3JvdXAgPSB0aGlzLmFkZC5ncm91cCgpO1xyXG5cdFx0dGhpcy5taWRkbGVHcm91cCA9IHRoaXMuYWRkLmdyb3VwKCk7XHJcblxyXG5cdFx0Ly9NYWtlIHN1cmUgdGhpcyBpcyBpbiBncHUgYnkgc2hvd2luZyBpdCBzb21ld2hlcmVcclxuXHRcdGxldCBzcHJpdGUgPSB0aGlzLmFkZC5zcHJpdGUoRy5SZW5kZXJXaWR0aCwgRy5SZW5kZXJIZWlnaHQsICdibG9vZF9zaGVldCcsIDEpO1xyXG4vKlxyXG5cdFx0bGV0IHRpdGxlVGV4dCA9IHRoaXMuYWRkLnRleHQodGhpcy53b3JsZC5jZW50ZXJYLCA2MCwgJ0JsdW50IEZvcmNlIFRyYW5zbWlzc2lvbicsIHtcclxuXHRcdFx0Zm9udDogJzEyMHB4ICcgKyBHLkZvbnROYW1lLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHRcdGFsaWduOiAnY2VudGVyJ1xyXG5cdFx0fSk7Ki9cclxuXHRcdC8vdGl0bGVUZXh0LmFuY2hvci5zZXQoMC41LCAwLjUpO1xyXG5cclxuXHRcdHRoaXMucGFkc1RleHQgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCwgdGhpcy53b3JsZC5oZWlnaHQgLSAxMjAsICdUT0RPJywge1xyXG5cdFx0XHRmb250OiAnNjBweCAnICsgRy5Gb250TmFtZSxcclxuXHRcdFx0ZmlsbDogJyMwMDAwMDAnLFxyXG5cdFx0XHRhbGlnbjogJ2NlbnRlcidcclxuXHRcdH0pO1xyXG5cdFx0dGhpcy5wYWRzVGV4dC5hbmNob3Iuc2V0VG8oMC41LCAwLjUpO1xyXG5cclxuXHRcdHRoaXMuc3RhcnRUb1BsYXkgPSB0aGlzLmFkZC50ZXh0KHRoaXMud29ybGQuY2VudGVyWCwgdGhpcy53b3JsZC5oZWlnaHQgLSA2MCwgJ1ByZXNzIFN0YXJ0IHRvIFBsYXknLCB7XHJcblx0XHRcdGZvbnQ6ICc2MHB4ICcgKyBHLkZvbnROYW1lLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHRcdGFsaWduOiAnY2VudGVyJ1xyXG5cdFx0fSk7XHJcblx0XHR0aGlzLnN0YXJ0VG9QbGF5LmFuY2hvci5zZXRUbygwLjUsIDAuNSk7XHJcblxyXG5cdFx0dGhpcy5hZGQudGV4dCg0MDAsIDUwMCwgXCJBeGUgLyBNYWNlXCIsIHtcclxuXHRcdFx0Zm9udDogJzcwcHggJyArIEcuRm9udE5hbWUsXHJcblx0XHRcdGZpbGw6ICcjMDAwMDAwJyxcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZC50ZXh0KDQwMCwgNTgwLCBcIlNwaW4gd2l0aCBMZWZ0IFN0aWNrXCIsIHtcclxuXHRcdFx0Zm9udDogJzYwcHggJyArIEcuRm9udE5hbWUsXHJcblx0XHRcdGZpbGw6ICcjMDAwMDAwJyxcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZC50ZXh0KDQwMCwgNjQwLCBcIihBKSBTcGluIGhhcmRlclwiLCB7XHJcblx0XHRcdGZvbnQ6ICc2MHB4ICcgKyBHLkZvbnROYW1lLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHR9KVxyXG5cclxuXHRcdGxldCByaWdodFRleHQgPSAxMTAwO1xyXG5cdFx0dGhpcy5hZGQudGV4dChyaWdodFRleHQsIDUwMCAtIDQwLCBcIkJvd1wiLCB7XHJcblx0XHRcdGZvbnQ6ICc3MHB4ICcgKyBHLkZvbnROYW1lLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHR9KVxyXG5cdFx0dGhpcy5hZGQudGV4dChyaWdodFRleHQsIDU4MCAtIDQwLCBcIk1vdmUgd2l0aCBMZWZ0IFN0aWNrXCIsIHtcclxuXHRcdFx0Zm9udDogJzYwcHggJyArIEcuRm9udE5hbWUsXHJcblx0XHRcdGZpbGw6ICcjMDAwMDAwJyxcclxuXHRcdH0pXHJcblx0XHR0aGlzLmFkZC50ZXh0KHJpZ2h0VGV4dCwgNjQwIC0gNDAsIFwiQWltIHdpdGggUmlnaHQgU3RpY2tcIiwge1xyXG5cdFx0XHRmb250OiAnNjBweCAnICsgRy5Gb250TmFtZSxcclxuXHRcdFx0ZmlsbDogJyMwMDAwMDAnLFxyXG5cdFx0fSlcclxuXHRcdHRoaXMuYWRkLnRleHQocmlnaHRUZXh0LCA3MDAgLSA0MCwgXCIoTC9SKSBGaXJlXCIsIHtcclxuXHRcdFx0Zm9udDogJzYwcHggJyArIEcuRm9udE5hbWUsXHJcblx0XHRcdGZpbGw6ICcjMDAwMDAwJyxcclxuXHRcdH0pXHJcblxyXG5cdFx0bGV0IGdvYWwgPSB0aGlzLmFkZC50ZXh0KEcuUmVuZGVyV2lkdGggLyAyLCA4MDAsIFwiWW91IGhhdmUgNiBsaXZlcy4gTGFzdCBQbGF5ZXIgYWxpdmUgd2luc1wiLCB7XHJcblx0XHRcdGZvbnQ6ICc4MHB4ICcgKyBHLkZvbnROYW1lLFxyXG5cdFx0XHRmaWxsOiAnIzAwMDAwMCcsXHJcblx0XHRcdGFsaWduOiAnY2VudGVyJ1xyXG5cdFx0fSlcclxuXHRcdGdvYWwuYW5jaG9yLnNldCgwLjUpO1xyXG5cclxuXHJcblxyXG5cdFx0dGhpcy5wbGF5ZXJzID0gW1xyXG5cdFx0XHRuZXcgUGxheWVyKHRoaXMuZ2FtZSwgdGhpcy5iYWNrZ3JvdW5kR3JvdXAsIHRoaXMubWlkZGxlR3JvdXAsIHRoaXMuZ2FtZS5pbnB1dC5nYW1lcGFkLnBhZDEsIDEwMCwgMTAwLCBXZWFwb25UeXBlLkNoYWluLCB0cnVlKSxcclxuXHRcdFx0bmV3IFBsYXllcih0aGlzLmdhbWUsIHRoaXMuYmFja2dyb3VuZEdyb3VwLCB0aGlzLm1pZGRsZUdyb3VwLCB0aGlzLmdhbWUuaW5wdXQuZ2FtZXBhZC5wYWQyLCBHLlJlbmRlcldpZHRoIC0gMTAwLCAxMDAsIFdlYXBvblR5cGUuQ2hhaW4sIHRydWUpLFxyXG5cdFx0XHRuZXcgUGxheWVyKHRoaXMuZ2FtZSwgdGhpcy5iYWNrZ3JvdW5kR3JvdXAsIHRoaXMubWlkZGxlR3JvdXAsIHRoaXMuZ2FtZS5pbnB1dC5nYW1lcGFkLnBhZDMsIEcuUmVuZGVyV2lkdGggLSAyMDAsIDkwMCwgV2VhcG9uVHlwZS5Td29yZCwgdHJ1ZSksXHJcblx0XHRcdG5ldyBQbGF5ZXIodGhpcy5nYW1lLCB0aGlzLmJhY2tncm91bmRHcm91cCwgdGhpcy5taWRkbGVHcm91cCwgdGhpcy5nYW1lLmlucHV0LmdhbWVwYWQucGFkNCwgMjAwLCA5MDAsIFdlYXBvblR5cGUuU3dvcmQsIHRydWUpLFxyXG5cdFx0XTtcclxuXHJcblxyXG5cdFx0dGhpcy5hZGQuc3ByaXRlKDAsIDAsICdzcGxhc2gnKTtcclxuXHR9XHJcblxyXG5cdHVwZGF0ZSgpIHtcclxuXHRcdHRoaXMucGFkc1RleHQudGV4dCA9IHRoaXMuaW5wdXQuZ2FtZXBhZC5wYWRzQ29ubmVjdGVkICsgJyBQYWRzIENvbm5lY3RlZCc7XHJcblxyXG5cdFx0aWYgKCF0aGlzLmlucHV0LmdhbWVwYWQuZW5hYmxlZCB8fCAhdGhpcy5pbnB1dC5nYW1lcGFkLmFjdGl2ZSkge1xyXG5cdFx0XHR0aGlzLnBhZHNUZXh0LnRleHQgKz0gJy4gUHJlc3MgYSBidXR0b24gdG8gZW5hYmxlIG1heWJlJ1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5zdGFydFRvUGxheS52aXNpYmxlID0gKHRoaXMuaW5wdXQuZ2FtZXBhZC5wYWRzQ29ubmVjdGVkID49IDIpO1xyXG5cclxuXHJcblx0XHRpZiAodGhpcy5zdGFydFRvUGxheS52aXNpYmxlKSB7XHJcblx0XHRcdGlmICh0aGlzLmlucHV0LmdhbWVwYWQucGFkMS5pc0Rvd24oOSkgfHwgdGhpcy5pbnB1dC5nYW1lcGFkLnBhZDIuaXNEb3duKDkpIHx8IHRoaXMuaW5wdXQuZ2FtZXBhZC5wYWQzLmlzRG93big5KSB8fCB0aGlzLmlucHV0LmdhbWVwYWQucGFkNC5pc0Rvd24oOSkpIHtcclxuXHRcdFx0XHR0aGlzLnN0YXRlLnN0YXJ0KCdnYW1lJyk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHsgaWYgKHApIHsgcC51cGRhdGUoKSB9IH0pO1xyXG5cdH1cclxuXHRwcmVSZW5kZXIoKSB7XHJcblx0XHR0aGlzLnBsYXllcnMuZm9yRWFjaChwID0+IHsgaWYgKHApIHsgcC5wcmVSZW5kZXIoKSB9IH0pO1xyXG5cdH1cclxufVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NwbGFzaFNjcmVlblN0YXRlLnRzIl0sInNvdXJjZVJvb3QiOiIifQ==