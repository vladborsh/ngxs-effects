import { Injectable } from '@angular/core';
import { AddCustomer } from 'projects/demo-app/src/app/+state/actions/add-customer';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Effect, EffectsStart, EffectsTerminate } from '@ngxs-effect';

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
