import * as Phaser from 'phaser-ce';
import * as WebFont from 'webfontloader';

declare function require(url: string): string;

export default class LoadingState extends Phaser.State {
	init() {
		this.game.stage.backgroundColor = '#eeeeee';
		this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		//this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
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

		this.load.image('target_dummy', require('./assets/images/character/target_dummy.svg'));
		
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

		this.load.image('splash', require('./assets/images/splash.png'));
		
		this.load.image('NE', require('./assets/images/character/NE.svg'));
		this.load.image('SE', require('./assets/images/character/SE.svg'));
		this.load.image('NW', require('./assets/images/character/NW.svg'));
		this.load.image('SW', require('./assets/images/character/SW.svg'));

		this.load.image('NE_border', require('./assets/images/character/NE_border.svg'));
		this.load.image('SE_border', require('./assets/images/character/SE_border.svg'));
		this.load.image('NW_border', require('./assets/images/character/NW_border.svg'));
		this.load.image('SW_border', require('./assets/images/character/SW_border.svg'));

		this.load.image('particle_1', require('./assets/images/sparks.svg'));
		this.load.image('blood_p', require('./assets/images/blood_2.png'));

		this.load.image('ah_shit', require('./assets/images/character/ah_shit.svg'));
		this.load.image('grave', require('./assets/images/character/grave.svg'));

		this.load.image('shadow', require('./assets/images/character/shadow.svg'));


		this.load.audio('taunt_1', require('./assets/sounds/taunts/cmon_ya_pansy.opus'));
		this.load.audio('taunt_2', require('./assets/sounds/taunts/im_invincible.opus'));
		this.load.audio('taunt_3', require('./assets/sounds/taunts/just_a_flesh_wound.opus'));
		this.load.audio('taunt_4', require('./assets/sounds/taunts/right_ill_do_ya_for_that.opus'));
		this.load.audio('taunt_5', require('./assets/sounds/taunts/tis_but_a_scratch.opus'));
		this.load.audio('taunt_6', require('./assets/sounds/taunts/well_call_it_a_draw.opus'));

		this.load.audio('victory', require('./assets/sounds/victory_is_mine.opus'));

		this.load.audio('steel_hit_1', require('./assets/sounds/steel_hit/Socapex - small knock.opus'));
		this.load.audio('steel_hit_2', require('./assets/sounds/steel_hit/Socapex - Swordsmall.opus'));
		this.load.audio('steel_hit_3', require('./assets/sounds/steel_hit/Socapex - Swordsmall_1.opus'));
		this.load.audio('steel_hit_4', require('./assets/sounds/steel_hit/Socapex - Swordsmall_2.opus'));
		this.load.audio('steel_hit_5', require('./assets/sounds/steel_hit/Socapex - Swordsmall_3.opus'));

		this.load.audio('bow_fire', require('./assets/sounds/bow/bow_fire.opus'));
		
		this.load.audio('bow_hit_1', require('./assets/sounds/bow/arrowHit01.opus'));
		this.load.audio('bow_hit_2', require('./assets/sounds/bow/arrowHit02.opus'));
		this.load.audio('bow_hit_3', require('./assets/sounds/bow/arrowHit03.opus'));
		this.load.audio('bow_hit_4', require('./assets/sounds/bow/arrowHit04.opus'));
		this.load.audio('bow_hit_5', require('./assets/sounds/bow/arrowHit05.opus'));
		this.load.audio('bow_hit_6', require('./assets/sounds/bow/arrowHit06.opus'));
		this.load.audio('bow_hit_7', require('./assets/sounds/bow/arrowHit07.opus'));
		this.load.audio('bow_hit_8', require('./assets/sounds/bow/arrowHit08.opus'));
		
		this.load.audio('player_hit_1', require('./assets/sounds/player_hit/Socapex - hurt.opus'));
		this.load.audio('player_hit_2', require('./assets/sounds/player_hit/Socapex - Monster_Hurt.opus'));
		this.load.audio('player_hit_3', require('./assets/sounds/player_hit/Socapex - new_hits.opus'));
		this.load.audio('player_hit_4', require('./assets/sounds/player_hit/Socapex - new_hits_2.opus'));
		this.load.audio('player_hit_5', require('./assets/sounds/player_hit/Socapex - new_hits_5.opus'));
		this.load.audio('player_hit_6', require('./assets/sounds/player_hit/Socapex - new_hits_8.opus'));
		this.load.audio('player_hit_7', require('./assets/sounds/player_hit/Socapex - new_hits_9.opus'));
		
		
/*
		this.load.image('blood_1', require('./assets/images/blood/blood1.png'));
		this.load.image('blood_2', require('./assets/images/blood/blood2.png'));
		this.load.image('blood_3', require('./assets/images/blood/blood3.png'));
		this.load.image('blood_4', require('./assets/images/blood/blood4.png'));
*/		
		this.load.spritesheet('blood_sheet', require('./assets/images/blood/blood_spritesheet.png'), 2048, 2048);

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
			//this.state.start('splashscreen');
			this.state.start('game');
		}
	}
}