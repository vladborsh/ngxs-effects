import { InjectionToken } from '@angular/core';

export const EFFECT_METADATA = '__ngxs-action-effects__';

export const FEATURE_EFFECTS = new InjectionToken<any>('__ngxs-action-effects-handlers__')
