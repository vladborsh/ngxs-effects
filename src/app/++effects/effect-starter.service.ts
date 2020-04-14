import { Injectable, Inject, Optional, Type } from '@angular/core';
import { Actions, ofAction, ofActionSuccessful } from '@ngxs/store';
import { switchMap, tap } from 'rxjs/operators';
import { EFFECT_METADATA, FEATURE_EFFECTS } from './constans';
import { Observable, of } from 'rxjs';

@Injectable()
export class EffectStarterService {
  constructor(
    private actions$: Actions,
    @Optional() @Inject(FEATURE_EFFECTS) private effectsClasses: any[],
  ) {}

  start(): void {
    if (this.effectsClasses) {
      this.effectsClasses.forEach(target => {
        const effectsMetadata = target.constructor[EFFECT_METADATA];

        effectsMetadata.forEach(metadata => {
          if (metadata
            && hasMetadataProp(target, metadata.propertyName)
            && typeof target[metadata.propertyName] === 'function'
          ) {
            this.actions$
              .pipe(
                ofActionSuccessful(metadata.action),
                switchMap(actionObject => {
                  const effectResult = target[metadata.propertyName](actionObject);

                  if (effectResult && effectResult.hasOwnProperty('subscribe')) {
                    return effectResult;
                  } else {
                    return of(effectResult);
                  }
                }),
              )
              .subscribe();
          }
        });

      });
    }
  }
}

function hasMetadataProp<T>(target: Type<T>, propName: string): boolean {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(target)).includes(propName);
}
