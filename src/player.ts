import * as Phaser from 'phaser-ce';
import { DebugRender } from './globals';

export const MaxTurboTimeSeconds = 3;
export const TurboRechargeSecondsPerSecond = .7;

export const MaxHealth = 100;

export class Player {
	body: Phaser.Physics.P2.Body;
	sprite: Phaser.Sprite;

	maceBody: Phaser.Physics.P2.Body;

	turboAmount = MaxTurboTimeSeconds;
	turboBar: Phaser.Graphics;

	health = MaxHealth;
	healthBar: Phaser.Graphics;

	constructor(private game: Phaser.Game, private pad: Phaser.SinglePad, x: number, y: number) {

		this.createBody(x, y);
		this.createChain();

		this.turboBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40);
		this.healthBar = this.game.add.graphics(this.sprite.x, this.sprite.y - 40);

		(<any>this.body.data).player = this;
		(<any>this.body.data).isPlayer = true;
		(<any>this.maceBody.data).player = this;
		(<any>this.maceBody.data).isMace = true;
	}

	private createBody(x: number, y: number) {
		this.sprite = this.game.add.sprite(x, y, 'mushroom2');
		this.game.physics.p2.enable(this.sprite, DebugRender);

		this.body = <Phaser.Physics.P2.Body>this.sprite.body;
		this.body.clearShapes();
		this.body.addCircle(30);

		this.body.angularDamping = 1;
		this.body.damping = .999;
		this.body.collideWorldBounds = true;
		(<any>this.body).gravityScale = 0;
	}

	private createChain() {
		
		//Add the chain
		const maceRadius = 20;

		const chainRadius = 10;
		const chainLength = 10;//5-10

		const chainForce = Number.MAX_VALUE;

		let lastBody = this.body;
		let lastBodySize = 30;
		for (let i = 0; i < chainLength; i++) {
			let chainLink = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius);
			this.game.physics.p2.enable(chainLink, DebugRender);
			let chainBody = <Phaser.Physics.P2.Body>chainLink.body;
			chainBody.clearShapes();
			chainBody.addCircle(chainRadius);
			chainBody.mass *= 0.1;
			//chainBody.damping = 0.6;

			//Link to last
			this.game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius, undefined, undefined, chainForce);
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

		let mace = this.game.add.sprite(lastBody.x, lastBody.y + lastBodySize);
		this.game.physics.p2.enable(mace, DebugRender);
		this.maceBody = <Phaser.Physics.P2.Body>mace.body;
		this.maceBody.clearShapes();
		this.maceBody.addCircle(maceRadius);
		this.maceBody.mass *= 0.5;
		this.maceBody.fixedRotation = true;
		this.game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius, undefined, undefined, chainForce);

		this.bodyMass = this.body.mass;
		this.maceMass = this.maceBody.mass;
	}

	private updateTurboBar() {
		this.turboBar.x = this.sprite.x - 40;
		this.turboBar.y = this.sprite.y - 40;
		
		this.turboBar.clear();
		this.turboBar.beginFill(0xffffff);
		this.turboBar.drawRect(-1, -1, 82, 12);
		this.turboBar.endFill();
		this.turboBar.beginFill(0xff0000);
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
		this.healthBar.beginFill(0x00ff00);
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
			.to({x : 1, y: 1}, 100, undefined, true);

		this.game.add.tween(text)
			//.from({alpha: 0})
			.to({alpha: 1}, 100, undefined, true)
			.chain(this.game.add.tween(text)
				.to({alpha: 0}, 600));

		if (damage > 20) {
			this.game.camera.shake(damage * 0.001, 200);
		}
	}

	bodyMass: number;
	maceMass: number;

	//force = Math.random() * 20;
	update() {
		if (!this.pad.connected) {
			return;
		}
		let scale = 5;
		/*
				if (this.pad.getButton(Phaser.Gamepad.XBOX360_LEFT_TRIGGER).isDown) {
		
					let bodyPoint = new Phaser.Point(this.body.x, this.body.y);
					let macePoint = new Phaser.Point(this.maceBody.x, this.maceBody.y);
					let angle = bodyPoint.angle(macePoint, true);
		
					let rotated = new Phaser.Point(2, 0).rotate(0, 0, angle + 90, true);
		//debugger;
					this.maceBody.applyImpulseLocal([rotated.x, rotated.y], 0, 0);
		
					this.body.mass = this.bodyMass * 10;
				} else {
					this.body.mass = this.bodyMass;
					
				}*/

		let elapsedSeconds = this.game.time.elapsed / 1000;
		if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown && this.turboAmount > elapsedSeconds) {
			//console.log('turbo')
			this.turboAmount -= elapsedSeconds;
			scale *= 3;
			this.body.mass = this.bodyMass * 3;
			//	this.maceBody.mass = this.maceMass * 0.1;
		} else {
			this.turboAmount = Math.min(MaxTurboTimeSeconds, this.turboAmount + elapsedSeconds * TurboRechargeSecondsPerSecond);
			this.body.mass = this.bodyMass;
			//	this.maceBody.mass = this.maceMass;
		}

		this.body.applyImpulseLocal([-this.pad.axis(0) * scale, -this.pad.axis(1) * scale], 0, 0);

		this.updateTurboBar();
		this.updateHealthBar();
	}
}