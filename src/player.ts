import * as Phaser from 'phaser-ce';
import { DebugRender } from './globals';
import * as G from './globals';
import { WeaponType } from './weaponType';

export const MaxTurboTimeSeconds = 3;
export const TurboRechargeSecondsPerSecond = .7;

export const MaxHealth = 100;

export const TimeToDie = 1000;

const bodyRadius = 30;

const arrowLength = 100;
const arrowWidth = 40;
const arrowSpeed = 80;

const swordLength = 120;
const swordWidth = 40;

const shadowOffset = 44;

const deathBubbleOffset = -100;

export class Player {
	body: Phaser.Physics.P2.Body;
	sprite: Phaser.Sprite;
	shadow: Phaser.Sprite;
	deathBubble: Phaser.Sprite;

	chains = new Array<Phaser.Sprite>();
	mace: Phaser.Sprite;
	maceBody: Phaser.Physics.P2.Body;

	arrowForAim: Phaser.Sprite;
	arrow: Phaser.Sprite;

	sword: Phaser.Sprite;

	spriteBg: Phaser.Sprite;
	arrowForAimBg: Phaser.Sprite;
	arrowBg: Phaser.Sprite;
	swordBg: Phaser.Sprite;
	maceBg: Phaser.Sprite;
	chainBgs = new Array<Phaser.Sprite>();

	turboAmount = MaxTurboTimeSeconds;
	turboBar: Phaser.Graphics;

	health = MaxHealth;
	healthBar: Phaser.Graphics;

	allThingsToDestroy = new Array<{ destroy: Function }>();
	constraints = new Array<any>();

