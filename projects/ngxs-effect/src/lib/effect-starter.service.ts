import { Injectable, Inject, Optional, Type } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { switchMap, takeUntil } from 'rxjs/operators';
import { EFFECT_METADATA, FEATURE_EFFECTS, EFFECT_TERMINATE_METADATA, EFFECT_START_METADATA } from './constans';
import { Observable, of, Subject } from 'rxjs';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';

@Injectable()
export class EffectStarterService {
  constructor(
    private actions$: Actions,
    @Optional() @Inject(FEATURE_EFFECTS) private effectsClasses: Type<any>[],
  ) { }

  start(): void {
    if (this.effectsClasses) {
      this.effectsClasses.forEach(target => {
        const effectsMetadata: EffectMetadataInterface<any, any>[] = target.constructor[EFFECT_METADATA];
        const effectsStartMetadata: EffectStartMetadataInterface[] = target.constructor[EFFECT_START_METADATA];
        const effectsTerminateMetadata: EffectTerminateMetadataInterface[] = target.constructor[EFFECT_TERMINATE_METADATA];

        const onStart$ = new Subject<void>();
        const onTerminate$ = new Subject<void>();
        let hasStartHook = false;
        let hasDisposeHook = false;

        if (effectsStartMetadata) {
          effectsStartMetadata.forEach(metadata => {
            if (metadata
              && hasMetadataProp(target, metadata.propertyName)
              && typeof target[metadata.propertyName] === 'function'
            ) {
              hasStartHook = true;
              setMethodTrap(target, metadata.propertyName, () => onStart$.next());
            }
          });
        }

        if (effectsTerminateMetadata) {
          effectsTerminateMetadata.forEach(metadata => {
            if (metadata
              && hasMetadataProp(target, metadata.propertyName)
              && typeof target[metadata.propertyName] === 'function'
            ) {
              hasDisposeHook = true;
              setMethodTrap(target, metadata.propertyName, () => onTerminate$.next());
            }
          });
        }

        this.initEffectsForTarget(
          effectsMetadata,
          target,
          hasStartHook ? onStart$ : of(null),
          onTerminate$,
        );
      });
    }
  }

  private initEffectsForTarget<T>(
    effectsMetadata: EffectMetadataInterface<any, any>[],
    target: Type<T>,
    onStart$: Observable<void>,
    onDispose$: Observable<void>,
  ): void {
    effectsMetadata.forEach(metadata => {
      if (metadata
        && hasMetadataProp(target, metadata.propertyName)
        && typeof target[metadata.propertyName] === 'function'
      ) {
        onStart$
          .pipe(
            switchMap(() =>
              this.actions$
                .pipe(
                  ofActionSuccessful(metadata.action),
                  switchMap(actionObject => {
                    const effectResult = target[metadata.propertyName](actionObject);

                    if (effectResult && effectResult['subscribe']) {
                      return effectResult;
                    } else {
                      return of(effectResult);
                    }
                  }),
                  takeUntil(onDispose$),
                )
            )
          )
          .subscribe();
      }
    });
  }
}

function hasMetadataProp<T>(target: Type<T>, propName: string): boolean {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(propName);
}

function setMethodTrap<T>(targetObject: T, trappedKey: string, callback: Function) {
  const originMethod = targetObject[trappedKey];

  Object.getPrototypeOf(targetObject)[trappedKey] = function(...args) {
    const result = originMethod.apply(this, args);
    callback(result);

    return result;
  }
}
