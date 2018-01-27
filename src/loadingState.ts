import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';

declare function require(url: string): string;

export default class LoadingState extends Phaser.State {
	init() {
		this.game.stage.backgroundColor = '#ffffff';
		this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.stage.disableVisibilityChange = true;

		//TODO?
	}

	preload() {
		WebFont.load({
			google: {
				families: ['Bangers']
			},
			active: () => this.fontsLoaded()
		})

		this.load.image('mushroom2', require('./assets/images/mushroom2.png'));

		let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' });
		text.anchor.setTo(0.5, 0.5);
	}

	private fontsLoaded() {
		this.state.start('game');
	}
}