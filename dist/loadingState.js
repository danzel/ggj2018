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
var WebFont = require("webfontloader");
var LoadingState = /** @class */ (function (_super) {
    __extends(LoadingState, _super);
    function LoadingState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LoadingState.prototype.init = function () {
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.stage.disableVisibilityChange = true;
        //TODO?
    };
    LoadingState.prototype.preload = function () {
        var _this = this;
        WebFont.load({
            google: {
                families: ['Bangers']
            },
            active: function () { return _this.fontsLoaded(); }
        });
        this.load.image('mushroom2', require('./assets/images/mushroom2.png'));
        var text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' });
        text.anchor.setTo(0.5, 0.5);
    };
    LoadingState.prototype.fontsLoaded = function () {
        this.state.start('game');
    };
    return LoadingState;
}(Phaser.State));
exports.default = LoadingState;
//# sourceMappingURL=loadingState.js.map