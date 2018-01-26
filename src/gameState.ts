import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';
import { Player } from './player';
import * as G from './globals';


let globalScore = [
	0, 0, 0, 0
];

const ImpactDamageMultiplier = 0.7;

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
			new Player(this.game, this.game.input.gamepad.pad1, 100, 100),
			new Player(this.game, this.game.input.gamepad.pad2, G.RenderWidth - 40, 40),
			//new Player(this.game, this.game.input.gamepad.pad3, 1280 -40, 720 - 40),
			//new Player(this.game, this.game.input.gamepad.pad4, 40, 720 - 40),
		];

		let sprite = this.game.add.sprite(G.RenderWidth / 2, G.RenderHeight / 2);
		this.physics.p2.enable(sprite, G.DebugRender);
		let body = <Phaser.Physics.P2.Body>sprite.body;
		body.clearShapes();
		body.addCircle(30);
		body.damping = 0.6;

		if (globalScore.some(s => s != 0)) {
			this.add.text(1920 / 2, 40, globalScore[0] + ", " + globalScore[1], {
				fontSize: 20,
				fill: '#ff0000'
			});

		}

		this.input.gamepad.start();

		this.physics.p2.onBeginContact.removeAll();
		this.physics.p2.onBeginContact.add((a, b, c, d, e) => {
			if (this.losingPlayer === null) {

				let force: number = 0;
				let p: Player = null;

				if (a.isPlayer && b.isMace && e[0].firstImpact) {
					force = e[0].getVelocityAlongNormal();
					p = a.player;
				}
				if (b.isPlayer && a.isMace && e[0].firstImpact) {
					force = e[0].getVelocityAlongNormal();
					p = b.player;
				}


				if (p) {
					p.takeDamage(force * ImpactDamageMultiplier);

					//check players for death or something
					if (p.health <= 0) {
						let index = this.players.indexOf(p);
						this.losingPlayer = index;

						this.add.text(1920 / 2, 80, "Player " + (this.losingPlayer + 1) + " LOSES", {
							fontSize: 20,
							fill: '#ff0000'
						});
						console.log('----------- gg ----------');
						globalScore[this.losingPlayer]++;
						setTimeout(() => { this.game.state.start('game') }, 1000);
					}
				}
			}
		});
	}

	update() {
		this.players.forEach(p => p.update());
	}
}