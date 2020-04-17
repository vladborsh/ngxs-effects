import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { AddCustomer } from './+state/actions/add-customer';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
    public showCustomerList$ = new BehaviorSubject<boolean>(true);
    constructor(private store: Store) {}

    toggleCustomerList(): void {
        this.showCustomerList$.next(!this.showCustomerList$.value);
    }

    addCustomer(): void {
        this.store.dispatch(new AddCustomer({
            id: Math.random().toString(),
            name: `Jhon ${Math.random().toString()}`,
            address: 'Test',
        }));
    }
}
