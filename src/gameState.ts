import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';
import { Player, TimeToDie } from './player';
import * as G from './globals';
import { WeaponType } from './weaponType';
import { Shuffle } from './shuffle';


let globalScore = [
	0, 0, 0, 0
];

const ImpactDamageMultiplier = 0.7;

export default class GameState extends Phaser.State {
	tauntsIndex: number;
	taunts: string[];
	scoreText: Phaser.Text[];
	underBloodGroupForLotsOfBlood: Phaser.Group;
	middleGroup: Phaser.Group;
	overBloodGroup: Phaser.Group;
	splatter: Phaser.Graphics;
	underBloodGroup: Phaser.Group;

	backgroundGroup: Phaser.Group;
	sparkEmitter: Phaser.Particles.Arcade.Emitter;
	players: Player[];
	init() {
		//TODO
		this.losingPlayer = null;


		this.taunts = [
			'taunt_1',
			'taunt_2',
			'taunt_3',
			'taunt_4',
			'taunt_5',
			'taunt_6',
		]
		Shuffle(this.taunts);
		this.tauntsIndex = 0;
	}
	losingPlayer: number = null;

	preload() {
		this.game.camera.shake(0, 0);

		if (!this.splatter) {
			this.splatter = this.game.add.graphics();

		} else {
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
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad1, 200, 200, WeaponType.Sword),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad2, G.RenderWidth - 200, 200, WeaponType.Arrow),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad3, G.RenderWidth - 100, 720 - 40, WeaponType.Chain),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad4, 40, 720 - 40, WeaponType.Chain),
		];


		this.sparkEmitter = this.game.add.emitter(0, 0, 1000);
		//(<any>this.sparkEmitter).blendMode = PIXI.blendModes.DARKEN;
		this.sparkEmitter.setAlpha(1, 0, 400);
		this.sparkEmitter.setRotation(0, 360);
		this.sparkEmitter.setScale(.3, .3, .3, .3)
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

		this.scoreText = [
			this.add.text(80, 80, "0", {
				fontSize: 60,
				fill: '#000000'
			}),
			this.add.text(G.RenderWidth - 80, 80, "0", {
				fontSize: 60,
				fill: '#000000'
			}),
			this.add.text(G.RenderWidth - 80, G.RenderHeight - 80, "0", {
				fontSize: 60,
				fill: '#000000'
			}),
			this.add.text(80, G.RenderHeight - 80, "0", {
				fontSize: 60,
				fill: '#000000'
			})]
		this.scoreText.forEach(s => s.anchor.set(0.5));

		this.input.gamepad.start();

		this.physics.p2.onBeginContact.removeAll();
		this.physics.p2.onBeginContact.add((a, b, c, d, e) => {
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

				if (a.isWeapon && b.isWeapon) {
					let ec = this.getCollisionCenter(e);
					this.sparkEmitter.x = ec.x;
					this.sparkEmitter.y = ec.y;
					this.sparkEmitter.start(true, 400, null, 10);
				}


				let force: number = 0;
				let p: Player = null;
				let weaponBody: any;

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
						if ((!damagingSelf || p.health > force) && p.health > 0) {
							p.takeDamage(force);
							this.drawSplatter(force, a, b, e, p.health == 0);

							//check players for death or something
							if (p.health <= 0) {
								let killerIndex = this.players.indexOf(weaponBody.player);
								let deadIndex = this.players.indexOf(p);

								globalScore[killerIndex]++;
								this.updateScoreText(killerIndex);

								let text = this.add.text(1920 / 2, 80, "Player " + (killerIndex + 1) + " Killed Player " + (deadIndex + 1), {
									fontSize: 20,
									fill: '#ff0000'
								});

								this.add.tween(text)
									.to({}, TimeToDie * 1.5, undefined, true)
									.onComplete.add(() => {
										text.destroy();
										this.replacePlayer(deadIndex);
									});

								this.game.add.audio(this.taunts[this.tauntsIndex]).play();
								this.tauntsIndex = (this.tauntsIndex + 1) % this.taunts.length;
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
			weaponType++;
		}

		this.players[index] = new Player(this.game, this.backgroundGroup, this.middleGroup, this.players[index].pad, x, y, weaponType)
	}

	update() {
		this.players.forEach(p => p.update());
	}

	preRender() {
		this.players.forEach(p => p.preRender());
	}

	drawSplatter(force: number, a, b, e, died: boolean) {

		let ec = this.getCollisionCenter(e);

		var spread = 10 + force * 2;
		let amount = Math.min(10, 3 + force);
		for (let i = 0; i < amount; i++) {
			let xMod = (Math.random() * spread - spread / 2);
			let yMod = (Math.random() * spread - spread / 2);
			let x = ec.x + xMod;
			let y = ec.y + yMod;

			//Underneath Blood
			let sprite = this.add.sprite(x, y, 'blood_2', undefined, this.underBloodGroup);
			sprite.anchor.set(0.5);

			let r = ((128 + Math.random() * 70) | 0) * 0x10000;
			sprite.tint = r;

			const bloodTime = 300;

			let targetScale = (10 + force) / 32;
			sprite.scale.set(0.1);
			this.game.add.tween(sprite.scale)
				.to({ x: targetScale, y: targetScale }, bloodTime, Phaser.Easing.power2, true);

			sprite.alpha = 0.1;
			this.game.add.tween(sprite)
				.to({ alpha: Math.random() * 0.1 + 0.9 }, bloodTime, Phaser.Easing.power2, true);
			//sprite.destroy();//hackerman


			//On top blood
			sprite = this.add.sprite(ec.x, ec.y, 'blood_2', undefined, this.overBloodGroup);
			sprite.anchor.set(0.5);
			sprite.tint = r;

			sprite.scale.set(0.3);
			this.game.add.tween(sprite.scale)
				.to({ x: targetScale, y: targetScale }, bloodTime, Phaser.Easing.power2, true);

			sprite.alpha = 0.9;
			this.game.add.tween(sprite)
				.to({ alpha: 0 }, bloodTime, Phaser.Easing.Cubic.Out, true)
			this.game.add.tween(sprite)
				.to({ x: ec.x + xMod * 3, y: ec.y + yMod * 3 }, bloodTime, Phaser.Easing.Cubic.In, true)
				.onComplete.add(() => {
					sprite.destroy();

					if (this.underBloodGroup.children.length > 500) {
						//console.log("CACHING THE THING TO DO IT FAST");
						this.underBloodGroup.cacheAsBitmap = true;
						this.underBloodGroup = this.game.add.group(this.underBloodGroupForLotsOfBlood);
					}
				});





			//this.splatter.beginFill(r);
			//this.splatter.drawCircle(x, y, 10 + force);
			//this.splatter.endFill();
		}
		//this.splatter.cacheAsBitmap = true;
		//this.underBloodGroup.cacheAsBitmap = true;
	}

	getCollisionCenter(e) {
		//http://www.html5gamedevs.com/topic/26125-p2-physics-contact-point-between-2-bodies/
		let pos = e[0].bodyA.position;
		let pt = e[0].contactPointA;
		let x = this.game.physics.p2.mpxi(pos[0] + pt[0]);
		let y = this.game.physics.p2.mpxi(pos[1] + pt[1]);
		return { x, y };
	}

	updateScoreText(index: number) {
		this.scoreText[index].text = "" + globalScore[index];
	}
}