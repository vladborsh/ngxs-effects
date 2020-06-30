import { TestBed } from '@angular/core/testing';
import { NgxsModule, State, Action, StateContext } from '@ngxs/store';
import { NgxsEffectsModule } from '../public-api';
import { InjectionToken } from '@angular/core';
import { hasMetadata } from '../lib/utils';
import { EffectMetadataType } from '../lib/config/effect-metadata-type.enum';
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

describe('EffectCatchError Decorator', () => {
    let result: string = null;

    afterEach(() => {
        result = null;
    });

    describe('should set simple metadata', () => {
        beforeEach(() => {
            class EffectsStub {
                @EffectsCatchError()
                catchError(error): void {
                    result = error;
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

            expect(service.catchError).toBeDefined();
        });

        it('should not redefine original method behavior', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            service.catchError('test');
            expect(result).toEqual('test');
        });

        it('should set metadata', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({
                propertyName: 'catchError',
                metadataName: EffectMetadataType.EFFECT_CATCH_ERROR_METADATA,
            }, service)).toBeTruthy();
        });
    });

    describe('should set multi metadata if used multiple times', () => {
        beforeEach(() => {
            class EffectsStub {
                @EffectsCatchError()
                catchError1(error): void {
                    result = error;
                }

                @EffectsCatchError()
                catchError2(error): void {
                    result = 'test 2' + error;
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

            expect(hasMetadata({
                propertyName: 'catchError1',
                metadataName: EffectMetadataType.EFFECT_CATCH_ERROR_METADATA,
            }, service)).toBeTruthy();
        });

        it('should set metadata for second method', () => {
            const service = TestBed.get(USER_DEFINED_EFFECT);

            expect(hasMetadata({
                propertyName: 'catchError2',
                metadataName: EffectMetadataType.EFFECT_CATCH_ERROR_METADATA,
            }, service)).toBeTruthy();
        });
    });
});
