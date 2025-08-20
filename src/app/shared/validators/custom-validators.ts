import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';

/**
 * Validator function to ensure at least one of the specified controls has a value.
 * @param controlName1 The name of the first control to check.
 * @param controlName2 The name of the second control to check.
 * @returns A ValidatorFn that returns an error object if both controls are empty, otherwise null.
 */

export function atLeastOneRequired(controlName1: string, controlName2: string): ValidatorFn {
  return (group: AbstractControl): { [key: string]: any } | null => {
    const control1 = group.get(controlName1);
    const control2 = group.get(controlName2);

    if (control1 && control2 && (!control1.value && !control2.value)) {
      return { atLeastOneRequired: true };
    }
    return null;
  };
}

  /**
   * Creates a validator function to check if the number of selected items exceeds the specified maximum.
   * 
   * @param {number} max - The maximum number of allowed selections.
   * @returns {(control: AbstractControl) => ValidationErrors | null} - A validator function that returns an error object if the selection count exceeds the maximum, otherwise null.
   */
  
  export function maxSelectionValidator(max: number) {
    return (control: AbstractControl) => {
      const value = control.value || [];
      return value.length > max ? { maxSelection: true } : null;
    };
  }

 /**
  * Validator to ensure the start date is not greater than the end date.
  * 
  * @param control - The form control group that contains the start and end date controls.
  * @returns A validation error object if the start date is greater than the end date, otherwise null.
  */
 export const startDateBeforeEndDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('starting_at')?.value;
    const endDate = control.get('ending_at')?.value;

    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
        return { startDateAfterEndDate: true };
    }

    return null;
  };