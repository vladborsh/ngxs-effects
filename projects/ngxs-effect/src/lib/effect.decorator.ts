import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { Type } from '@angular/core';
import { EffectMetadataType } from './config/effect-metadata-type.enum';

export function Effect<EClassType, ArgsType, ReturnType, ActionObject>(
    action: Type<ActionObject>
) {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        const metadata: EffectMetadataInterface<ArgsType, ActionObject> = {
            action,
            propertyName,
            metadataName: EffectMetadataType.EFFECT_METADATA,
        };

        if (target.constructor.hasOwnProperty(EffectMetadataType.EFFECT_METADATA)) {
            target.constructor[EffectMetadataType.EFFECT_METADATA].push(metadata);
        } else {
            Object.defineProperty(target.constructor, EffectMetadataType.EFFECT_METADATA, {
                value: [metadata],
            });
        }
    };
}
