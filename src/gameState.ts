import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';
import { Player } from './player';
import * as G from './globals';
import { WeaponType } from './weaponType';


let globalScore = [
	0, 0, 0, 0
];

const ImpactDamageMultiplier = 0.7;

export default class GameState extends Phaser.State {
	splatter: Phaser.Graphics;
	players: Player[];
	init() {
		//TODO
		this.losingPlayer = null;
	}
	losingPlayer: number = null;

	preload() {
		this.game.camera.shake(0, 0);

		if (!this.splatter) {
			this.splatter = this.game.add.graphics();
			//this.splatter = this.game.add.bitmapData(G.RenderWidth, G.RenderHeight);
			//this.splatter.addToWorld();
			//this.splatter.fill(255, 255, 255, 1);
			//this.drawSplatter(0,0,0,0);

		} else {
			this.game.add.existing(this.splatter);
		}

		//let text = this.add.text(this.world.centerX, this.world.centerY, 'Loaded, lets go ', { font: '42px Bangers', fill: '#999999', align: 'center' });
		//text.anchor.setTo(0.5, 0.5);

		this.physics.startSystem(Phaser.Physics.P2JS);
		this.physics.p2.setImpactEvents(true);

		//this.physics.p2.gravity.y = 100;
		//this.physics.p2.applyGravity = true;
		this.physics.p2.restitution = 0.4;

		this.players = [
			new Player(this.game, this.game.input.gamepad.pad1, 200, 200, WeaponType.Sword),
			new Player(this.game, this.game.input.gamepad.pad2, G.RenderWidth - 200, 200, WeaponType.Arrow),
			new Player(this.game, this.game.input.gamepad.pad3, G.RenderWidth - 100, 720 - 40, WeaponType.Chain),
			new Player(this.game, this.game.input.gamepad.pad4, 40, 720 - 40, WeaponType.Chain),
		];

		let sprite = this.game.add.sprite(G.RenderWidth / 2, G.RenderHeight / 2);
		this.physics.p2.enable(sprite, G.DebugRender);
		let body = <Phaser.Physics.P2.Body>sprite.body;
		body.clearShapes();
		body.addCircle(30);
		body.damping = 0.6;

		if (globalScore.some(s => s != 0)) {
			this.add.text(1920 / 2, 40, globalScore[0] + ", " + globalScore[1] + ", " + globalScore[2] + ", " + globalScore[3], {
				fontSize: 20,
				fill: '#ff0000'
			});

		}

		this.input.gamepad.start();

		this.physics.p2.onBeginContact.removeAll();
		this.physics.p2.onBeginContact.add((a, b, c, d, e) => {
			//debugger;
			if (this.losingPlayer === null) {

				//Arrow returning
				if (b.isArrow) {
					let tmp = a;
					a = b;
					b = tmp;
				}

				if (a.isArrow) {
					a.player.allowArrowCollection();

					if (b.isPlayer && a.player == b.player) {
						a.player.returnArrow();
						return;
					}
				}


				let force: number = 0;
				let p: Player = null;
				let weaponBody: any;//Phaser.Physics.P2.Body;

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
					} else {
						let damagingSelf = p == weaponBody.player;

						//Don't let players kill themselves
						if (!damagingSelf || p.health > force) {
							p.takeDamage(force);
							this.drawSplatter(force, a, b, e, p.health == 0);

							//check players for death or something
							if (p.health <= 0) {
								let killerIndex = this.players.indexOf(weaponBody.player);
								let deadIndex = this.players.indexOf(p);

								globalScore[killerIndex]++;
								
								let text = this.add.text(1920 / 2, 80, "Player " + (killerIndex + 1) + " Killed Player " + (deadIndex + 1), {
									fontSize: 20,
									fill: '#ff0000'
								});
								this.add.tween(text)
									.to({}, 1000, undefined, true)
									.onComplete.add(() => {
										text.destroy();
										this.replacePlayer(deadIndex);
									});
								/*setTimeout(() => {
									this.splatter.parent.removeChild(this.splatter);
									this.splatter.cacheAsBitmap = true;
									this.game.state.start('game');
								}, 1000);*/


							/*
								let index = this.players.indexOf(p);
								this.losingPlayer = index;

								*/
							}
						}
					}
				}
			}
		});
	}

	replacePlayer(index: number) {
		let x = this.players[index].body.x;
		let y = this.players[index].body.y;
		let oldWeaponType = this.players[index].weaponType;
		this.players[index].destroy();

		//Random weapon type that isn't the one we had before
		let weaponType = Math.floor(Math.random() * (WeaponType.Count - 1));
		if (weaponType >= oldWeaponType) {
			weaponType ++;
		}

		this.players[index] = new Player(this.game, this.players[index].pad, x, y, weaponType)
	}

	update() {
		this.players.forEach(p => p.update());
	}

	drawSplatter(force: number, a, b, e, died: boolean) {

		//http://www.html5gamedevs.com/topic/26125-p2-physics-contact-point-between-2-bodies/
		let pos = e[0].bodyA.position;
		let pt = e[0].contactPointA;
		let cx = this.game.physics.p2.mpxi(pos[0] + pt[0]);
		let cy = this.game.physics.p2.mpxi(pos[1] + pt[1]);

		var spread = 10 + force * 2;
		let amount = Math.min(10, 3 + force);
		for (let i = 0; i < amount; i++) {
			let x = cx + (Math.random() * spread - spread / 2);
			let y = cy + (Math.random() * spread - spread / 2);

			let r = ((128 + Math.random() * 70) | 0) * 0x10000;
			this.splatter.beginFill(r);
			this.splatter.drawCircle(x, y, 10 + force);
			this.splatter.endFill();
		}
		this.splatter.cacheAsBitmap = true;
	}
}