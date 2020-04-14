import { Injectable } from '@angular/core';
import { Effect } from 'src/app/++effects/effect.decorator';
import { AddCustomer } from 'src/app/+state/actions/add-customer';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { EffectsTerminate } from 'src/app/++effects/effects-terminate.decorator';
import { EffectsStart } from 'src/app/++effects/effects-start.decorator';

@Injectable({
  providedIn: 'root'
})
export class CustomerEffectsService {
  @Effect(AddCustomer)
  addCustomer({ payload }: AddCustomer): void {
    console.log(payload);
  }

  @Effect(AddCustomer)
  addCustomerObs({ payload }: AddCustomer): Observable<any> {
    return of('hello').pipe(map(v => `hello ${payload}`), tap(v => console.log(v)));
  }

  // @EffectsStart()
  start(): void {}

  // @EffectsTerminate()
  terminate(): void {}
}
