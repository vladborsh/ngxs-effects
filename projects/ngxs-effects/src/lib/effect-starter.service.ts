import { Injectable, Type, Inject, Optional } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { switchMap, takeUntil, catchError, mergeMap, filter } from 'rxjs/operators';
import { Observable, of, Subject, pipe, OperatorFunction, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';
import { setMethodTrap, hasMetadata } from './utils';
import { ActionContext } from '@ngxs/store/src/actions-stream';
import { EffectCatchErrorMetadataInterface } from './interfaces/effect-catch-error-metadata.interface';
import { EFFECT_METADATA, EFFECT_START_METADATA, EFFECT_CATCH_ERROR_METADATA, EFFECT_TERMINATE_METADATA } from './config/constants';
import { EffectErrorHandlerInterface } from './interfaces/effect-error-handler.interface';
import { EFFECTS_ERROR_HANDLER } from './config/tokens';

@Injectable()
export class EffectStarterService {
    private readonly effectsStorage$ = new BehaviorSubject<any[]>([]);

    constructor(
        private actions$: Actions,
        @Optional() @Inject(EFFECTS_ERROR_HANDLER) private effectErrorHandler: EffectErrorHandlerInterface,
    ) {}

    public next(effectInstance: any): void {
        this.effectsStorage$.next([ ...this.effectsStorage$.getValue(), effectInstance ]);
    }

    public start(): void {
        this.effectsStorage$
            .pipe(
                filter((effectsInstances: any[]) => !!effectsInstances && !!effectsInstances.length),
                switchMap((effectsInstances: any[]) =>
                    combineLatest(
                        effectsInstances.map(effectsInstance => {
                            const effectsMetadata: EffectMetadataInterface<any, any>[] = effectsInstance.constructor[EFFECT_METADATA];
                            const effectsStartMetadata: EffectStartMetadataInterface[] = effectsInstance.constructor[EFFECT_START_METADATA];
                            const effectsTerminateMetadata: EffectTerminateMetadataInterface[] =
                                effectsInstance.constructor[EFFECT_TERMINATE_METADATA];
                            const effectsCatchErrorMetadata: EffectCatchErrorMetadataInterface[] =
                                effectsInstance.constructor[EFFECT_CATCH_ERROR_METADATA];
                            const onStart$ = new Subject<void>();
                            const onTerminate$ = new Subject<void>();
                            let hasStartHook = false;

                            if (effectsStartMetadata && effectsStartMetadata.length) {
                                effectsStartMetadata
                                    .filter(metadata => hasMetadata(metadata, effectsInstance))
                                    .forEach(metadata => {
                                        hasStartHook = true;
                                        setMethodTrap(effectsInstance, metadata.propertyName, () => onStart$.next());
                                    });
                            }

                            if (effectsTerminateMetadata && effectsTerminateMetadata.length) {
                                effectsTerminateMetadata
                                    .filter(metadata => hasMetadata(metadata, effectsInstance))
                                    .forEach(metadata =>
                                        setMethodTrap(effectsInstance, metadata.propertyName, () => onTerminate$.next()),
                                    );
                            }

                            if (effectsMetadata && effectsMetadata.length) {
                                return combineLatest(
                                    effectsMetadata
                                        .filter(metadata => hasMetadata(metadata, effectsInstance))
                                        .map(metadata => this.getEffectSource$(
                                            metadata,
                                            effectsInstance,
                                            hasStartHook ? onStart$ : of(null),
                                            onTerminate$,
                                            effectsCatchErrorMetadata,
                                        )),
                                );
                            }

                            return of(null);
                        })
                    ),
                ),
            )
            .subscribe();
    }

    private getEffectSource$<T>(
        metadata: EffectMetadataInterface<any, any>,
        target: Type<T>,
        onStart$: Observable<void>,
        onDispose$: Observable<void>,
        onCatchErrorHandlers: EffectCatchErrorMetadataInterface[],
    ): Observable<any> {
        return onStart$
            .pipe(
                switchMap(() =>
                    this.actions$
                        .pipe(
                            this.setupActionEffectProcessor(metadata, target, onCatchErrorHandlers),
                            takeUntil(onDispose$),
                        )
                )
            );
    }

    private setupActionEffectProcessor<T, Action>(
        metadata: EffectMetadataInterface<any, any>,
        target: Type<T>,
        onCatchErrorHandlers: EffectCatchErrorMetadataInterface[]
    ): OperatorFunction<ActionContext<Action>, Observable<any>> {
        return pipe(
            ofActionSuccessful(metadata.action),
            mergeMap((actionObject: Action) =>
                this.executeEffect$(actionObject, metadata.propertyName, target)
                    .pipe(
                        catchError((error) => (onCatchErrorHandlers && onCatchErrorHandlers.length)
                            ? this.catchEffectError$(error, target, onCatchErrorHandlers)
                            : throwError(error)),
                    )
            ),
            catchError((error) => this.catchEffectErrorGlobal$(error, metadata.propertyName, metadata.action.name)),
        );
    }

    private executeEffect$<T, Action>(actionObject: Action, propertyName: string, target: Type<T>): Observable<any> {
        try {
            const effectResult = target[propertyName](actionObject);

            if (effectResult && typeof effectResult.subscribe === 'function') {
                return effectResult;
            } else {
                return of(effectResult);
            }
        } catch (error) {
            return throwError(error);
        }
    }

    private catchEffectError$<T>(
        error: Error,
        target: Type<T>,
        onCatchErrorHandlers: EffectCatchErrorMetadataInterface[],
    ): Observable<any> {
        onCatchErrorHandlers
            .filter(catchErrorHandler => target[catchErrorHandler.propertyName])
            .forEach(catchErrorHandler => target[catchErrorHandler.propertyName](error));

        return of(null);
    }

    private catchEffectErrorGlobal$(error: Error, propertyName: string, actionName: string): Observable<any> {
        if (this.effectErrorHandler && typeof this.effectErrorHandler.onError === 'function') {
            this.effectErrorHandler.onError(error);
        } else {
            console.warn(`Error occurred in [${propertyName}:${actionName}] effect`);
            console.warn(error);
        }

        return of(null);
    }
}
