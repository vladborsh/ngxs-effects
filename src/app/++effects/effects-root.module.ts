import { NgModule } from '@angular/core';
import 'reflect-metadata';
import { EffectStarterService } from './effect-starter.service';

@NgModule()
export class NgxsEffectsRootModule {
  constructor(effectStarterService: EffectStarterService) {
    effectStarterService.start();
  }
}

