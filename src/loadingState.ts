import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';

declare function require(url: string): string;

export default class LoadingState extends Phaser.State {
	init() {
		this.game.stage.backgroundColor = '#eeeeee';
		this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.stage.disableVisibilityChange = true;
	}

	preload() {
		WebFont.load({
			google: {
				families: ['Bangers']
			},
			active: () => this.fontsLoaded()
		})

		this.load.image('mushroom2', require('./assets/images/mushroom2.png'));

		this.load.image('arrow', require('./assets/images/arrow.svg'));
		this.load.image('axe', require('./assets/images/axe.svg'));
		this.load.image('bow', require('./assets/images/bow.svg'));
		this.load.image('chain', require('./assets/images/chain.svg'));
		this.load.image('mace', require('./assets/images/mace.svg'));

		this.load.image('arrow_border', require('./assets/images/arrow_border.svg'));
		this.load.image('axe_border', require('./assets/images/axe_border.svg'));
		this.load.image('bow_border', require('./assets/images/bow_border.svg'));
		this.load.image('chain_border', require('./assets/images/chain_border.svg'));
		this.load.image('mace_border', require('./assets/images/mace_border.svg'));

		this.load.image('NE', require('./assets/images/character/NE.svg'));
		this.load.image('SE', require('./assets/images/character/SE.svg'));
		this.load.image('NW', require('./assets/images/character/NW.svg'));
		this.load.image('SW', require('./assets/images/character/SW.svg'));

		this.load.image('NE_border', require('./assets/images/character/NE_border.svg'));
		this.load.image('SE_border', require('./assets/images/character/SE_border.svg'));
		this.load.image('NW_border', require('./assets/images/character/NW_border.svg'));
		this.load.image('SW_border', require('./assets/images/character/SW_border.svg'));

		this.load.image('particle_1', require('./assets/images/particle_1.png'));
		this.load.image('blood_2', require('./assets/images/blood_2.png'));

		let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' });
		text.anchor.setTo(0.5, 0.5);
	}

	create() {
		console.log('create')
		if (this.fontLoaded) {
			this.state.start('game');
		} else {
			this.graphicsLoaded = true;
		}
	}

	fontLoaded = false;
	graphicsLoaded = false;

	private fontsLoaded() {
		console.log('fonts loaded')
		if (this.graphicsLoaded) {
			this.state.start('game');
		}
	}
}