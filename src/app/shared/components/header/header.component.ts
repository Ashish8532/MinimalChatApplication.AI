import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/pages/services/auth.service';

/**
 * Header component responsible for displaying user information and providing logout functionality.
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  username: string = '';

  constructor(private authService: AuthService) { }

  /**
  * Initializes the component by subscribing to the username observable from the AuthService.
  */
  ngOnInit(): void {
    this.authService.getUsername().subscribe((username) => {
      this.username = username;
    });
  }

  /**
   * Checks if the user is currently logged in.
   * @returns True if the user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Logs out the user. Also updates the user status before logging out.
   */
  logout() {
    this.authService.updateUserStatus().subscribe(
      (response) => { });
    this.authService.logOut();
  }

  /**
   * Extracts and returns the initials from the given name.
   * @param name - The full name from which initials are to be extracted.
   * @returns The initials of the given name.
   */
  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }
}
