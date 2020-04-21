import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { NgxsModule } from '@ngxs/store';
import { CustomerState } from '../+state/customer.state';
import { CustomerEffectsService } from './customer-effects/customer-effects.service';
import { NgxsEffectsModule} from 'ngxs-effects';

@NgModule({
    declarations: [
        CustomerListComponent,
    ],
    exports: [
        CustomerListComponent,
    ],
    imports: [
        CommonModule,
        NgxsModule.forFeature([CustomerState]),
        NgxsEffectsModule.forFeature(CustomerEffectsService),
    ]
})
export class CustomerModule { }
