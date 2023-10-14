import { AbstractControl, ValidationErrors } from "@angular/forms";

/**
 * Custom validator class to check for consecutive spaces in a string.
 */
export default class NoConsecutiveSpaces {

  /**
   * Validates if the provided string contains consecutive spaces.
   * @param control - The AbstractControl to validate.
   * @returns Validation error if consecutive spaces are found, otherwise null.
   */
  static noConsecutiveSpaces(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string;
    if (/\s\s/.test(value)) {
      return { consecutiveSpaces: true };
    }
    return null;
  }
}