import { NgModule, Optional, Inject } from '@angular/core';
import { NgxsEffectsRootModule } from './effects-root.module';
import { FEATURE_EFFECTS } from './config/tokens';

@NgModule({})
export class NgxsEffectsFeatureModule {
    constructor(
    @Inject(NgxsEffectsRootModule) ngxsEffectsRootModule: NgxsEffectsRootModule,
        @Inject(FEATURE_EFFECTS) featureEffectsInstances: any[][],
    ) {
        featureEffectsInstances.forEach(group =>
            group.forEach(effect =>
                ngxsEffectsRootModule.addEffect(effect),
            ),
        );
    }
}
