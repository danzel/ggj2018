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
			custom: {
				families: ['SF Cartoonist Hand']
			},
			active: () => this.create(undefined, 'font')
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

		this.load.image('particle_1', require('./assets/images/sparks.svg'));
		this.load.image('blood_2', require('./assets/images/blood_2.png'));

		this.load.image('ah_shit', require('./assets/images/character/ah_shit.svg'));
		this.load.image('grave', require('./assets/images/character/grave.svg'));

		this.load.image('shadow', require('./assets/images/character/shadow.svg'));


		this.load.audio('taunt_1', require('./assets/sounds/taunts/cmon_ya_pansy.opus'));
		this.load.audio('taunt_2', require('./assets/sounds/taunts/im_invincible.opus'));
		this.load.audio('taunt_3', require('./assets/sounds/taunts/just_a_flesh_wound.opus'));
		this.load.audio('taunt_4', require('./assets/sounds/taunts/right_ill_do_ya_for_that.opus'));
		this.load.audio('taunt_5', require('./assets/sounds/taunts/tis_but_a_scratch.opus'));
		this.load.audio('taunt_6', require('./assets/sounds/taunts/well_call_it_a_draw.opus'));


		let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', {
			font: '16px Arial',
			fill: '#000000',
			align: 'center'
		});
		text.anchor.setTo(0.5, 0.5);

		this.input.gamepad.start();
	}

	loaded = 0;
	create(game: Phaser.Game, label?: string) {
		console.log('create', label)
		this.loaded++;
		if (this.loaded >= 2) {
			this.state.start('splashscreen');
			//this.state.start('game');
		}
	}
}