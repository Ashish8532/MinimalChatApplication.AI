import { AbstractControl } from "@angular/forms";

export default class ValidatePassword {
    static validatePassword(control: AbstractControl) {
        const password = control.value as string;
      
        // Define regular expressions for each criteria
        const hasLowerCase = /[a-z]/.test(password);
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialCharacter = /[!@#$%^&*()_+{}[\]:;<>,.?~\\-]/.test(password);
        const hasNumericDigit = /\d/.test(password);
      
        // Check if all criteria are met
        if (!hasLowerCase || !hasUpperCase || !hasSpecialCharacter || !hasNumericDigit) {
          return { invalidPassword: true };
        }
        return null;
      }
}