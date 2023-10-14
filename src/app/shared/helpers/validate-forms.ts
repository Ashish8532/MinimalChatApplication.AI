import { FormControl, FormGroup } from "@angular/forms";

/**
 * Helper class for marking all form fields as dirty in an Angular FormGroup.
 */
export default class ValidateForm {

  /**
   * Marks all form fields as dirty recursively in the provided FormGroup.
   * @param formGroup - The FormGroup to mark the fields as dirty.
   */
  static validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsDirty({ onlySelf: true });
      }
      else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);

      }
    })
  }
}