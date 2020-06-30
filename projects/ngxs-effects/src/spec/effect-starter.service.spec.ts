import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, State, Action, StateContext, Store } from '@ngxs/store';
import {
    Effect,
    NgxsEffectsModule,
    EffectsStart,
    EffectsTerminate,
    EFFECTS_ERROR_HANDLER,
    EffectErrorHandlerInterface,
} from '../public-api';
import { EffectStarterService } from '../lib/effect-starter.service';
import { InjectionToken } from '@angular/core';
import { tap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { EffectsCatchError } from '../lib/effect-catch-error.decorator';

class ActionA {
    static type = 'Action A';
    constructor(public payload: { id: string; name: string}) {}
}

class ActionB {
    static type = 'Action B';
    constructor(public payload: { id: string }) {}
}

const USER_DEFINED_EFFECT = new InjectionToken('USER_DEFINED_EFFECT');

@State<Record<string, any>>({
    name: 'state',
})
class StateStub {
    @Action(ActionA)
    a(context: StateContext<Record<string, any>>, {payload}: ActionA): void {
        context.setState({ ...context.getState(), [payload.id]: payload });
    }

    @Action(ActionB)
    b(context: StateContext<Record<string, any>>, {payload}: ActionA): void {
        context.setState({ ...context.getState(), [payload.id]: null });
    }
}

describe('EffectStarterService', () => {
    let result: string = null;

    afterEach(() => {
        result = null;
    });

    describe('should start simple effect', () => {

        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a({payload}: ActionA): void {
                    result = payload.name;
                }
            }

            TestBed.configureTestingModule({
                providers: [{ provide: USER_DEFINED_EFFECT, useClass: EffectsStub }],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should inject', () => {
            const effectStarterService = TestBed.get(EffectStarterService);
            expect(effectStarterService).toBeDefined();
        });

        it('should trigger effects on specific actions', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-name');
        });

        it('should not interrupt action processing', fakeAsync(() => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            let selectResult;
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': { id: 'test-id', name: 'test-name'} } });
        }));
    });

    describe('should start observable effect', () => {
        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a({payload}: ActionA): Observable<any> {
                    return of(payload.name)
                        .pipe(
                            tap(value => result = value),
                        );
                }
            }

            TestBed.configureTestingModule({
                providers: [{ provide: USER_DEFINED_EFFECT, useClass: EffectsStub }],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should trigger effects on specific actions', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-name');
        });

        it('should not interrupt action processing', fakeAsync(() => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            let selectResult;
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': { id: 'test-id', name: 'test-name'} } });
        }));
    });

    describe('should start several effects in service', () => {

        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a({payload}: ActionA): void {
                    result = payload.name;
                }

                @Effect(ActionB)
                b({payload}: ActionB): void {
                    result = payload.id;
                }
            }

            TestBed.configureTestingModule({
                providers: [{ provide: USER_DEFINED_EFFECT, useClass: EffectsStub }],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should trigger effects on specific actions', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            store.dispatch(new ActionB({ id: 'test-id-2' }));
            expect(result).toEqual('test-id-2');
        });

        it('should not interrupt action processing', fakeAsync(() => {
            const store: Store = TestBed.get(Store);
            let selectResult;
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': { id: 'test-id', name: 'test-name'} } });
            store.dispatch(new ActionB({ id: 'test-id' }));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': null } });
        }));
    });

    describe('should start effects processing after effect init invocation', () => {

        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a({payload}: ActionA): void {
                    result = payload.name;
                }

                @EffectsStart()
                start(): void {}
            }

            TestBed.configureTestingModule({
                providers: [{ provide: USER_DEFINED_EFFECT, useClass: EffectsStub }],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should not trigger effects on specific actions if init method was not invoked', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toBeNull();
        });

        it('should trigger effects on specific actions if init method was invoked', () => {
            const store: Store = TestBed.get(Store);
            const effects = TestBed.get(USER_DEFINED_EFFECT);
            effects.start();
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-name');
        });

        it('should not interrupt action processing', fakeAsync(() => {
            const store: Store = TestBed.get(Store);
            let selectResult;
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': { id: 'test-id', name: 'test-name'} } });
            store.dispatch(new ActionB({ id: 'test-id' }));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': null } });
        }));
    });

    describe('should stop effects processing after effect terminate invocation', () => {
        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a({payload}: ActionA): void {
                    result = payload.name;
                }

                @EffectsTerminate()
                terminate(): void {}
            }

            TestBed.configureTestingModule({
                providers: [{ provide: USER_DEFINED_EFFECT, useClass: EffectsStub }],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should trigger effects as it is if terminate method was not invoked', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-name');
        });

        it('should not trigger effects if terminate method was invoked', () => {
            const store: Store = TestBed.get(Store);
            const effects = TestBed.get(USER_DEFINED_EFFECT);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            effects.terminate();
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name-2'}));
            expect(result).toEqual('test-name');
        });

        it('should not interrupt action processing', fakeAsync(() => {
            const store: Store = TestBed.get(Store);
            let selectResult;
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': { id: 'test-id', name: 'test-name'} } });
            store.dispatch(new ActionB({ id: 'test-id' }));
            store.select(state => state)
                .subscribe(state => selectResult = state);
            tick();
            expect(selectResult).toEqual({ state: { 'test-id': null } });
        }));
    });

    describe('should notify error handler about errors', () => {
        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a(): void {
                    throw new Error('test-error');
                }

                @EffectsCatchError()
                catchError(error): void {
                    result = error.message;
                }
            }

            TestBed.configureTestingModule({
                providers: [
                    { provide: USER_DEFINED_EFFECT, useClass: EffectsStub },
                ],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should catch errors with error catcher decorated method', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-error');
        });
    });

    describe('should notify custom global error handler about errors', () => {
        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a(): void {
                    throw new Error('test-error');
                }
            }

            class ErrorHandlerStub implements EffectErrorHandlerInterface {
                onError(error: Error): void {
                    result = error.message;
                }
            }

            TestBed.configureTestingModule({
                providers: [
                    { provide: USER_DEFINED_EFFECT, useClass: EffectsStub },
                    { provide: EFFECTS_ERROR_HANDLER, useClass: ErrorHandlerStub },
                ],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should catch errors with custom error handler', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-error');
        });
    });

    describe('should notify notify in condole about errors if custom global error handler not found', () => {
        const error = new Error('test-error');
        let errorResult: Error;

        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                a(): void {
                    throw error;
                }
            }

            window.console.warn = (errorObj: any): void => errorResult = errorObj;

            TestBed.configureTestingModule({
                providers: [
                    { provide: USER_DEFINED_EFFECT, useClass: EffectsStub },
                ],
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(EffectsStub),
                ],
            });
        });

        it('should notify', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(errorResult).toEqual(error);
        });
    });

    describe('should correctly works without any effects', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [
                    NgxsModule.forRoot([StateStub]),
                    NgxsEffectsModule,
                    NgxsEffectsModule.forFeature(),
                ],
            });
        });

        it('should not trigger any effects', () => {
            const store: Store = TestBed.get(Store);
            store.dispatch(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual(null);
        });
    });
});
