import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Action, StateContext } from '@ngxs/store';
import { NgxsEffectsModule, EffectsTerminate, EffectsStart } from '../public-api';
import { InjectionToken } from '@angular/core';
import { hasMetadata } from '../lib/utils';

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

describe('Effect Decorator', () => {
    let result: string = null;

    afterEach(() => {
        result = null;
    });

    describe('should set simple metadata', () => {
        beforeEach(() => {
            class EffectsStub {
                @EffectsStart()
                start(): void {
                    result = 'test';
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

        it('should not remove original method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(service.start).toBeDefined();
        });

        it('should not redefine original method behavior', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            service.start();
            expect(result).toEqual('test');
        });

        it('should set metadata', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({ propertyName: 'start', metadataName: 'EFFECT_START_METADATA' }, service)).toBeTruthy();
        });
    });

    describe('should set multi metadata if used multiple times', () => {
        beforeEach(() => {
            class EffectsStub {
                @EffectsStart()
                stop(): void {
                    result = 'test';
                }

                @EffectsStart()
                terminate(): void {
                    result = 'test 2';
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

        it('should set metadata for first method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({ propertyName: 'stop', metadataName: 'EFFECT_START_METADATA' }, service)).toBeTruthy();
        });

        it('should set metadata for second method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({ propertyName: 'terminate', metadataName: 'EFFECT_START_METADATA' }, service)).toBeTruthy();
        });
    });
});
