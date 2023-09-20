import { AbstractControl, ValidationErrors } from "@angular/forms";

export default class NoConsecutiveSpaces {
    static noConsecutiveSpaces(control: AbstractControl): ValidationErrors | null {
        const value = control.value as string;
        if (/\s\s/.test(value)) {
          return { consecutiveSpaces: true };
        }
        return null;
      }
  }