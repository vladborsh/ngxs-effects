import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { CustomerInterface } from '../interfaces/customer.interface';
import { AddCustomer } from './actions/add-customer';

@State<Record<string, CustomerInterface>>({
    name: 'zoo'
})
@Injectable()
export class CustomerState {
    @Selector()
    static customerList(state: Record<string, CustomerInterface>): CustomerInterface[] {
        return Object.values(state);
    }

    @Action(AddCustomer)
    addCustomer(context: StateContext<Record<string, CustomerInterface>>, {payload}: AddCustomer): void {
        context.setState({
            ...context.getState(),
            [payload.id]: payload,
        });
    }
}
