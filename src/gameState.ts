import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';
import { Player } from './player';
import { DebugRender } from './globals';


let globalScore = [
	0, 0, 0, 0
];

export default class GameState extends Phaser.State {
	players: Player[];
	init() {
		//TODO
		this.losingPlayer = null;
	}
	losingPlayer: number = null;

	preload() {
		let text = this.add.text(this.world.centerX, this.world.centerY, 'Loaded, lets go ', { font: '42px Bangers', fill: '#dddddd', align: 'center' });
		text.anchor.setTo(0.5, 0.5);

		this.physics.startSystem(Phaser.Physics.P2JS);
		this.physics.p2.setImpactEvents(true);

		this.physics.p2.gravity.y = 100;
		this.physics.p2.applyGravity = true;

		this.players = [
			new Player(this.game, this.game.input.gamepad.pad1, 40, 40),
			new Player(this.game, this.game.input.gamepad.pad2, 1280 - 40, 40),
			//new Player(this.game, this.game.input.gamepad.pad3, 1280 -40, 720 - 40),
			//new Player(this.game, this.game.input.gamepad.pad4, 40, 720 - 40),
		];

		if (globalScore.some(s => s != 0)) {
			this.add.text(1920 / 2, 40, globalScore[0] + ", " + globalScore[1], {
				fontSize: 20,
				fill: '#ff0000'
			});

		}

		this.input.gamepad.start();

		this.physics.p2.onBeginContact.add((a, b, c, d, e) => {
			if (this.losingPlayer === null) {
				if (a.isPlayer && b.isMace) {
					this.losingPlayer = this.players.indexOf(a.player)
				}
				if (b.isPlayer && a.isMace) {
					this.losingPlayer = this.players.indexOf(b.player)
				}

				if (this.losingPlayer !== null) {
					this.add.text(1920 / 2, 80, "Player " + this.losingPlayer + " LOSES", {
						fontSize: 20,
						fill: '#ff0000'
					});
					globalScore[this.losingPlayer]++;
					setTimeout(() => { this.game.state.start('game')}, 1000);
				}
			}
		});
	}

	update() {
		this.players.forEach(p => p.update());
	}
}