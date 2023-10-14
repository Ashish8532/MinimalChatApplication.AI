import { FormControl } from "@angular/forms";

/**
 * Custom validator class to check if a FormControl value contains spaces.
 */
export default class NoSpaceAllowed {
  /**
   * Validates if the provided FormControl value contains spaces.
   * @param control - The FormControl to validate.
   * @returns Validation error if spaces are found, otherwise null.
   */
  static noSpaceAllowed(control: FormControl) {
    if (control.value != null && control.value.indexOf(' ') != -1) {
      return { noSpaceAllowed: true }
    }
    return null;
  }
}