import { AbstractControl } from "@angular/forms";

/**
 * Helper class for validating password strength.
 */
export default class ValidatePassword {

  /**
  * Validates the strength of the provided password based on criteria like lowercase, uppercase, special character, and numeric digit.
  * @param control - The AbstractControl representing the password form control.
  * @returns A validation error object if the password doesn't meet the criteria; otherwise, null.
  */
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