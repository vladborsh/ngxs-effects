import { EFFECT_START_METADATA } from './constans';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';

export function EffectsStart<EClassType, ArgsType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ) => {
        const metadata: EffectStartMetadataInterface = {
            propertyName,
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
