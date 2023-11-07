import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import NoSpaceAllowed from 'src/app/shared/helpers/nospace-allowed';
import ValidateForm from 'src/app/shared/helpers/validate-forms';
import ValidatePassword from 'src/app/shared/helpers/validate-password';
import { AuthService } from '../../services/auth.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { TokenResponse } from '../../models/token-response';
import { UserResponse } from '../../models/user-response';
import { Login } from '../../models/login';
import { ErrorMessages } from 'src/app/shared/constant/toast-message';


/**
 * Component for user login.
 * - Manages the login form and its validation.
 * - Provides functionality to toggle password visibility.
 * - Handles user login and redirects upon success.
 * - Allows users to log in using Google authentication.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Properties for password visibility toggle
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  // Reactive form for user login
  loginForm!: FormGroup;

  // User information obtained from social login
  user!: SocialUser | null;

  /**
   * Constructor of the LoginComponent class.
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
  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: NgToastService,
    private socialAuthService: SocialAuthService) {
    this.user = null;
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.authService.googleSignIn(user.idToken.toString()).subscribe(
          {
            next: (res: TokenResponse<UserResponse>) => {
              localStorage.clear();
              this.authService.storeToken(res.accessToken);
              this.authService.storeRefreshToken(res.refreshToken);
              this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
              this.router.navigate(['chat']);
            }
          })
      }
      this.user = user;
    });
  }

  /**
   * Angular lifecycle hook called after the component has been initialized.
   * - Initializes the login form using the Angular form builder.
   * - Sets up form controls for email and password with specified validators.
   * 
   * Note: Validators are defined in external helper classes.
   */
  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, NoSpaceAllowed.noSpaceAllowed, ValidatePassword.validatePassword]]
    });
  }

  /**
   * Toggles the visibility of the password input.
   * - Switches between password type (hidden) and text type (visible) based on the current visibility state.
   * - Updates the eye icon accordingly.
   */
  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  /**
 * Handles the user login process.
 * - Validates the login form.
 *   - If the form is valid, sends a login request to the authentication service.
 *   - Upon successful login, resets the form, clears localStorage, stores access and refresh tokens,
 *     displays a success toast, and navigates to the chat page.
 *   - If the form is not valid, marks all form fields as touched and displays an error toast.
 */
  onLogin() {
    if (this.loginForm.valid) {
      const loginData: Login = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value,
      };
      this.authService.login(loginData).subscribe(
        {
          next: (res: TokenResponse<UserResponse>) => {
            this.loginForm.reset();
            localStorage.clear();
            this.authService.storeToken(res.accessToken);
            this.authService.storeRefreshToken(res.refreshToken);
            this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 3000 });
            this.router.navigate(['chat']);
          }
        })
    }
    else {
      ValidateForm.validateAllFormFields(this.loginForm);
      this.toast.error({ detail: "ERROR", summary: ErrorMessages.FormNotValid, duration: 3000 });
    }
  }

  /**
   * Initiates the Google login process using the AuthService.
   * - Redirects users to the Google authentication page.
   */
  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
