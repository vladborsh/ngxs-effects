import { EFFECT_START_METADATA } from './constans';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';

export function EffectsStart<EClassType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectStartMetadataInterface = {
            propertyName,
            metadataName: 'EFFECT_START_METADATA',
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
