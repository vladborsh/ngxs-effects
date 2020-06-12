import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { NgxsModule } from '@ngxs/store';
import { CustomerState } from '../+state/customer.state';
import { CustomerEffectsService } from './customer-effects/customer-effects.service';
import { NgxsEffectsModule} from 'ngxs-effects';
import { RouterModule, Routes } from '@angular/router';
import { CustomerComponent } from './customer.component';

const routes: Routes = [
    {
        path: '',
        component: CustomerListComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [CustomerComponent],
})
class CustomerRoutingModule {}

@NgModule({
    declarations: [
        CustomerListComponent,
    ],
    exports: [
        CustomerListComponent,
    ],
    imports: [
        CommonModule,
        CustomerRoutingModule,
        NgxsModule.forFeature([CustomerState]),
        NgxsEffectsModule.forFeature(CustomerEffectsService),
    ],
    providers: [
        CustomerEffectsService,
    ]
})
export class CustomerModule { }
