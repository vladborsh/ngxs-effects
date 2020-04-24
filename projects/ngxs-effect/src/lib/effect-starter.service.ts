import { Injectable, Inject, Optional, Type } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { switchMap, takeUntil, catchError, mergeMap } from 'rxjs/operators';
import {
    FEATURE_EFFECTS,
    EFFECTS_ERROR_HANDLER
} from './config/constans';
import { Observable, of, Subject, pipe, OperatorFunction } from 'rxjs';
import { EffectMetadataInterface } from './interfaces/effect-metadata.interface';
import { EffectStartMetadataInterface } from './interfaces/effect-start-metadata.interface';
import { EffectTerminateMetadataInterface } from './interfaces/effect-terminate-metadata.interface';
import { EffectErrorHandlerInterface } from './interfaces/effect-error-handler.interface';
import { setMethodTrap, hasMetadata } from './utils';
import { ActionContext } from '@ngxs/store/src/actions-stream';
import { EffectMetadataType } from './config/effect-metadata-type.enum';

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
            const effectsMetadata: EffectMetadataInterface<any, any>[] = target.constructor[EffectMetadataType.EFFECT_METADATA];
            const effectsStartMetadata: EffectStartMetadataInterface[] = target.constructor[EffectMetadataType.EFFECT_START_METADATA];
            const effectsTerminateMetadata: EffectTerminateMetadataInterface[] =
                target.constructor[EffectMetadataType.EFFECT_TERMINATE_METADATA];
            const onStart$ = new Subject<void>();
            const onTerminate$ = new Subject<void>();
            let hasStartHook = false;

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
                    .forEach(metadata =>
                        setMethodTrap(target, metadata.propertyName, () => onTerminate$.next()),
                    );
            }

            if (effectsMetadata && effectsMetadata.length) {
                effectsMetadata
                    .filter(metadata => hasMetadata(metadata, target))
                    .forEach(metadata =>
                        this.setupTargetEffects(
                            metadata,
                            target,
                            hasStartHook ? onStart$ : of(null),
                            onTerminate$,
                        ),
                    );
            }
        });
    }

    private setupTargetEffects<T>(
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
                            this.setupActionEffectProcessor(metadata, target),
                            takeUntil(onDispose$),
                        )
                )
            )
            .subscribe();
    }

    private setupActionEffectProcessor<T, Action>(
        metadata: EffectMetadataInterface<any, any>,
        target: Type<T>,
    ): OperatorFunction<ActionContext<Action>, Observable<any>> {
        return pipe(
            ofActionSuccessful(metadata.action),
            mergeMap((actionObject: Action) => this.executeEffect$(actionObject, metadata.propertyName, target)),
            catchError((error) => this.catchEffectError$(error, metadata.propertyName, metadata.action.name)),
        );
    }

    private executeEffect$<T, Action>(actionObject: Action, propertyName: string, target: Type<T>): Observable<any> {
        const effectResult = target[propertyName](actionObject);

        if (effectResult && typeof effectResult.subscribe === 'function') {
            return effectResult;
        } else {
            return of(effectResult);
        }
    }

    private catchEffectError$(error: Error, propertyName: string, actionName: string): Observable<any> {
        console.warn(`Error occurred in [${propertyName}:${actionName}] effect`);
        console.warn(error);

        if (this.effectErrorHandler && typeof this.effectErrorHandler.onError === 'function') {
            this.effectErrorHandler.onError(error);
        }

        return of(null);
    }
}
