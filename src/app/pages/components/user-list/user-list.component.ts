import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  public users: any = [];
  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.userService.getUserList().subscribe(res => {
      console.log(res.data);
      this.users = res.data;
      console.log(this.users);
    })
  }

  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }

  generateBackgroundColor(user: any): string {
    // Example: Generate a color based on the user's email
    const email = user.email;
    const hash = email.split('').reduce((acc: any, char: string) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360; // Use the hash to determine the hue (0-359)
    return `hsl(${hue}, 70%, 80%)`; // Adjust saturation and lightness as needed
  }

  getRandomColor(): string {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Generates a random hexadecimal color code
    return randomColor;
  }
}
