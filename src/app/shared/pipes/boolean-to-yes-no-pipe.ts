import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanToYesNo'
})
export class BooleanToYesNoPipe implements PipeTransform {

transform(
    value: boolean | null | undefined,
    yesText: string = 'Yes',
    noText: string = 'No'
  ): string {
    if (value === true) return yesText;
    if (value === false) return noText;
    return '';
  }

}
