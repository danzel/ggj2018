import 'pixi';
import 'p2';
import * as Phaser from 'phaser-ce';
import './css/reset.css';

import GameState from './gameState';
import LoadingState from './loadingState';
import * as G from './globals';

new GameState();
new LoadingState();
declare function require(filename: string): any;

class SimpleGame {
	game: Phaser.Game;
	logo: Phaser.Sprite;
	cursors: Phaser.CursorKeys;

	constructor() {
		this.game = new Phaser.Game(G.RenderWidth, G.RenderHeight, Phaser.AUTO, "content");

		this.game.state.add('loading', LoadingState);
		this.game.state.add('game', GameState);
		this.game.state.start('loading');
	}
}

const game = new SimpleGame();
