import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/components/register/register.component';
import { LoginComponent } from './pages/components/login/login.component';
import { ConversationHistoryComponent } from './pages/components/conversation-history/conversation-history.component';
import { ChatComponent } from './pages/components/chat/chat.component';
import { authGuard } from './pages/guard/auth.guard';
import { RequestLogComponent } from './pages/components/request-log/request-log.component';
import { loggedInAuthGuard } from './pages/guard/logged-in-auth.guard';
import { HomeComponent } from './pages/components/home/home.component';
import { GifsComponent } from './pages/components/gifs/gifs.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path:'', component: HomeComponent, canActivate:[loggedInAuthGuard] },
  { path: 'home', component: HomeComponent, canActivate:[loggedInAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate:[loggedInAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate:[loggedInAuthGuard] },
  {
    path: 'chat', component: ChatComponent, children: [
      { path: 'user/:userId', component: ConversationHistoryComponent }, 
    ], canActivate: [authGuard]
  },
  { path: 'logs', component: RequestLogComponent, canActivate: [authGuard] },
  { path: 'gif', component: GifsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
