import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { imageUrl } from '../models/image-url';
import { Movie } from '../models/movie';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-movie-card',
  imports: [RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="['/movie', movie().id]"
      class="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:ring-amber-500 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-amber-400"
    >
      @if (poster(); as src) {
        <img [src]="src" [alt]="movie().title" loading="lazy" class="aspect-2/3 w-full object-cover" />
      } @else {
        <div class="flex aspect-2/3 w-full items-center justify-center bg-slate-200 text-sm text-slate-500 dark:bg-slate-800">
          {{ i18n.t('noPoster') }}
        </div>
      }
      <div class="space-y-1 p-3">
        <h3 class="line-clamp-2 min-h-12 font-semibold group-hover:text-amber-600 dark:group-hover:text-amber-400">{{ movie().title }}</h3>
        <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{{ movie().release_date | date: 'dd.MM.yyyy' }}</span>
          <span class="font-medium text-amber-600 dark:text-amber-400">★ {{ movie().vote_average | number: '1.1-1' }}</span>
        </div>
      </div>
    </a>
  `,
})
export class MovieCard {
  protected readonly i18n = inject(I18nService);
  readonly movie = input.required<Movie>();
  protected readonly poster = computed(() => imageUrl(this.movie().poster_path, 'w342'));
}
