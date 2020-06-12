import { EffectCatchErrorMetadataInterface } from './interfaces/effect-catch-error-metadata.interface';
import { EffectMetadataType } from './config/effect-metadata-type.enum';
import { EFFECT_CATCH_ERROR_METADATA } from './config/constants';

export function EffectsCatchError<EClassType, ReturnType, ActionObject>() {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectCatchErrorMetadataInterface = {
            propertyName,
            metadataName: EffectMetadataType.EFFECT_CATCH_ERROR_METADATA,
        };

        if (target.constructor.hasOwnProperty(EFFECT_CATCH_ERROR_METADATA)) {
            target.constructor[EFFECT_CATCH_ERROR_METADATA].push(metadata);
        } else {
            Object.defineProperty(target.constructor, EFFECT_CATCH_ERROR_METADATA, {
                value: [metadata],
            });
        }
    };
}
