import { PipeTransform } from '@nestjs/common';
export class ParseLangPipe implements PipeTransform {
  transform(value?: string): 'en'|'ar' {
    return value?.toLowerCase() === 'ar' ? 'ar' : 'en';
  }
}
