import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';
import { EffectMetadataType } from './config/effect-metadata-type.enum';

export function EffectsTerminate<EClassType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectTerminateMetadataInterface = {
            propertyName,
            metadataName: EffectMetadataType.EFFECT_TERMINATE_METADATA,
        };

        if (target.constructor.hasOwnProperty(EffectMetadataType.EFFECT_TERMINATE_METADATA)) {
            target.constructor[EffectMetadataType.EFFECT_TERMINATE_METADATA].push(metadata);
        } else {
            Object.defineProperty(target.constructor, EffectMetadataType.EFFECT_TERMINATE_METADATA, {
                value: [metadata],
            });
        }
    };
}
