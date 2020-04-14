import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { CustomerState } from '../../+state/customer.state';
import { Observable } from 'rxjs';
import { CustomerInterface } from 'src/app/interfaces/customer.interface';
import { AddCustomer } from 'src/app/+state/actions/add-customer';
import { CustomerEffectsService } from '../customer-effects/customer-effects.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent implements OnInit, OnDestroy{
  @Select(CustomerState.customerList) public readonly customersList$: Observable<CustomerInterface[]>;

  constructor(private customerEffectsService: CustomerEffectsService) {}

  ngOnInit(): void {
    this.customerEffectsService.start();
  }

  ngOnDestroy(): void {
    this.customerEffectsService.terminate();
  }
}
