import {FormControl, ValidationErrors} from "@angular/forms";

export class BudgetKartValidators
{
    // Validate White Spaces
    static onlyWhiteSpaces(control: FormControl): ValidationErrors | null
    {
        if (control.value!=null && control.value.trim().length===0)
            return {'onlyWhiteSpaces': true};
        else
            return null;
    }
}
