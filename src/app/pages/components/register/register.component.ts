import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import NoConsecutiveSpaces from 'src/app/shared/helpers/no-consecutive-spaces';
import NoSpaceAllowed from 'src/app/shared/helpers/nospace-allowed';
import ValidatePassword from 'src/app/shared/helpers/validate-password';
import ValidateForm from 'src/app/shared/helpers/validate-forms';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { ApiResponse } from '../../models/api-response';
import { UserProfile } from '../../models/user-profile';
import { Register } from '../../models/register';
import { TokenResponse } from '../../models/token-response';
import { UserResponse } from '../../models/user-response';
import { ErrorMessages } from 'src/app/shared/constant/toast-message';

/**
 * Component for user registration.
 * - Manages the registration form and its validation.
 * - Provides functionality to toggle password visibility.
 * - Handles the user registration process and redirects upon success.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // Properties for password visibility toggle
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';

  // Reactive form for user registration
  registerForm!: FormGroup;
  user!: SocialUser | null; // User information obtained from social login

  // Constant for the name pattern
  private readonly NAME_PATTERN!: string;

  /**
   * Constructor of the RegisterComponent class.
   * - Initializes the component with the required services and dependencies.
   * - Sets the initial value of the 'user' property to null.
   * - Subscribes to changes in the social authentication state.
   * - Handles Google sign-in events and redirects upon successful authentication.
   *
   * @param formBuilder - An instance of the FormBuilder service for creating and managing forms.
   * @param authService - An instance of the AuthService for user authentication operations.
   * @param router - An instance of the Router for navigating between routes.
   * @param toast - An instance of the NgToastService for displaying toast notifications.
   * @param socialAuthService - An instance of the SocialAuthService for managing social logins.
   */
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: NgToastService,
    private socialAuthService: SocialAuthService
  ) {
    // Initialize the Name Pattern with default values
    this.NAME_PATTERN = '^[A-Za-z ]+$';

    // Initializes the user property to null.
    this.user = null;

    /**
     * Subscribes to the authentication state of the social sign-in.
     * Handles the sign-in process when a user is authenticated.
     * - Stores the user's token and refresh token in local storage.
     * - Navigates to the chat page on successful sign-in.
     * @param user - The authenticated social user.
     */
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.authService.googleSignIn(user.idToken.toString()).subscribe({
          next: (res: TokenResponse<UserResponse>) => {
            localStorage.clear();
            this.authService.storeToken(res.accessToken);
            this.authService.storeRefreshToken(res.refreshToken);
            this.toast.success({
              detail: 'SUCCESS',
              summary: res.message,
              duration: 3000,
            });
            this.router.navigate(['chat']);
          },
        });
      }
      this.user = user;
    });
  }

  /**
   * Angular lifecycle hook called after the component has been initialized.
   * - Initializes the registration form using the Angular form builder.
   * - Sets up form controls for name, email, and password with specified validators:
   *   - Name: Required, pattern validation for alphabetical characters and spaces, minimum and maximum length, and no consecutive spaces.
   *   - Email: Required and email format validation.
   *   - Password: Required, no space allowed, and password complexity validation.
   *
   * Note: Validators are defined in external helper classes.
   */
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: [
        null,
        [
          Validators.required,
          Validators.pattern(this.NAME_PATTERN),
          Validators.minLength(2),
          Validators.maxLength(20),
          NoConsecutiveSpaces.noConsecutiveSpaces,
        ],
      ],
      email: [null, [Validators.required, Validators.email]],
      password: [
        null,
        [
          Validators.required,
          NoSpaceAllowed.noSpaceAllowed,
          ValidatePassword.validatePassword,
        ],
      ],
    });
  }

  /**
   * Toggles the visibility of the password input.
   * - Switches between password type (hidden) and text type (visible) based on the current visibility state.
   * - Updates the eye icon accordingly.
   */
  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  /**
   * Handles the user registration process.
   * - Validates the registration form.
   *   - If the form is valid, sends a registration request to the authentication service.
   *   - Upon successful registration, resets the form, displays a success toast, and navigates to the login page.
   *   - If the form is not valid, marks all form fields as touched and displays an error toast.
   */
  onRegister() {
    if (this.registerForm.valid) {
      const registerData: Register = {
        email: this.registerForm.get('email')?.value,
        name: this.registerForm.get('name')?.value,
        password: this.registerForm.get('password')?.value,
      };
      this.authService.register(registerData).subscribe({
        next: (res: ApiResponse<UserProfile>) => {
          this.registerForm.reset();
          this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
          this.router.navigate(['login']);
        }
      });
    }
    else {
      ValidateForm.validateAllFormFields(this.registerForm);
      this.toast.error({ detail: "ERROR", summary: ErrorMessages.FormNotValid, duration: 3000 });
    }
  }
}
