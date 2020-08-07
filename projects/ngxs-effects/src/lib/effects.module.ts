import { NgModule, ModuleWithProviders, Type, Injector } from '@angular/core';
import 'reflect-metadata';
import { FEATURE_EFFECTS, _FEATURE_EFFECTS, ROOT_EFFECTS, _ROOT_EFFECTS } from './config/tokens';
import { EffectStarterService } from './effect-starter.service';
import { NgxsEffectsFeatureModule } from './effects-feature.module';
import { NgxsEffectsRootModule } from './effects-root.module';
import { Actions } from '@ngxs/store';
import { createEffects } from './helpers/create-effect.helper';

// @dynamic
@NgModule()
export class NgxsEffectsModule {
    static forFeature(...effects: Type<any>[]): ModuleWithProviders<NgxsEffectsFeatureModule> {
        return {
            ngModule: NgxsEffectsFeatureModule,
            providers: [
                effects,
                {
                    provide: _FEATURE_EFFECTS,
                    multi: true,
                    useValue: effects,
                },
                {
                    provide: FEATURE_EFFECTS,
                    multi: true,
                    useFactory: createEffects,
                    deps: [Injector, _FEATURE_EFFECTS],
                },
            ],
        };
    }

    static forRoot(...effects: Type<any>[]): ModuleWithProviders<NgxsEffectsRootModule> {
        return {
            ngModule: NgxsEffectsRootModule,
            providers: [
                Actions,
                EffectStarterService,
                effects,
                {
                    provide: _ROOT_EFFECTS,
                    multi: true,
                    useValue: effects,
                },
                {
                    provide: ROOT_EFFECTS,
                    multi: true,
                    useFactory: createEffects,
                    deps: [Injector, _ROOT_EFFECTS],
                },
            ],
        };
    }
}
