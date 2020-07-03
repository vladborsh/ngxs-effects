import { NgModule } from '@angular/core';
import { EffectStarterService } from './effect-starter.service';

@NgModule({})
export class NgxsEffectsRootModule {
    constructor(
        private effectStarterService: EffectStarterService,
    ) {
        effectStarterService.start();
    }

    public addFeatureEffect(featureEffectService: any): void {
        this.effectStarterService.next(featureEffectService);
    }
}
