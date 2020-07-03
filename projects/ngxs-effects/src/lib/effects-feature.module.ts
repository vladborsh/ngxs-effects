import { NgModule, Optional, Inject } from '@angular/core';
import { NgxsEffectsRootModule } from './effects-root.module';
import { FEATURE_EFFECTS } from './config/tokens';

@NgModule({})
export class NgxsEffectsFeatureModule {
    constructor(
        ngxsEffectsRootModule: NgxsEffectsRootModule,
        @Optional() @Inject(FEATURE_EFFECTS) featureEffectsInstances: any[],
    ) {
        if (featureEffectsInstances && featureEffectsInstances.length) {
            featureEffectsInstances.forEach(effect => ngxsEffectsRootModule.addFeatureEffect(effect));
        }
    }
}
