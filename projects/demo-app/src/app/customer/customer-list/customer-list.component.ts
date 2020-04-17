import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { CustomerState } from '../../+state/customer.state';
import { Observable } from 'rxjs';
import { CustomerEffectsService } from '../customer-effects/customer-effects.service';
import { CustomerInterface } from '../../interfaces/customer.interface';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent implements OnInit, OnDestroy {
    @Select(CustomerState.customerList) public readonly customersList$: Observable<CustomerInterface[]>;

    constructor(private customerEffectsService: CustomerEffectsService) {}

    ngOnInit(): void {
        this.customerEffectsService.start();
    }

    ngOnDestroy(): void {
        this.customerEffectsService.terminate();
    }
}
