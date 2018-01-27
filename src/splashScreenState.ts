import * as Phaser from 'phaser-ce';
import * as Globals from './globals';

export default class SplashScreenState extends Phaser.State {

	padsText: Phaser.Text;
	startToPlay: Phaser.Text;
	create() {


		this.padsText = this.add.text(this.world.centerX, this.world.height - 300, 'TODO', {
			font: '50px ' + Globals.FontName,
			fill: '#000000',
			align: 'center'
		});
		this.padsText.anchor.setTo(0.5, 0.5);

		this.startToPlay = this.add.text(this.world.centerX, this.world.height - 200, 'Press Start to Play', {
			font: '50px ' + Globals.FontName,
			fill: '#000000',
			align: 'center'
		});
		this.startToPlay.anchor.setTo(0.5, 0.5);
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
	}
}