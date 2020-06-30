import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import 'reflect-metadata';
import { FEATURE_EFFECTS } from './config/tokens';
import { EffectStarterService } from './effect-starter.service';

// @dynamic
@NgModule({
    providers: [
        EffectStarterService,
    ],
})
export class NgxsEffectsModule {
    constructor(effectStarterService: EffectStarterService) {
        effectStarterService.start();
    }

    static forFeature(...effectsClasses: Type<any>[]): ModuleWithProviders<NgxsEffectsModule> {
        return {
            ngModule: NgxsEffectsModule,
            providers: [
                ...effectsClasses.map(effect => ({
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    useClass: effect,
                })),
            ],
        };
    }
}

