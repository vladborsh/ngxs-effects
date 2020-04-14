import { NgModule, ModuleWithProviders, Type } from '@angular/core';
import 'reflect-metadata';
import { EFFECT_METADATA, FEATURE_EFFECTS } from './constans';
import { EffectStarterService } from './effect-starter.service';

@NgModule()
export class NgxsEffectsModule {
  static forFeature(...effectsClasses: Type<any>[]): ModuleWithProviders {
    return {
      ngModule: NgxsEffectsModule,
      providers: [
        EffectStarterService,
        ...effectsClasses.map(effect => ({
          provide: FEATURE_EFFECTS,
          multi: true,
          useClass: effect,
        })),
      ],
    };
  }
}

