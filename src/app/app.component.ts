import { Component, OnInit } from '@angular/core';
import { AuthService } from './pages/services/auth.service';
import GetToken from './shared/helpers/get-token';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check for the presence of a token in localStorage
    const token = GetToken.getToken();

    if (token) {
      // If a token is present, set it in the AuthService to update the username
      this.authService.storeToken(token);
    }
  }
}
