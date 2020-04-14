import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { CustomerState } from '../../+state/customer.state';
import { Observable } from 'rxjs';
import { CustomerInterface } from 'src/app/interfaces/customer.interface';
import { AddCustomer } from 'src/app/+state/actions/add-customer';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent {
  @Select(CustomerState.customerList) public readonly customersList$: Observable<CustomerInterface[]>;

  constructor(private store: Store) {}

  addCustomer(): void {
    this.store.dispatch(new AddCustomer({
      id: Math.random().toString(),
      name: `Jhon ${Math.random().toString()}`,
      address: 'Test',
    }));
  }

}
