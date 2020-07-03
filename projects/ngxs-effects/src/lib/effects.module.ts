import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import 'reflect-metadata';
import { FEATURE_EFFECTS } from './config/tokens';
import { EffectStarterService } from './effect-starter.service';
import { NgxsEffectsFeatureModule } from './effects-feature.module';
import { NgxsEffectsRootModule } from './effects-root.module';

// @dynamic
@NgModule()
export class NgxsEffectsModule {
    static forFeature(...effectsClasses: Type<any>[]): ModuleWithProviders<NgxsEffectsFeatureModule> {
        return {
            ngModule: NgxsEffectsFeatureModule,
            providers: [
                effectsClasses,
                ...effectsClasses.map(effect => ({
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    useClass: effect,
                })),
            ],
        };
    }

    static forRoot(): ModuleWithProviders<NgxsEffectsRootModule> {
        return {
            ngModule: NgxsEffectsRootModule,
            providers: [
                EffectStarterService,
            ],
        };
    }
}

