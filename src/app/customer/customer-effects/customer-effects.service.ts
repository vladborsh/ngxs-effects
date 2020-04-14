import { Injectable } from '@angular/core';
import { Effect } from 'src/app/++effects/effect.decorator';
import { AddCustomer } from 'src/app/+state/actions/add-customer';
import { CustomerInterface } from 'src/app/interfaces/customer.interface';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomerEffectsService {
  @Effect(AddCustomer)
  addCustomer({ payload }: AddCustomer): void {
    console.log(payload);
  }
}
