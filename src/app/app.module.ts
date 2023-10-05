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
import { ConversationHistoryComponent } from './pages/components/conversation-history/conversation-history.component';
import { ChatComponent } from './pages/components/chat/chat.component';
import { RequestLogComponent } from './pages/components/request-log/request-log.component';
import { DataTablesModule } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { GoogleLoginProvider, GoogleSigninButtonModule, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { TokenInterceptor } from './shared/Interceptor/token.interceptor';
import { HomeComponent } from './pages/components/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    HeaderComponent,
    UserListComponent,
    ConversationHistoryComponent,
    ChatComponent,
    RequestLogComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgToastModule,
    HttpClientModule,
    DataTablesModule,
    PaginationModule.forRoot(),
    SocialLoginModule,
    GoogleSigninButtonModule
  ],
  providers: [
    { 
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor, 
      multi: true 
    },
    DatePipe,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '768783138443-c7isjgieo2e1e75f2scm44glt2cc2ca4.apps.googleusercontent.com' 
            ),
          },
          // Other providers if needed...
        ],
      } as SocialAuthServiceConfig,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
