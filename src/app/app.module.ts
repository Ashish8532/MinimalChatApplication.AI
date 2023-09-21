import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './pages/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './pages/components/login/login.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { UserListComponent } from './pages/components/user-list/user-list.component';
import { TokenInterceptor } from './pages/interceeptors/token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HeaderComponent,
    UserListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgToastModule,
    HttpClientModule,
  ],
  providers: [{ 
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor, 
    multi: true 
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
