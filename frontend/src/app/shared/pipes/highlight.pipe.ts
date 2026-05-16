import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) return value;
    
    const re = new RegExp(search, 'gi');
    const result = value.replace(re, match => `<mark class="highlight-premium">${match}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
