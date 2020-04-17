import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxsModule, State, Action, StateContext, Store } from '@ngxs/store';
import { Effect, NgxsEffectsModule, EffectsStart, EffectsTerminate } from '../public-api';
import { EffectStarterService } from '../lib/effect-starter.service';
import { InjectionToken } from '@angular/core';

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
    describe('should start simple effect', () => {
        let result: string = null;

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

        afterEach(() => {
            result = null;
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

    describe('should start several effects', () => {
        let result: string = null;

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

        afterEach(() => {
            result = null;
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
        let result: string = null;

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

        afterEach(() => {
            result = null;
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
        let result: string;

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
});
