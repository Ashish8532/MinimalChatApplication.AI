import { Component, OnInit } from '@angular/core';
import { UserProfile } from '../../models/user-profile';
import { UserService } from '../../services/user.service';
import { ApiResponse } from '../../models/api-response';
import { NgToastService } from 'ng-angular-popup';
import { UpdateProfile } from '../../models/update-profile';
import { StatusMessages } from 'src/app/shared/constant/status-message';

/**
 * Component representing the user profile.
 * - Displays and allows editing of user status messages.
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {

  public profileDetails: UserProfile | null = null;
  public editedStatusMessage: string;
  public isEditingStatusMessage: boolean = false;

  // Constant string status message for dropdown selection
  statusMessages = StatusMessages;
  
  selectedStatusMessage: string = '';

  /**
   * Initializes a new instance of the UserProfileComponent.
   * @param userService - An instance of the UserService for making API requests.
   * @param toast - An instance of the NgToastService for displaying toast notifications.
   */
  constructor(private userService: UserService, private toast: NgToastService) {
    this.editedStatusMessage = '';
  }

  /**
   * Lifecycle hook called after Angular has initialized the component.
   * Fetches the user's profile details and displays a success toast notification on a successful response.
   */
  ngOnInit() {
    /**
     * Subscribes to the `getProfileDetails` observable, which retrieves the user's profile details from the service.
     * Displays a success toast notification on a successful response and updates the user's profile details.
     * @param response - The HTTP response containing the user's profile information.
     */
    this.userService.getProfileDetails().subscribe({
      next: (response: ApiResponse<UserProfile>) => {
        this.toast.success({ detail: 'SUCCESS', summary: response.message, duration: 3000 });
        this.profileDetails = response.data;
      },
    });
  }

  /**
   * Toggles the edit mode for the user's status message.
   * If edit mode is activated, it initializes the edited status message with the current status message.
   */
  toggleEdit() {
    this.isEditingStatusMessage = !this.isEditingStatusMessage;
    if (this.isEditingStatusMessage) {
      this.editedStatusMessage = this.profileDetails!.statusMessage;
    }
  }

  /**
   * Saves the edited status message.
   * Creates an `UpdateProfile` object with the user's ID and the edited status message.
   * Submits an update request to the user service and updates the user's status message when successful.
   */
  saveStatusMessage() {
    const updateProfile: UpdateProfile = {
      userId: this.profileDetails!.id,
      statusMessage: this.editedStatusMessage,
    };
    this.userService.updateProfile(updateProfile).subscribe({
      next: (response: ApiResponse<UpdateProfile>) => {
        this.profileDetails!.statusMessage = response.data.statusMessage;
        this.isEditingStatusMessage = false;
      },
    });
  }

  /**
   * Updates the edited status message when a status message is selected from the dropdown.
   * Clears the selected status message to allow further edits.
   */
  onStatusMessageSelect() {
    this.editedStatusMessage = this.selectedStatusMessage;
    this.selectedStatusMessage = '';
  }

  /**
   * Cancels the editing of the user's status message.
   */
  cancelEdit() {
    this.isEditingStatusMessage = false;
  }
}
