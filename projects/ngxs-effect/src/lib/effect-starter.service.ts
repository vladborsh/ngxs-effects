import { Injectable, Inject, Optional, Type } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { switchMap, takeUntil, catchError, mergeMap } from 'rxjs/operators';
import { EFFECT_METADATA, FEATURE_EFFECTS, EFFECT_TERMINATE_METADATA, EFFECT_START_METADATA, EFFECTS_ERROR_HANDLER } from './constans';
import { Observable, of, Subject } from 'rxjs';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';
import { EffectErrorHandlerInterface } from './interfaces/effect-error-handler.interface';
import { setMethodTrap, hasMetadata } from './utils';

@Injectable()
export class EffectStarterService {
    constructor(
        private actions$: Actions,
        @Optional() @Inject(FEATURE_EFFECTS) private effectsClasses: Type<any>[],
        @Optional() @Inject(EFFECTS_ERROR_HANDLER) private effectErrorHandler: EffectErrorHandlerInterface,
    ) { }

    start(): void {
        if (!this.effectsClasses) {
            return;
        }

        this.effectsClasses.forEach(target => {
            const effectsMetadata: EffectMetadataInterface<any, any>[] = target.constructor[EFFECT_METADATA];
            const effectsStartMetadata: EffectStartMetadataInterface[] = target.constructor[EFFECT_START_METADATA];
            const effectsTerminateMetadata: EffectTerminateMetadataInterface[] = target.constructor[EFFECT_TERMINATE_METADATA];
            const onStart$ = new Subject<void>();
            const onTerminate$ = new Subject<void>();
            let hasStartHook = false;
            let hasDisposeHook = false;

            if (effectsStartMetadata && effectsStartMetadata.length) {
                effectsStartMetadata
                    .filter(metadata => hasMetadata(metadata, target))
                    .forEach(metadata => {
                        hasStartHook = true;
                        setMethodTrap(target, metadata.propertyName, () => onStart$.next());
                    });
            }

            if (effectsTerminateMetadata && effectsTerminateMetadata.length) {
                effectsTerminateMetadata
                    .filter(metadata => hasMetadata(metadata, target))
                    .forEach(metadata => {
                        hasDisposeHook = true;
                        setMethodTrap(target, metadata.propertyName, () => onTerminate$.next());
                    });
            }

            if (effectsMetadata && effectsMetadata.length) {
                effectsMetadata
                    .filter(metadata => hasMetadata(metadata, target))
                    .forEach(metadata =>
                        this.initEffectsForTarget(
                            metadata,
                            target,
                            hasStartHook ? onStart$ : of(null),
                            onTerminate$,
                        ),
                    );
            }
        });
    }

    private initEffectsForTarget<T>(
        metadata: EffectMetadataInterface<any, any>,
        target: Type<T>,
        onStart$: Observable<void>,
        onDispose$: Observable<void>,
    ): void {
        onStart$
            .pipe(
                switchMap(() =>
                    this.actions$
                        .pipe(
                            ofActionSuccessful(metadata.action),
                            mergeMap(actionObject => {
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
}
