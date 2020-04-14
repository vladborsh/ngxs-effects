import { InjectionToken } from '@angular/core';

export const EFFECT_METADATA = '__ngxs-action-effects__';
export const EFFECT_TERMINATE_METADATA = '__ngxs-action-effects__terminate__';
export const EFFECT_START_METADATA = '__ngxs-action-effects__start__';

export const FEATURE_EFFECTS = new InjectionToken<any>('__ngxs-action-effects-handlers__');
