import { Directive, ElementRef, DestroyRef, inject, output } from '@angular/core';

@Directive({ selector: '[appInView]' })
export class InView {
  readonly inView = output<void>();

  constructor() {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.inView.emit();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
