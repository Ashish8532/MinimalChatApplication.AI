import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnChanges {

  @Input() users: any[] = [];
  @Output() userSelected = new EventEmitter<{ userId: string, userName: string }>();
  selectedUserId: string | null = null;
  predefinedColors: string[] = ['red', 'blue', 'orange', 'green', 'purple', 'teal'];
  constructor(private userService: UserService, 
    private authService: AuthService,
    private router: Router,
    private toast: NgToastService) {}

  ngOnInit() {
    this.userService.getUserList().subscribe({
      next: (res) => {
        this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
      this.users = res.data;
      },
      error: (err) => {
        if (err.status === 401 || err.status === 404 || err.status === 500) {
          // Display the error message to the user
          this.toast.error({detail:"ERROR", summary:err.error.message, duration:3000});
        } else {
          this.toast.error({detail:"ERROR", summary: "Something went wrong while processing the request.", duration:3000});
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reset the selectedUserId when users change
    if (changes['users']) { // Access 'users' using square brackets
      this.selectedUserId = null;
    }
  }

  onUserClick(userId: string, userName: string) {
    const userSelection = { userId, userName };
    this.selectedUserId = userId; // Set the selected user ID
    this.userSelected.emit(userSelection); // Emit the selected user ID and name
  }

  getInitials(name: string): string {
    const nameParts = name.split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    return initials;
  }
  
  getRandomColor(index: number): string {
    // Use the index to select a color from the predefined array
    const colorIndex = index % this.predefinedColors.length;
    return this.predefinedColors[colorIndex];
  }
}
