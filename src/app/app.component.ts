import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AuthService } from './pages/services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MinimalChatApplication.AI';

  constructor(private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toast: NgToastService) { }
    
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
