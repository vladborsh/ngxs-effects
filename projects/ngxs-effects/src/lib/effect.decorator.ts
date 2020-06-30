import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { Type } from '@angular/core';
import { EffectMetadataType } from './config/effect-metadata-type.enum';
import { EFFECT_METADATA } from './config/constants';

export function Effect<EClassType, ArgsType, ReturnType, ActionObject>(
    ...actions: Type<ActionObject>[]
) {
    return (
        target: EClassType,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(args: ActionObject) => ReturnType>
    ): void => {
        actions.forEach(action => {
            const metadata: EffectMetadataInterface<ArgsType, ActionObject> = {
                action,
                propertyName,
                metadataName: EffectMetadataType.EFFECT_METADATA,
            };

            if (target.constructor.hasOwnProperty(EFFECT_METADATA)) {
                target.constructor[EFFECT_METADATA].push(metadata);
            } else {
                Object.defineProperty(target.constructor, EFFECT_METADATA, {
                    value: [metadata],
                });
            }
        });
    };
}
