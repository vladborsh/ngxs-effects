import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectMetadataType } from './config/effect-metadata-type.enum';
import { EFFECT_START_METADATA } from './config/constants';

export function EffectsStart<EClassType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectStartMetadataInterface = {
            propertyName,
            metadataName: EffectMetadataType.EFFECT_START_METADATA,
        };

        if (target.constructor.hasOwnProperty(EFFECT_START_METADATA)) {
            target.constructor[EFFECT_START_METADATA].push(metadata);
        } else {
            Object.defineProperty(target.constructor, EFFECT_START_METADATA, {
                value: [metadata],
            });
        }
    };
}
