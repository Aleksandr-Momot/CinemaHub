import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MovieService } from './movie.service';
import { I18nService } from './i18n.service';
import { tmdbAuthInterceptor } from './tmdb-auth.interceptor';

describe('MovieService', () => {
  let service: MovieService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([tmdbAuthInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(MovieService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads popular movies', () => {
    service.getPopularMovies();
    expect(service.loading()).toBe(true);

    const req = http.expectOne((r) => r.url.endsWith('/movie/popular'));
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /);
    req.flush({ page: 1, results: [{ id: 1, title: 'A' }], total_pages: 1, total_results: 1 });

    expect(service.movies().length).toBe(1);
    expect(service.loading()).toBe(false);
  });

  it('searches by keyword and falls back to popular on empty keyword', () => {
    service.searchMovies('  matrix ');
    const search = http.expectOne((r) => r.url.endsWith('/search/movie'));
    expect(search.request.params.get('query')).toBe('matrix');
    search.flush({ page: 1, results: [], total_pages: 0, total_results: 0 });

    service.searchMovies('');
    http.expectOne((r) => r.url.endsWith('/movie/popular')).flush({ results: [] });
    expect(service.query()).toBe('');
  });

  it('exposes an error message when the request fails', () => {
    service.getPopularMovies();
    http.expectOne((r) => r.url.endsWith('/movie/popular')).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.error()).toBeTruthy();
    expect(service.loading()).toBe(false);
  });

  it('loads movie details', async () => {
    service.getMovieDetails(42);
    TestBed.tick();
    const req = await vi.waitFor(() => http.expectOne((r) => r.url.endsWith('/movie/42')));
    req.flush({ id: 42, title: 'X', genres: [] });

    await vi.waitFor(() => expect(service.details()?.id).toBe(42));
    expect(service.detailsLoading()).toBe(false);
  });

  it('appends the next page and stops after the last one', () => {
    service.getPopularMovies();
    http.expectOne((r) => r.url.endsWith('/movie/popular')).flush({
      page: 1,
      results: [{ id: 1 }, { id: 2 }],
      total_pages: 2,
      total_results: 4,
    });
    expect(service.hasMore()).toBe(true);

    service.loadMore();
    expect(service.loadingMore()).toBe(true);
    service.loadMore();
    const next = http.expectOne((r) => r.url.endsWith('/movie/popular'));
    expect(next.request.params.get('page')).toBe('2');
    next.flush({ page: 2, results: [{ id: 2 }, { id: 3 }], total_pages: 2, total_results: 4 });

    expect(service.movies().map((m) => m.id)).toEqual([1, 2, 3]);
    expect(service.hasMore()).toBe(false);
  });

  it('keeps loaded movies when loading the next page fails', () => {
    service.getPopularMovies();
    http.expectOne((r) => r.url.endsWith('/movie/popular')).flush({ results: [{ id: 1 }], total_pages: 3 });

    service.loadMore();
    http.expectOne((r) => r.url.endsWith('/movie/popular')).flush(null, { status: 500, statusText: 'Error' });

    expect(service.movies().length).toBe(1);
    expect(service.loadMoreError()).toBe('errorGeneric');
    expect(service.loadingMore()).toBe(false);
  });

  it('requests data in the selected language and reloads on language change', () => {
    const i18n = TestBed.inject(I18nService);
    TestBed.tick();

    service.getPopularMovies();
    const en = http.expectOne((r) => r.url.endsWith('/movie/popular'));
    expect(en.request.params.get('language')).toBe('en-US');
    en.flush({ results: [] });

    i18n.setLang('ru');
    TestBed.tick();

    const ru = http.expectOne((r) => r.url.endsWith('/movie/popular'));
    expect(ru.request.params.get('language')).toBe('ru-RU');
    ru.flush({ results: [] });
  });
});
