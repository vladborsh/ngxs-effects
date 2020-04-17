import { Injectable, Inject, Optional, Type } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { EFFECT_METADATA, FEATURE_EFFECTS, EFFECT_TERMINATE_METADATA, EFFECT_START_METADATA, EFFECTS_ERROR_HANDLER } from './constans';
import { Observable, of, Subject } from 'rxjs';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';
import { EffectErrorHandlerInterface } from './interfaces/effect-error-handler.interface';
import { hasMetadataProp, setMethodTrap } from './utils';

@Injectable()
export class EffectStarterService {
    constructor(
        private actions$: Actions,
        @Optional() @Inject(FEATURE_EFFECTS) private effectsClasses: Type<any>[],
        @Optional() @Inject(EFFECTS_ERROR_HANDLER) private effectErrorHandler: EffectErrorHandlerInterface,
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

                                        if (effectResult && typeof effectResult.subscribe === 'function') {
                                            return effectResult;
                                        } else {
                                            return of(effectResult);
                                        }
                                    }),
                                    catchError((error) => {
                                        console.warn(`Error occurred in [${metadata.propertyName}:${metadata.action.name}] effect`);
                                        console.warn(error);

                                        if (this.effectErrorHandler && typeof this.effectErrorHandler.onError === 'function') {
                                            this.effectErrorHandler.onError(error);
                                        }

                                        return of(null);
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