	constructor(private game: Phaser.Game, private backgroundGroup: Phaser.Group, private middleGroup: Phaser.Group, public pad: Phaser.SinglePad, public startX: number, public startY: number, public weaponType: WeaponType) {
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

		this.turboBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40, middleGroup);
		this.healthBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40, middleGroup);
		this.allThingsToDestroy.push(this.turboBar);
		this.allThingsToDestroy.push(this.healthBar);
	}

	destroy() {
		this.allThingsToDestroy.forEach(t => t.destroy());

		this.constraints.forEach(c => this.game.physics.p2.removeConstraint(c));

		if (this.arrow != null) {
			this.arrow.destroy();
		}
		if (this.arrowBg) { this.arrowBg.destroy() }
	}

	private createBody(x: number, y: number) {
		this.sprite = this.game.add.sprite(x, y, 'NE', undefined, this.middleGroup);
		this.sprite.scale.set(0.5)
		this.allThingsToDestroy.push(this.sprite);
		this.game.physics.p2.enable(this.sprite, DebugRender);
		this.sprite.anchor.y = 0.4;

		this.shadow = this.game.add.sprite(x, y + shadowOffset, 'shadow', undefined, this.backgroundGroup);
		this.allThingsToDestroy.push(this.shadow);
		this.shadow.anchor.set(0.5);
		this.shadow.scale.set(0.4)


		this.spriteBg = this.game.add.sprite(x, y, 'NE_border', undefined, this.backgroundGroup);
		this.spriteBg.scale.set(0.5);
		this.spriteBg.anchor.set(0.5);
		this.allThingsToDestroy.push(this.spriteBg);
		this.spriteBg.anchor.y = 0.4;

		this.body = <Phaser.Physics.P2.Body>this.sprite.body;
		this.body.clearShapes();
		this.body.addCircle(bodyRadius);

		this.body.fixedRotation = true;
		this.body.angularDamping = 1;
		this.body.damping = .999;
		this.body.collideWorldBounds = true;

		this.bodyMass = this.body.mass;

		(<any>this.body.data).player = this;
		(<any>this.body.data).isPlayer = true;
	}

	private createChain() {

		//Add the chain
		const maceRadius = 20;

		const chainRadius = 10;
		const chainLength = 10;//5-10

		let lastBody = this.body;
		let lastBodySize = bodyRadius;
		for (let i = 0; i < chainLength; i++) {
			let chainLink = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius, 'chain', undefined, this.middleGroup);
			chainLink.scale.set(0.15);
			this.chains.push(chainLink);
			this.allThingsToDestroy.push(chainLink);

			let chainBg = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius, 'chain_border', undefined, this.backgroundGroup);
			chainBg.scale.set(0.15);
			this.chainBgs.push(chainBg);
			this.allThingsToDestroy.push(chainBg);
			chainBg.anchor.set(0.5);

			this.game.physics.p2.enable(chainLink, DebugRender);
			let chainBody = <Phaser.Physics.P2.Body>chainLink.body;
			(<any>chainBody.data).isChain = true;
			chainBody.clearShapes();
			chainBody.addCircle(chainRadius * 2);
			chainBody.mass *= 0.1;

			//Link to last
			let ctr = this.game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius);
			this.constraints.push(ctr);

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

		this.game.physics.p2.enable(this.mace, DebugRender);
		this.maceBody = <Phaser.Physics.P2.Body>this.mace.body;
		this.maceBody.clearShapes();
		this.maceBody.addCircle(maceRadius);
		this.maceBody.mass *= 0.5;
		this.maceBody.fixedRotation = true;
		let ctr = this.game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius);
		this.constraints.push(ctr);


		(<any>this.maceBody.data).player = this;
		(<any>this.maceBody.data).isWeapon = true;
	}

	private createSword() {
		this.sword = this.game.add.sprite(this.body.x, this.body.y - bodyRadius - swordLength * 0.6, 'axe', undefined, this.middleGroup);
		this.swordBg = this.game.add.sprite(this.body.x, this.body.y - bodyRadius - swordLength * 0.6, 'axe_border', undefined, this.backgroundGroup);
		this.swordBg.anchor.set(0.5);
		this.allThingsToDestroy.push(this.sword);
		this.allThingsToDestroy.push(this.swordBg);

		this.game.physics.p2.enable(this.sword, DebugRender);
		let body = <Phaser.Physics.P2.Body>this.sword.body;

		body.clearShapes();
		let rect = body.addRectangle(swordWidth, swordLength);
		body.mass *= 0.5;

		let ctr = this.game.physics.p2.createRevoluteConstraint(this.body, [0, 0], body, [0, bodyRadius + swordLength * 0.6]);
		this.constraints.push(ctr);


		(<any>body.data).player = this;
		(<any>body.data).isWeapon = true;
	}

	private createArrowAim() {
		this.arrowForAim = this.game.add.sprite(this.body.x, this.body.y, 'bow', undefined, this.middleGroup);
		this.arrowForAim.anchor.set(0.5);
		this.allThingsToDestroy.push(this.arrowForAim);

		this.arrowForAimBg = this.game.add.sprite(this.body.x, this.body.y, 'bow_border', undefined, this.backgroundGroup);
		this.arrowForAimBg.anchor.set(0.5);
		this.allThingsToDestroy.push(this.arrowForAimBg);
	}

	private createArrow(rotation: number) {
		this.arrow = this.game.add.sprite(this.body.x, this.body.y, 'arrow', undefined, this.middleGroup);
		this.arrow.scale.set(0.8);

		this.arrowBg = this.game.add.sprite(this.body.x, this.body.y, 'arrow_border', undefined, this.backgroundGroup);
		this.arrowBg.scale.set(0.8);
		this.arrowBg.anchor.set(0.5);

		this.game.physics.p2.enable(this.arrow, DebugRender);
		let body = <Phaser.Physics.P2.Body>this.arrow.body;
		body.damping = 0.5;
		body.angularDamping = 0.5;

		body.clearShapes();
		let rect = body.addRectangle(arrowWidth, arrowLength, 0, 0);

		(<any>body.data).player = this;
		(<any>body.data).isWeapon = true;
		(<any>body.data).isArrow = true;

		this.game.physics.p2.world.disableBodyCollision(body.data, this.body.data);

		let vel = new Phaser.Point(0, -arrowSpeed);
		vel.rotate(0, 0, rotation + Math.PI / 2);
		body.applyImpulseLocal([vel.x, vel.y], 0, 0);

		body.rotation = rotation - Math.PI / 2;

		this.game.add.audio('bow_fire').play();
	}

	allowArrowCollection() {
		this.game.physics.p2.world.enableBodyCollision(this.arrow.body.data, this.body.data);
	}

	returnArrow() {
		this.arrowForAim.visible = true;
		this.arrowForAimBg.visible = true;
		this.holdingArrow = true;

		//Destroy the arrow
		this.arrow.destroy();
		this.arrow = null;
		this.arrowBg.destroy();
		this.arrowBg = null;
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
		//damage = this.health;
		this.health -= damage;
		if (this.health < 0) {
			this.health = 0;
		}

		let text = this.game.add.text(this.body.x, this.body.y, "" + damage, {
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
			let timeToDie = TimeToDie * 0.7;

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
	}

	bodyMass: number;


	wasHoldingBumper = false;

	update() {
		if (!this.pad.connected || this.pad.getButton(Phaser.Gamepad.BUTTON_0) == null) {
			return;
		}

		if (this.health > 0) {
			let scale = 5;

			let elapsedSeconds = this.game.time.elapsed / 1000;
			if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown && this.turboAmount > elapsedSeconds) {
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
						this.arrowForAim.rotation = rotation;
					} else {
						vel = new Phaser.Point(0, 1);
						vel.rotate(0, 0, this.arrowForAim.rotation);
					}

					let bumperIsDown = [
						this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_BUMPER).isDown, 
						this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_BUMPER).isDown, 
						this.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER).isDown, 
						this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER).isDown
					].some(a => a);

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
	}

	preRender() {
		let last = this.body;
		for (var i = 0; i < this.chains.length; i++) {
			let now = this.chains[i];
			let next = (i == this.chains.length - 1) ? this.maceBody : this.chains[i + 1];

			let pt = new Phaser.Point(last.x, last.y);
			let angle = pt.angle(new Phaser.Point(next.x, next.y));
			(<Phaser.Physics.P2.Body>now.body).rotation = angle;
			last = <any>now;
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
		for (let i = 0; i < this.chains.length; i++) {
			this.copyPasta(this.chainBgs[i], this.chains[i]);
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
	}

	private setSprite(dir: string) {
		this.sprite.loadTexture(dir);
		this.spriteBg.loadTexture(dir + '_border');
	}

	private copyPasta(dest: Phaser.Sprite, source: Phaser.Sprite) {
		dest.x = source.x;
		dest.y = source.y;
		dest.rotation = source.rotation;
		dest.updateTransform();
	}

	holdingArrow = true;
}