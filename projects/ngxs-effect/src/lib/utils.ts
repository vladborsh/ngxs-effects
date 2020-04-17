import { Type } from '@angular/core';

export function hasMetadataProp<T>(target: Type<T>, propName: string): boolean {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(propName);
}

export function setMethodTrap<T extends {}>(targetObject: T, trappedKey: string, callback: (arg: any) => any): void {
    const originMethod = targetObject[trappedKey];

    if (typeof originMethod === 'function') {
        Object.getPrototypeOf(targetObject)[trappedKey] = function(...args) {
            const result = originMethod.apply(this, args);
            callback(result);

            return result;
        };
    }
}
