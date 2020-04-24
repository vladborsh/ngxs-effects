import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Action, StateContext } from '@ngxs/store';
import { Effect, NgxsEffectsModule } from '../public-api';
import { InjectionToken } from '@angular/core';
import { hasMetadata } from '../lib/utils';
import { EffectMetadataType } from '../lib/config/effect-metadata-type.enum';

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

        it('should not remove original method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(service.a).toBeDefined();
        });

        it('should not redefine original method behavior', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            service.a(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-name');
        });

        it('should set metadata', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({
                propertyName: 'a',
                action: ActionA,
                metadataName: EffectMetadataType.EFFECT_METADATA,
            }, service)).toBeTruthy();
        });
    });

    describe('should set metadata for multiple times decorated method', () => {
        beforeEach(() => {
            class EffectsStub {
                @Effect(ActionA)
                @Effect(ActionB)
                a({payload}: ActionA | ActionB): void {
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

        it('should not remove original method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(service.a).toBeDefined();
        });

        it('should not redefine original method behavior', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            service.a(new ActionA({ id: 'test-id', name: 'test-name'}));
            expect(result).toEqual('test-id');
        });

        it('should set metadata', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({
                propertyName: 'a',
                action: ActionA,
                metadataName: EffectMetadataType.EFFECT_METADATA,
            }, service)).toBeTruthy();
            expect(hasMetadata({
                propertyName: 'a',
                action: ActionB,
                metadataName: EffectMetadataType.EFFECT_METADATA,
            }, service)).toBeTruthy();
        });
    });

});
