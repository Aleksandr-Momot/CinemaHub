import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t border-slate-200 dark:border-slate-800">
      <div class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p>
          © {{ year }} CinemaHub. {{ i18n.t('madeBy') }}
          <a
            [href]="authorUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-amber-600 hover:underline dark:text-amber-400"
          >{{ authorName }}</a>
        </p>
        <p class="sm:max-w-md sm:text-right">
          {{ i18n.t('tmdbNotice') }}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-amber-600 hover:underline dark:text-amber-400"
          >TMDB</a>
        </p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  protected readonly year = new Date().getFullYear();
  protected readonly authorName = 'Oleksandr Momot';
  protected readonly authorUrl = 'https://www.linkedin.com/in/oleksandr-momot/';
}
