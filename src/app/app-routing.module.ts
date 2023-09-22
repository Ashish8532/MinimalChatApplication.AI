import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/components/register/register.component';
import { LoginComponent } from './pages/components/login/login.component';
import { ConversationHistoryComponent } from './pages/components/conversation-history/conversation-history.component';
import { ChatComponent } from './pages/components/chat/chat.component';
import { authGuard } from './pages/guard/auth.guard';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'chat', component: ChatComponent, children: [
      { path: 'user/:userId', component: ConversationHistoryComponent }, // Add route with user parameter
    ], canActivate: [authGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
