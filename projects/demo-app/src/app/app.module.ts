/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { NgxsEffectsModule } from 'ngxs-effects';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: 'customer',
        loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule),
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
class AppRoutingModule {}

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        NgxsModule.forRoot([], { developmentMode: !environment.production }),
        // NgxsEffectsModule,
        AppRoutingModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
