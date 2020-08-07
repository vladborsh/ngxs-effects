import { NgModule, Inject } from '@angular/core';
import { EffectStarterService } from './effect-starter.service';
import { ROOT_EFFECTS } from './config/tokens';

@NgModule({})
export class NgxsEffectsRootModule {
    constructor(
        @Inject(EffectStarterService) private effectStarterService: EffectStarterService,
        @Inject(ROOT_EFFECTS) rootEffectsInstances: any[],
    ) {
        rootEffectsInstances.forEach(group =>
            group.forEach(effect =>
                this.addEffect(effect),
            ),
        );
        effectStarterService.start();
    }

    public addEffect(effect: any): void {
        this.effectStarterService.next(effect);
    }
}
