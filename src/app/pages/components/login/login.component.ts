import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import NoSpaceAllowed from 'src/app/shared/helpers/nospace-allowed';
import ValidateForm from 'src/app/shared/helpers/validate-forms';
import ValidatePassword from 'src/app/shared/helpers/validate-password';
import { AuthService } from '../../services/auth.service';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  loginForm!: FormGroup;

  user!: SocialUser | null; 
  
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
              next: (res) => {
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

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, NoSpaceAllowed.noSpaceAllowed, ValidatePassword.validatePassword]]
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  onLogin() {
    if(this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        {
        next: (res) => {
          this.loginForm.reset();
          localStorage.clear();
          this.authService.storeToken(res.accessToken);
          this.authService.storeRefreshToken(res.refreshToken);
          this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
          this.router.navigate(['chat']);
        }
      })
    }
    else {
      ValidateForm.validateAllFormFields(this.loginForm);
      this.toast.error({detail:"ERROR", summary:"Form is not valid.", duration:3000});
    }
  }

  loginWithGoogle(): void {
    this.authService.loginWithGoogle();
  }
}
