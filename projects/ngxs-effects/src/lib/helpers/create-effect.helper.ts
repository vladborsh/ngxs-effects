import { Injector, Type } from '@angular/core';

export function createEffects(
    injector: Injector,
    effectGroups: Type<any>[][],
): any[] {
    const mergedEffects: Type<any>[] = [];

    for (const effectGroup of effectGroups) {
        mergedEffects.push(...effectGroup);
    }

    return mergedEffects.map((effect) => injector.get(effect));
}
