import * as Phaser from 'phaser-ce';
import * as G from './globals';
import { Player } from './player';
import { WeaponType } from './weaponType';

export default class SplashScreenState extends Phaser.State {
	middleGroup: Phaser.Group;
	backgroundGroup: Phaser.Group;
	players: any[];

	padsText: Phaser.Text;
	startToPlay: Phaser.Text;
	create() {

		this.physics.startSystem(Phaser.Physics.P2JS);

		for (var i = 0; i < 20; i++) {

			//Underneath Blood
			let x = Math.random() * G.RenderWidth;
			let y = Math.random() * G.RenderHeight;
			let sprite = this.add.sprite(x, y, 'blood_sheet', (Math.floor(Math.random() * 4)));
			sprite.anchor.set(0.5);

			//Angle based on hit angle
			let angle = Math.random() * 4;
			sprite.rotation = angle;

			let r = ((128 + Math.random() * 70) | 0) * 0x10000;
			sprite.tint = r | r >> 8 | r >> 16;
			sprite.scale.set(0.2 + Math.random());
			sprite.alpha = 0.4;
		}

		this.backgroundGroup = this.add.group();
		this.middleGroup = this.add.group();

		//Make sure this is in gpu by showing it somewhere
		let sprite = this.add.sprite(G.RenderWidth, G.RenderHeight, 'blood_sheet', 1);
/*
		let titleText = this.add.text(this.world.centerX, 60, 'Blunt Force Transmission', {
			font: '120px ' + G.FontName,
			fill: '#000000',
			align: 'center'
		});*/
		//titleText.anchor.set(0.5, 0.5);

		this.padsText = this.add.text(this.world.centerX, this.world.height - 200, 'TODO', {
			font: '80px ' + G.FontName,
			fill: '#000000',
			align: 'center'
		});
		this.padsText.anchor.setTo(0.5, 0.5);

		this.startToPlay = this.add.text(this.world.centerX, this.world.height - 100, 'Press Start to Play', {
			font: '80px ' + G.FontName,
			fill: '#000000',
			align: 'center'
		});
		this.startToPlay.anchor.setTo(0.5, 0.5);

		this.add.text(400, 400, "Axe / Mace", {
			font: '70px ' + G.FontName,
			fill: '#000000',
		})
		this.add.text(400, 480, "Spin with Left Stick", {
			font: '60px ' + G.FontName,
			fill: '#000000',
		})
		this.add.text(400, 540, "(A) Spin harder", {
			font: '60px ' + G.FontName,
			fill: '#000000',
		})

		let rightText = 1100;
		this.add.text(rightText, 400, "Bow", {
			font: '70px ' + G.FontName,
			fill: '#000000',
		})
		this.add.text(rightText, 480, "Move with Left Stick", {
			font: '60px ' + G.FontName,
			fill: '#000000',
		})
		this.add.text(rightText, 540, "Aim with Right Stick", {
			font: '60px ' + G.FontName,
			fill: '#000000',
		})
		this.add.text(rightText, 600, "(L/R) Fire", {
			font: '60px ' + G.FontName,
			fill: '#000000',
		})


		this.players = [
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad1, 100, 100, WeaponType.Chain),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad2, G.RenderWidth - 100, 100, WeaponType.Chain),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad3, G.RenderWidth - 200, 900, WeaponType.Sword),
			new Player(this.game, this.backgroundGroup, this.middleGroup, this.game.input.gamepad.pad4, 200, 900, WeaponType.Sword),
		];
	}

	update() {
		this.padsText.text = this.input.gamepad.padsConnected + ' Pads Connected';

		if (!this.input.gamepad.enabled || !this.input.gamepad.active) {
			this.padsText.text += '. Press a button to enable maybe'
		}
		this.startToPlay.visible = (this.input.gamepad.padsConnected >= 2);


		if (this.startToPlay.visible) {
			if (this.input.gamepad.pad1.isDown(9) || this.input.gamepad.pad2.isDown(9) || this.input.gamepad.pad3.isDown(9) || this.input.gamepad.pad4.isDown(9)) {
				this.state.start('game');
			}
		}

		this.players.forEach(p => { if (p) { p.update() } });
	}
	preRender() {
		this.players.forEach(p => { if (p) { p.preRender() } });
	}
}