import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './pages/components/register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgToastModule } from 'ng-angular-popup';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './pages/components/login/login.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { UserListComponent } from './pages/components/user-list/user-list.component';
import { ConversationHistoryComponent } from './pages/components/conversation-history/conversation-history.component';
import { ChatComponent } from './pages/components/chat/chat.component';
import { RequestLogComponent } from './pages/components/request-log/request-log.component';
import { DataTablesModule } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { PaginationModule } from 'ngx-bootstrap/pagination';

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
  ],
  providers: [
    DatePipe, // Add DatePipe to the providers array
    // ... other providers if you have any
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
