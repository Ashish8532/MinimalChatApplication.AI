import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import NoConsecutiveSpaces from 'src/app/shared/helpers/no-consecutive-spaces';
import NoSpaceAllowed from 'src/app/shared/helpers/nospace-allowed';
import ValidatePassword from 'src/app/shared/helpers/validate-password';
import ValidateForm from 'src/app/shared/helpers/validate-forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash"

  registerForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private toast: NgToastService) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: [null, [Validators.required, Validators.pattern('^[A-Za-z ]+$'),
      Validators.minLength(2), Validators.maxLength(20), NoConsecutiveSpaces.noConsecutiveSpaces]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, NoSpaceAllowed.noSpaceAllowed, ValidatePassword.validatePassword]],
    });
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";
  }

  onRegister() {
    console.log(this.registerForm);
    if(this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (res) => {
          this.registerForm.reset();
          this.toast.success({detail:"SUCCESS", summary:res.message, duration:3000});
          this.router.navigate(['login']);
        },
        error: (err) => {
          if (err.status === 401 || err.status === 400 || err.status === 409 || err.status === 500) {
            // Display the error message to the user
            this.toast.error({detail:"ERROR", summary:err.error.message, duration:3000});
          } else {
            this.toast.error({detail:"ERROR", summary: "Something went wrong while processing the request.", duration:3000});
          }
        }
      });
    }
    else {
      ValidateForm.validateAllFormFields(this.registerForm);
      this.toast.error({detail:"ERROR", summary:"Form is not valid.", duration:3000});
    }
  }
}
