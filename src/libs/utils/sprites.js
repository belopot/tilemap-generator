import * as PIXI from 'pixi.js';
import {MonsterType, PropType} from 'libs/generate';
import {TEXTURE_ASSET} from './assets';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

Object.keys(TEXTURE_ASSET).forEach(key => {
  TEXTURE_ASSET[key].sprite = PIXI.Texture.from(
    `${TEXTURE_ASSET[key].path}${key}${TEXTURE_ASSET[key].ext}`,
  );
});

export const tilesSprites = {
  '-2': TEXTURE_ASSET.hole.sprite,
  '-1': TEXTURE_ASSET.edge.sprite,
  0: TEXTURE_ASSET.ground.sprite,
  1: TEXTURE_ASSET.s.sprite,
  2: TEXTURE_ASSET.s.sprite,
  3: TEXTURE_ASSET.s.sprite,
  4: TEXTURE_ASSET.s.sprite,
  5: TEXTURE_ASSET.s.sprite,
  7: TEXTURE_ASSET.s.sprite,
  6: TEXTURE_ASSET.s.sprite,
  8: TEXTURE_ASSET.s.sprite,
  9: TEXTURE_ASSET.s.sprite,
  10: TEXTURE_ASSET.s.sprite,
  11: TEXTURE_ASSET.s.sprite,
  12: TEXTURE_ASSET.s.sprite,
  13: TEXTURE_ASSET.w_e.sprite,
  14: TEXTURE_ASSET.w_e.sprite,
  15: TEXTURE_ASSET.w_e.sprite,
  16: TEXTURE_ASSET.w_e.sprite,
  17: TEXTURE_ASSET.w_e.sprite,
  18: TEXTURE_ASSET.w_e.sprite,
  19: TEXTURE_ASSET.w_e.sprite,
  20: TEXTURE_ASSET.w_e.sprite,
  21: TEXTURE_ASSET.w_e.sprite,
  22: TEXTURE_ASSET.w_e.sprite,
  23: TEXTURE_ASSET.w_e.sprite,
  24: TEXTURE_ASSET.w_e.sprite,
  25: TEXTURE_ASSET.w_e.sprite,
  26: TEXTURE_ASSET.n_ne_e.sprite,
  27: TEXTURE_ASSET.n_ne_e.sprite,
  28: TEXTURE_ASSET.e.sprite,
  29: TEXTURE_ASSET.n_ne_e.sprite,
  30: TEXTURE_ASSET.n_ne_e.sprite,
  31: TEXTURE_ASSET.e.sprite,
  32: TEXTURE_ASSET.n_ne_e.sprite,
  33: TEXTURE_ASSET.e.sprite,
  34: TEXTURE_ASSET.n_nw_w.sprite,
  35: TEXTURE_ASSET.n_nw_w.sprite,
  36: TEXTURE_ASSET.w.sprite,
  37: TEXTURE_ASSET.n_nw_w.sprite,
  38: TEXTURE_ASSET.n_nw_w.sprite,
  39: TEXTURE_ASSET.n_nw_w.sprite,
  40: TEXTURE_ASSET.w.sprite,
  41: TEXTURE_ASSET.w.sprite,
  42: TEXTURE_ASSET.n.sprite,
  43: TEXTURE_ASSET.n.sprite,
  44: TEXTURE_ASSET.ne.sprite,
  45: TEXTURE_ASSET.nw.sprite,
  46: TEXTURE_ASSET.all.sprite,
  47: TEXTURE_ASSET.s.sprite,
};

export const propsSprites = {
  // Traps
  [`${PropType.Peak}`]: TEXTURE_ASSET.peak.sprite,
  // Decor
  [`${PropType.Bone}`]: TEXTURE_ASSET.bone.sprite,
  [`${PropType.Flag}`]: TEXTURE_ASSET.flag.sprite,
  [`${PropType.CrateSilver}`]: TEXTURE_ASSET.crate_silver.sprite,
  [`${PropType.CrateWood}`]: TEXTURE_ASSET.crate_wood.sprite,
  [`${PropType.Handcuff1}`]: TEXTURE_ASSET.handcuff_1.sprite,
  [`${PropType.Handcuff2}`]: TEXTURE_ASSET.handcuff_2.sprite,
  [`${PropType.Lamp}`]: TEXTURE_ASSET.lamp.sprite,
  [`${PropType.Skull}`]: TEXTURE_ASSET.skull.sprite,
  [`${PropType.StonesLarge}`]: TEXTURE_ASSET.stones_large.sprite,
  [`${PropType.StonesSmall}`]: TEXTURE_ASSET.stones_small.sprite,
  [`${PropType.Torch}`]: TEXTURE_ASSET.torch.sprite,
  [`${PropType.WebLeft}`]: TEXTURE_ASSET.web_left.sprite,
  [`${PropType.WebRight}`]: TEXTURE_ASSET.web_right.sprite,
  // Items
  [`${PropType.HealthLarge}`]: TEXTURE_ASSET.health_large.sprite,
  [`${PropType.HealthSmall}`]: TEXTURE_ASSET.health_small.sprite,
  [`${PropType.KeyGold}`]: TEXTURE_ASSET.key_gold.sprite,
  [`${PropType.KeySilver}`]: TEXTURE_ASSET.key_silver.sprite,
  [`${PropType.ManaLarge}`]: TEXTURE_ASSET.mana_large.sprite,
  [`${PropType.ManaSmall}`]: TEXTURE_ASSET.mana_small.sprite,
  // Spawns
  [`${PropType.Ladder}`]: TEXTURE_ASSET.ladder.sprite,
};

export const monstersSprites = {
  [`${MonsterType.Bandit}`]: TEXTURE_ASSET.bandit.sprite,
  [`${MonsterType.CentaurFemale}`]: TEXTURE_ASSET.centaur_female.sprite,
  [`${MonsterType.CentaurMale}`]: TEXTURE_ASSET.centaur_male.sprite,
  [`${MonsterType.MushroomLarge}`]: TEXTURE_ASSET.mushroom_large.sprite,
  [`${MonsterType.MushroomSmall}`]: TEXTURE_ASSET.mushroom_small.sprite,
  [`${MonsterType.Skeleton}`]: TEXTURE_ASSET.skeleton.sprite,
  [`${MonsterType.Troll}`]: TEXTURE_ASSET.troll.sprite,
  [`${MonsterType.Wolf}`]: TEXTURE_ASSET.wolf.sprite,
};
