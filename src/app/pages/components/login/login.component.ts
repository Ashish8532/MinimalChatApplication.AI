import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import NoSpaceAllowed from 'src/app/shared/helpers/nospace-allowed';
import ValidateForm from 'src/app/shared/helpers/validate-forms';
import ValidatePassword from 'src/app/shared/helpers/validate-password';
import { AuthService } from '../../services/auth.service';

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

  constructor(private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toast: NgToastService) { }

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
          this.authService.storeToken(res.jwtToken);
          this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
          this.router.navigate(['user-list']);
        },
        error: (err) => {
          this.toast.error({detail:"ERROR", summary:"Something went wrong.", duration:3000});
        }
      })
    }
    else {
      ValidateForm.validateAllFormFields(this.loginForm);
      this.toast.error({detail:"ERROR", summary:"Form is not valid.", duration:3000});
    }
  }
}
