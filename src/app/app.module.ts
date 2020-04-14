import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CustomerModule } from './customer/customer.module';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';
import { NgxsEffectsRootModule } from './++effects/effects-root.module';

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
    NgxsEffectsRootModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
