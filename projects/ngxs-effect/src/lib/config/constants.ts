import { EffectMetadataType } from './effect-metadata-type.enum';

export const EFFECT_METADATA = Symbol(EffectMetadataType.EFFECT_METADATA);
export const EFFECT_START_METADATA = Symbol(EffectMetadataType.EFFECT_START_METADATA);
export const EFFECT_TERMINATE_METADATA = Symbol(EffectMetadataType.EFFECT_TERMINATE_METADATA);
export const EFFECT_CATCH_ERROR_METADATA = Symbol(EffectMetadataType.EFFECT_CATCH_ERROR_METADATA);
