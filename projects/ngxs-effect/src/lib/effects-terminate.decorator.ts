import { EFFECT_TERMINATE_METADATA } from './constans';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';

export function EffectsTerminate<EClassType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectTerminateMetadataInterface = {
            propertyName,
            metadataName: 'EFFECT_TERMINATE_METADATA',
        };

        if (target.constructor.hasOwnProperty(EFFECT_TERMINATE_METADATA)) {
            target.constructor[EFFECT_TERMINATE_METADATA].push(metadata);
        } else {
            Object.defineProperty(target.constructor, EFFECT_TERMINATE_METADATA, {
                value: [metadata],
            });
        }
    };
}
