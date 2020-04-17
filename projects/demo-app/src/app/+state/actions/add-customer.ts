import { CustomerInterface } from '../../interfaces/customer.interface';

export class AddCustomer {
    static readonly type = '[Customer] Add custmer';
    constructor(public payload: CustomerInterface) {}
}
