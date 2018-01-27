import * as Phaser from 'phaser-ce';
import { DebugRender } from './globals';
import { WeaponType } from './weaponType';

export const MaxTurboTimeSeconds = 3;
export const TurboRechargeSecondsPerSecond = .7;

export const MaxHealth = 100;

const bodyRadius = 30;

const arrowLength = 100;
const arrowWidth = 40;
const arrowSpeed = 80;

const swordLength = 120;
const swordWidth = 40;

export class Player {
	body: Phaser.Physics.P2.Body;
	sprite: Phaser.Sprite;

	chains = new Array<Phaser.Sprite>();
	maceBody: Phaser.Physics.P2.Body;

	arrowForAim: Phaser.Sprite;
	arrow: Phaser.Sprite;

	sword: Phaser.Sprite;

	turboAmount = MaxTurboTimeSeconds;
	turboBar: Phaser.Graphics;

	health = MaxHealth;
	healthBar: Phaser.Graphics;

	allThingsToDestroy = new Array<{ destroy: Function }>();
	constraints = new Array<any>();

	constructor(private game: Phaser.Game, public pad: Phaser.SinglePad, public startX: number, public startY: number, public weaponType: WeaponType) {
		pad.deadZone = 0;

		this.createBody(startX, startY);

		switch (weaponType) {
			case WeaponType.Chain:
				this.createChain();
				break;
			case WeaponType.Arrow:
				this.createArrowAim();
				break;
			case WeaponType.Sword:
				this.createSword();
				break;
		}

		this.turboBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40);
		this.healthBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40);
		this.allThingsToDestroy.push(this.turboBar);
		this.allThingsToDestroy.push(this.healthBar);
	}

	destroy() {
		this.allThingsToDestroy.forEach(t => t.destroy());

		this.constraints.forEach(c => this.game.physics.p2.removeConstraint(c));

		if (this.arrow != null) {
			this.arrow.destroy();
		}
	}

	private createBody(x: number, y: number) {
		this.sprite = this.game.add.sprite(x, y, 'mushroom2');
		this.allThingsToDestroy.push(this.sprite);
		this.game.physics.p2.enable(this.sprite, DebugRender);

		this.body = <Phaser.Physics.P2.Body>this.sprite.body;
		this.body.clearShapes();
		this.body.addCircle(bodyRadius);

		this.body.angularDamping = 1;
		this.body.damping = .999;
		this.body.collideWorldBounds = true;
		//(<any>this.body).gravityScale = 0;

		this.bodyMass = this.body.mass;

		(<any>this.body.data).player = this;
		(<any>this.body.data).isPlayer = true;
	}

	private createChain() {

		//Add the chain
		const maceRadius = 20;

		const chainRadius = 10;
		const chainLength = 10;//5-10

		const chainForce = Number.MAX_VALUE;

		//ChainNoCollide let chainGroup = this.game.physics.p2.createCollisionGroup();

		let lastBody = this.body;
		let lastBodySize = bodyRadius;
		for (let i = 0; i < chainLength; i++) {
			let chainLink = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius, 'chain');
			chainLink.scale.set(0.2);
			this.chains.push(chainLink);
			this.allThingsToDestroy.push(chainLink);
			this.game.physics.p2.enable(chainLink, DebugRender);
			let chainBody = <Phaser.Physics.P2.Body>chainLink.body;
			chainBody.clearShapes();
			chainBody.addCircle(chainRadius * 2);
			//chainBody.addCircle(chainRadius);
			//chainBody.addRectangle(chainRadius, chainRadius * 2)
			chainBody.mass *= 0.1;
			//ChainNoCollide chainBody.setCollisionGroup(chainGroup);
			//chainBody.damping = 0.6;

			//Link to last
			let ctr = this.game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius, undefined, undefined, chainForce);
			this.constraints.push(ctr);
			//if (lastBody != this.body) {
			//	game.physics.p2.createRevoluteConstraint(lastBody, [0, lastBodySize], chainBody, [0, -chainRadius]);
			//}
			//game.physics.p2.createSpring(lastBody, chainBody, lastBodySize + chainRadius, 100);

			//game.physics.p2.createconstraint

			lastBody = chainBody;
			lastBodySize = chainRadius;
		}
		//game.physics.p2.constraint

		//game.physics.p2.createSpring(this.body, lastBody, dist, 4);

		let mace = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize, 'mace');
		mace.scale.set(0.4);
		this.allThingsToDestroy.push(mace);
		this.game.physics.p2.enable(mace, DebugRender);
		this.maceBody = <Phaser.Physics.P2.Body>mace.body;
		this.maceBody.clearShapes();
		this.maceBody.addCircle(maceRadius);
		this.maceBody.mass *= 0.5;
		this.maceBody.fixedRotation = true;
		let ctr = this.game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius, undefined, undefined, chainForce);
		this.constraints.push(ctr);


		(<any>this.maceBody.data).player = this;
		(<any>this.maceBody.data).isWeapon = true;
	}

	private createSword() {
		this.sword = this.game.add.sprite(this.body.x, this.body.y - bodyRadius - swordLength * 0.6, 'axe');
		this.allThingsToDestroy.push(this.sword);
		this.game.physics.p2.enable(this.sword, DebugRender);
		let body = <Phaser.Physics.P2.Body>this.sword.body;

		body.clearShapes();
		let rect = body.addRectangle(swordWidth, swordLength);
		//rect.sensor = true;
		body.mass *= 0.5;

		let ctr = this.game.physics.p2.createRevoluteConstraint(this.body, [0, 0], body, [0, bodyRadius + swordLength * 0.6]);
		this.constraints.push(ctr);


		(<any>body.data).player = this;
		(<any>body.data).isWeapon = true;
	}

	private createArrowAim() {
		this.arrowForAim = this.game.add.sprite(this.body.x, this.body.y, 'bow');
		this.arrowForAim.anchor.set(0.5);
		this.allThingsToDestroy.push(this.arrowForAim);
	}

	private createArrow(rotation: number) {
		this.arrow = this.game.add.sprite(this.body.x, this.body.y, 'arrow');
		this.arrow.scale.set(0.5);

		this.game.physics.p2.enable(this.arrow, DebugRender);
		let body = <Phaser.Physics.P2.Body>this.arrow.body;
		body.damping = 0.5;
		body.angularDamping = 0.5;

		body.clearShapes();
		let rect = body.addRectangle(arrowWidth, arrowLength, 0, 0);
		//TODO: Don't collide with us, once far enough away then collide with us (or time?)

		(<any>body.data).player = this;
		(<any>body.data).isWeapon = true;
		(<any>body.data).isArrow = true;

		this.game.physics.p2.world.disableBodyCollision(body.data, this.body.data);

		let vel = new Phaser.Point(0, -arrowSpeed);
		vel.rotate(0, 0, rotation + Math.PI / 2);
		console.log(vel.x, vel.y);
		body.applyImpulseLocal([vel.x, vel.y], 0, 0);

		body.rotation = rotation - Math.PI / 2;
		//this.arrow.rotation = rotation;
	}

	allowArrowCollection() {
		this.game.physics.p2.world.enableBodyCollision(this.arrow.body.data, this.body.data);
	}

	returnArrow() {
		//this.game.physics.p2.addConstraint(this.spearConstraint);
		this.arrowForAim.visible = true;
		this.holdingArrow = true;

		//Destroy the arrow
		this.arrow.destroy();
		this.arrow = null;
	}

	private updateTurboBar() {
		this.turboBar.x = this.sprite.x - 40;
		this.turboBar.y = this.sprite.y - 40;

		this.turboBar.clear();
		this.turboBar.beginFill(0xffffff);
		this.turboBar.drawRect(-1, -1, 82, 12);
		this.turboBar.endFill();
		this.turboBar.beginFill(0x0000ff);
		this.turboBar.drawRect(0, 0, 80 * this.turboAmount / MaxTurboTimeSeconds, 10);
		this.turboBar.endFill();
	}

	private updateHealthBar() {
		this.healthBar.x = this.sprite.x - 40;
		this.healthBar.y = this.sprite.y - 28;

		this.healthBar.clear();
		this.healthBar.beginFill(0xffffff);
		this.healthBar.drawRect(-1, -1, 82, 12);
		this.healthBar.endFill();
		this.healthBar.beginFill(0xff0000);
		this.healthBar.drawRect(0, 0, 80 * this.health / MaxHealth, 10);
		this.healthBar.endFill();
	}

	takeDamage(damage: number) {
		this.health -= damage;
		if (this.health < 0) {
			this.health = 0;
		}
		console.log('takeDamage', damage);

		let text = this.game.add.text(this.body.x, this.body.y, "" + damage, {
			fontSize: 40 + damage,
			font: 'impact',
			fill: '#ff0000'
		});
		text.anchor.set(0.5);

		//Fade in
		text.alpha = 0;
		text.scale.set(.4);
		this.game.add.tween(text.scale)
			//.from({x: .4, y: .4}, 0)
			.to({ x: 1, y: 1 }, 100, undefined, true);

		this.game.add.tween(text)
			//.from({alpha: 0})
			.to({ alpha: 1 }, 100, undefined, true)
			.chain(this.game.add.tween(text)
				.to({ alpha: 0 }, 600));

		if (damage > 20) {
			this.game.camera.shake(damage * 0.001, 200);
		}
	}

	bodyMass: number;

	//force = Math.random() * 20;
	update() {
		if (!this.pad.connected || this.pad.getButton(Phaser.Gamepad.BUTTON_0) == null) {
			return;
		}

		if (this.health > 0) {
			let scale = 5;

			let elapsedSeconds = this.game.time.elapsed / 1000;
			if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown && this.turboAmount > elapsedSeconds) {
				//console.log('turbo')
				this.turboAmount -= elapsedSeconds;
				scale *= 3;
				this.body.mass = this.bodyMass * 3;
			} else {
				this.turboAmount = Math.min(MaxTurboTimeSeconds, this.turboAmount + elapsedSeconds * TurboRechargeSecondsPerSecond);
				this.body.mass = this.bodyMass;
			}

			if (this.weaponType == WeaponType.Arrow) {
				this.arrowForAim.x = this.sprite.x;
				this.arrowForAim.y = this.sprite.y;
				if (this.holdingArrow) {

					//Point the arrowForAim in the right direction
					let rotation = this.arrowForAim.rotation;
					let vel = new Phaser.Point(this.pad.axis(2), this.pad.axis(3));
					let mag = vel.getMagnitude();
					if (mag > 0.5) {
						vel.normalize();
						rotation = vel.angle(new Phaser.Point());
						this.arrowForAim.rotation = rotation;// - Math.PI / 2;
					} else {
						vel = new Phaser.Point(0, 1);
						vel.rotate(0, 0, this.arrowForAim.rotation);
					}


					if (this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_BUMPER).isDown) {
						this.holdingArrow = false;
						this.arrowForAim.visible = false;

						this.createArrow(rotation);
					}
				}
			}

			this.body.applyImpulseLocal([-this.pad.axis(0) * scale, -this.pad.axis(1) * scale], 0, 0);
		}

		let last = this.body;
		for (var i = 0; i < this.chains.length; i++) {
			let now = this.chains[i];
			let next = (i == this.chains.length - 1) ? this.maceBody : this.chains[i + 1];

			let pt = new Phaser.Point(last.x, last.y);
			let angle = pt.angle(new Phaser.Point(next.x, next.y));
			(<Phaser.Physics.P2.Body>now.body).rotation = angle;// - Math.PI / 2;
			//console.log(angle);
			//debugger;
			last = <any>now;
		}

		this.updateTurboBar();
		this.updateHealthBar();
	}

	holdingArrow = true;
}