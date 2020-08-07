import { InjectionToken } from '@angular/core';
import { EffectErrorHandlerInterface } from '../interfaces/effect-error-handler.interface';

export const FEATURE_EFFECTS = new InjectionToken<any>('__ngxs-action-effects-handlers__');
export const _FEATURE_EFFECTS = new InjectionToken<any>('__internal_ngxs-action-effects-handlers__');
export const ROOT_EFFECTS = new InjectionToken<any>('__ngxs-root-action-effects-handlers__');
export const _ROOT_EFFECTS = new InjectionToken<any>('__internal_ngxs-root-action-effects-handlers__');
export const EFFECTS_ERROR_HANDLER = new InjectionToken<EffectErrorHandlerInterface>('__ngxs-action-effects-error-handler__');
