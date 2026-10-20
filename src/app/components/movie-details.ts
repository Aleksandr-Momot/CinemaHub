import { DatePipe, DecimalPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { imageUrl } from '../models/image-url';
import { MovieService } from '../services/movie.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-movie-details',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="goBack()"
      class="mb-6 rounded-lg border border-slate-300 px-4 py-2 text-sm transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:hover:border-amber-400 dark:hover:text-amber-400"
    >
      ← {{ i18n.t('back') }}
    </button>

    @switch (status()) {
      @case ('loading') {
        <div class="flex justify-center py-16" role="status" [attr.aria-label]="i18n.t('loading')">
          <div class="size-10 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500 dark:border-slate-700 dark:border-t-amber-400"></div>
        </div>
      }
      @case ('error') {
        <div class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-700 dark:text-red-300" role="alert">
          {{ i18n.t(service.detailsError()!) }}
        </div>
      }
      @case ('ready') {
        @if (service.details(); as movie) {
          <article class="grid gap-8 md:grid-cols-[300px_1fr]">
            @if (poster(); as src) {
              <img [src]="src" [alt]="movie.title" class="w-full max-w-xs rounded-xl shadow-lg md:max-w-none" />
            } @else {
              <div class="flex aspect-2/3 w-full max-w-xs items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-slate-800 md:max-w-none">
                {{ i18n.t('noPoster') }}
              </div>
            }

            <div class="space-y-4">
              <h2 class="text-3xl font-bold">{{ movie.title }}</h2>
              @if (movie.tagline) {
                <p class="text-slate-500 italic dark:text-slate-400">{{ movie.tagline }}</p>
              }

              <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-600 dark:text-slate-300">
                <span class="font-semibold text-amber-600 dark:text-amber-400">★ {{ movie.vote_average | number: '1.1-1' }}</span>
                @if (movie.release_date) {
                  <span>{{ movie.release_date | date: 'dd.MM.yyyy' }}</span>
                }
                @if (movie.runtime) {
                  <span>{{ movie.runtime }} {{ i18n.t('minutes') }}</span>
                }
              </div>

              @if (movie.genres.length) {
                <ul class="flex flex-wrap gap-2">
                  @for (genre of movie.genres; track genre.id) {
                    <li class="rounded-full bg-slate-200 px-3 py-1 text-sm dark:bg-slate-800">{{ genre.name }}</li>
                  }
                </ul>
              }

              <div>
                <h3 class="mb-2 text-lg font-semibold">{{ i18n.t('overview') }}</h3>
                <p class="leading-relaxed text-slate-700 dark:text-slate-300">{{ movie.overview || i18n.t('noOverview') }}</p>
              </div>
            </div>
          </article>
        }
      }
    }
  `,
})
export class MovieDetailsPage {
  protected readonly service = inject(MovieService);
  protected readonly i18n = inject(I18nService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  readonly id = input.required<string>();
  protected readonly poster = computed(() => imageUrl(this.service.details()?.poster_path ?? null));
  protected readonly status = computed(() => {
    if (this.service.detailsError()) return 'error';
    return this.service.details() && !this.service.detailsLoading() ? 'ready' : 'loading';
  });

  constructor() {
    effect(() => {
      const id = Number(this.id());
      untracked(() => this.service.getMovieDetails(id));
    });
  }

  protected goBack(): void {
    if ((history.state?.navigationId ?? 0) > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
