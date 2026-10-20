import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-scroll-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:scroll)': 'onScroll()' },
  template: `
    @if (visible()) {
      <button
        type="button"
        (click)="scrollToTop()"
        [attr.aria-label]="i18n.t('scrollTop')"
        [attr.title]="i18n.t('scrollTop')"
        class="fixed right-4 bottom-4 z-20 rounded-full bg-amber-400 p-3 text-slate-900 shadow-lg transition hover:bg-amber-300 sm:right-6 sm:bottom-6"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    }
  `,
})
export class ScrollTop {
  protected readonly i18n = inject(I18nService);
  protected readonly visible = signal(false);

  protected onScroll(): void {
    this.visible.set(window.scrollY > 400);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
