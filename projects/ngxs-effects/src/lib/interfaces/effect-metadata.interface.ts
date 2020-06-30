import { EffectMetadataType } from '../config/effect-metadata-type.enum';

export interface EffectMetadataInterface<ArgsType, ActionObject> {
    action: new (...args: ArgsType[]) => ActionObject;
    propertyName: string;
    metadataName: EffectMetadataType.EFFECT_METADATA;
}
