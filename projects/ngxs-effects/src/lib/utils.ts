import { Type } from '@angular/core';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';

export function hasMetadataProp<T>(target: Type<T>, propName: string): boolean {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(propName);
}

export function setMethodTrap<T extends {}>(targetObject: T, trappedKey: string, callback: (arg: any) => any): void {
    const originMethod = targetObject[trappedKey];

    Object.getPrototypeOf(targetObject)[trappedKey] = function(...args) {
        const result = originMethod.apply(this, args);
        callback(result);

        return result;
    };
}

export function hasMetadata<T, Args, A>(
    metadata: EffectMetadataInterface<Args, A> | EffectStartMetadataInterface | EffectTerminateMetadataInterface, target: Type<T>
): boolean {
    return metadata && hasMetadataProp(target, metadata.propertyName);
}
