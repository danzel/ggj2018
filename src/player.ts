import * as Phaser from 'phaser-ce';
import { DebugRender } from './globals';

export class Player {
	body: Phaser.Physics.P2.Body;
	sprite: Phaser.Sprite;

	maceBody: Phaser.Physics.P2.Body;

	constructor(private game: Phaser.Game, private pad: Phaser.SinglePad, x: number, y: number) {

		this.sprite = game.add.sprite(x, y, 'mushroom2');
		game.physics.p2.enable(this.sprite, DebugRender);

		this.body = <Phaser.Physics.P2.Body>this.sprite.body;
		this.body.clearShapes();
		this.body.addCircle(30);

		this.body.angularDamping = 1;
		this.body.damping = .999;
		this.body.collideWorldBounds = true;
		(<any>this.body).gravityScale = 0

		//Add the chain
		const chainRadius = 10;
		const maceRadius = 20;
		const chainLength = 10;//5-10

		const chainForce = Number.MAX_VALUE;

		let lastBody = this.body;
		let lastBodySize = 30;
		for (let i = 0; i < chainLength; i++) {
			let chainLink = game.add.sprite(lastBody.x, lastBody.y + lastBodySize + chainRadius);
			game.physics.p2.enable(chainLink, DebugRender);
			let chainBody = <Phaser.Physics.P2.Body>chainLink.body;
			chainBody.clearShapes();
			chainBody.addCircle(chainRadius);
			chainBody.mass *= 0.1;

			//Link to last
			game.physics.p2.createDistanceConstraint(lastBody, chainBody, lastBodySize + chainRadius, undefined, undefined, chainForce);

			//game.physics.p2.createconstraint

			lastBody = chainBody;
			lastBodySize = chainRadius;
		}

		let mace = game.add.sprite(lastBody.x, lastBody.y + lastBodySize);
		game.physics.p2.enable(mace, DebugRender);
		this.maceBody = <Phaser.Physics.P2.Body>mace.body;
		this.maceBody.clearShapes();
		this.maceBody.addCircle(maceRadius);
		this.maceBody.mass *= 0.5;
		this.maceBody.fixedRotation =true;
		game.physics.p2.createDistanceConstraint(lastBody, this.maceBody, lastBodySize + maceRadius, undefined, undefined, chainForce);

		this.bodyMass = this.body.mass;
		this.maceMass = this.maceBody.mass;

		(<any>this.body.data).player = this;
		(<any>this.body.data).isPlayer = true;
		
		(<any>this.maceBody.data).player = this;
		(<any>this.maceBody.data).isMace = true;
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

		if (this.pad.getButton(Phaser.Gamepad.BUTTON_0).isDown) {
			scale *= 2;
			//this.body.mass = this.bodyMass * 1000;
		//	this.maceBody.mass = this.maceMass * 0.1;
		} else {
			//this.body.mass = this.bodyMass;
		//	this.maceBody.mass = this.maceMass;
		}

		this.body.applyImpulseLocal([-this.pad.axis(0) * scale, -this.pad.axis(1) * scale], 0, 0);

	}
}