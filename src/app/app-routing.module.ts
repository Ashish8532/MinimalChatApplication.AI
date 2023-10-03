import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/components/register/register.component';
import { LoginComponent } from './pages/components/login/login.component';
import { ConversationHistoryComponent } from './pages/components/conversation-history/conversation-history.component';
import { ChatComponent } from './pages/components/chat/chat.component';
import { authGuard } from './pages/guard/auth.guard';
import { RequestLogComponent } from './pages/components/request-log/request-log.component';
import { loggedInAuthGuard } from './pages/guard/logged-in-auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path:'', component: LoginComponent, canActivate:[loggedInAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate:[loggedInAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate:[loggedInAuthGuard] },
  {
    path: 'chat', component: ChatComponent, children: [
      { path: 'user/:userId', component: ConversationHistoryComponent }, // Add route with user parameter
    ], canActivate: [authGuard]
  },
  { path: 'logs', component: RequestLogComponent, canActivate: [authGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
