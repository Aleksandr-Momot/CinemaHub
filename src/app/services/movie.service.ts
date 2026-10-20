import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { MovieDetails, MoviesResponse, Movie } from '../models/movie';
import { I18nService, MessageKey } from './i18n.service';

function toErrorKey(error: unknown): MessageKey {
  if (error instanceof HttpErrorResponse) {
    switch (error.status) {
      case 0:
        return 'errorNetwork';
      case 401:
        return 'errorUnauthorized';
      case 404:
        return 'errorNotFound';
    }
  }
  return 'errorGeneric';
}

const MAX_PAGES = 500;

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);

  private readonly moviesSignal = signal<Movie[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly loadingMoreSignal = signal(false);
  private readonly errorSignal = signal<MessageKey | null>(null);
  private readonly loadMoreErrorSignal = signal<MessageKey | null>(null);
  private readonly querySignal = signal('');
  private readonly pageSignal = signal(0);
  private readonly totalPagesSignal = signal(0);

  private readonly detailsId = signal<number | undefined>(undefined);
  private readonly detailsResource = httpResource<MovieDetails>(() => {
    const id = this.detailsId();
    if (id === undefined) return undefined;
    return {
      url: `${environment.tmdbApiUrl}/movie/${id}`,
      params: { language: this.i18n.tmdbLanguage() },
    };
  });

  readonly movies = this.moviesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly loadingMore = this.loadingMoreSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly loadMoreError = this.loadMoreErrorSignal.asReadonly();
  readonly query = this.querySignal.asReadonly();
  readonly hasMore = computed(
    () => this.pageSignal() > 0 && this.pageSignal() < Math.min(this.totalPagesSignal(), MAX_PAGES),
  );

  readonly details = computed(() => (this.detailsResource.hasValue() ? this.detailsResource.value() : null));
  readonly detailsLoading = this.detailsResource.isLoading;
  readonly detailsError = computed(() => {
    const error = this.detailsResource.error();
    return error ? toErrorKey(error) : null;
  });

  private listRequest?: Subscription;

  constructor() {
    let initial = true;
    effect(() => {
      this.i18n.lang();
      if (initial) {
        initial = false;
        return;
      }
      untracked(() => this.reload());
    });
  }

  getPopularMovies(): void {
    this.querySignal.set('');
    this.loadFirstPage();
  }

  searchMovies(keyword: string): void {
    const query = keyword.trim();
    if (!query) {
      this.getPopularMovies();
      return;
    }
    this.querySignal.set(query);
    this.loadFirstPage();
  }

  getMovieDetails(id: number): void {
    if (this.detailsId() === id) {
      this.detailsResource.reload();
    } else {
      this.detailsId.set(id);
    }
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingSignal() || this.loadingMoreSignal()) return;

    const nextPage = this.pageSignal() + 1;
    this.loadMoreErrorSignal.set(null);
    this.loadingMoreSignal.set(true);

    this.listRequest = this.fetchPage(nextPage).subscribe({
      next: (response) => {
        const known = new Set(this.moviesSignal().map((movie) => movie.id));
        const fresh = response.results.filter((movie) => !known.has(movie.id));
        this.moviesSignal.update((movies) => [...movies, ...fresh]);
        this.pageSignal.set(nextPage);
        this.totalPagesSignal.set(response.total_pages);
        this.loadingMoreSignal.set(false);
      },
      error: (error) => {
        this.loadMoreErrorSignal.set(toErrorKey(error));
        this.loadingMoreSignal.set(false);
      },
    });
  }

  private loadFirstPage(): void {
    this.listRequest?.unsubscribe();
    this.errorSignal.set(null);
    this.loadMoreErrorSignal.set(null);
    this.loadingMoreSignal.set(false);
    this.pageSignal.set(0);
    this.loadingSignal.set(true);

    this.listRequest = this.fetchPage(1).subscribe({
      next: (response) => {
        this.moviesSignal.set(response.results);
        this.pageSignal.set(1);
        this.totalPagesSignal.set(response.total_pages);
        this.loadingSignal.set(false);
      },
      error: (error) => {
        this.moviesSignal.set([]);
        this.errorSignal.set(toErrorKey(error));
        this.loadingSignal.set(false);
      },
    });
  }

  private fetchPage(page: number): Observable<MoviesResponse> {
    const query = this.querySignal();
    return query
      ? this.get<MoviesResponse>('/search/movie', { query, page })
      : this.get<MoviesResponse>('/movie/popular', { page });
  }

  private reload(): void {
    if (this.listRequest) {
      this.searchMovies(this.querySignal());
    }
  }

  private get<T>(path: string, params: Record<string, string | number> = {}): Observable<T> {
    return this.http.get<T>(`${environment.tmdbApiUrl}${path}`, {
      params: { language: this.i18n.tmdbLanguage(), ...params },
    });
  }
}
