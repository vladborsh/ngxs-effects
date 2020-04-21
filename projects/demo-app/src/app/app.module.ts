import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CustomerModule } from './customer/customer.module';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { NgxsEffectsModule } from 'ngxs-effects';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        CustomerModule,
        NgxsModule.forRoot([], {
            developmentMode: !environment.production
        }),
        NgxsEffectsModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
