import { Pipe, PipeTransform } from '@angular/core';
import { formatRs } from './pricing';

@Pipe({ name: 'rs' })
export class RsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatRs(Number(value ?? 0));
  }
}
