import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { MovieService } from '../services/movie.service';
import { I18nService } from '../services/i18n.service';
import { MovieCard } from './movie-card';
import { InView } from './in-view';
import { SearchBar } from './search-bar';

@Component({
  selector: 'app-movie-list',
  imports: [MovieCard, SearchBar, InView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 max-w-xl">
      <app-search-bar [value]="service.query()" (search)="service.searchMovies($event)" />
    </div>

    <h2 class="mb-4 text-xl font-semibold">
      @if (service.query()) {
        {{ i18n.t('resultsFor') }} «{{ service.query() }}»
      } @else {
        {{ i18n.t('popularMovies') }}
      }
    </h2>

    @switch (status()) {
      @case ('loading') {
        <div class="flex justify-center py-16" role="status" [attr.aria-label]="i18n.t('loading')">
          <div class="size-10 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500 dark:border-slate-700 dark:border-t-amber-400"></div>
        </div>
      }
      @case ('error') {
        <div class="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-700 dark:text-red-300" role="alert">
          <p>{{ i18n.t(service.error()!) }}</p>
          <button
            type="button"
            (click)="service.searchMovies(service.query())"
            class="mt-3 rounded-md bg-red-500/20 px-3 py-1 text-sm hover:bg-red-500/30"
          >
            {{ i18n.t('retry') }}
          </button>
        </div>
      }
      @case ('empty') {
        <p class="py-16 text-center text-slate-500 dark:text-slate-400">{{ i18n.t('nothingFound') }}</p>
      }
      @case ('ready') {
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          @for (movie of service.movies(); track movie.id) {
            <app-movie-card [movie]="movie" />
          }
        </div>

        @if (service.loadingMore()) {
          <div class="flex justify-center py-8" role="status" [attr.aria-label]="i18n.t('loading')">
            <div class="size-8 animate-spin rounded-full border-4 border-slate-300 border-t-amber-500 dark:border-slate-700 dark:border-t-amber-400"></div>
          </div>
        } @else if (service.loadMoreError()) {
          <div class="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-700 dark:text-red-300" role="alert">
            <p>{{ i18n.t(service.loadMoreError()!) }}</p>
            <button
              type="button"
              (click)="service.loadMore()"
              class="mt-3 rounded-md bg-red-500/20 px-3 py-1 text-sm hover:bg-red-500/30"
            >
              {{ i18n.t('retry') }}
            </button>
          </div>
        } @else if (service.hasMore()) {
          <div appInView (inView)="service.loadMore()" class="h-px"></div>
        }
      }
    }
  `,
})
export class MovieList implements OnInit {
  protected readonly service = inject(MovieService);
  protected readonly i18n = inject(I18nService);

  protected readonly status = computed(() => {
    if (this.service.loading()) return 'loading';
    if (this.service.error()) return 'error';
    return this.service.movies().length ? 'ready' : 'empty';
  });

  ngOnInit(): void {
    if (!this.service.movies().length) {
      this.service.searchMovies(this.service.query());
    }
  }
}
