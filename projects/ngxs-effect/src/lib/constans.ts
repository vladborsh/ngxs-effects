import { InjectionToken } from '@angular/core';
import { EffectErrorHandlerInterface } from './interfaces/effect-error-handler.interface';

export const EFFECT_METADATA = '__ngxs-action-effects__';
export const EFFECT_TERMINATE_METADATA = '__ngxs-action-effects__terminate__';
export const EFFECT_START_METADATA = '__ngxs-action-effects__start__';

export const FEATURE_EFFECTS = new InjectionToken<any>('__ngxs-action-effects-handlers__');
export const EFFECTS_ERROR_HANDLER = new InjectionToken<EffectErrorHandlerInterface>('__ngxs-action-effects-error-handler__');
