import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Lang = 'ru' | 'en';

const ru = {
  searchPlaceholder: 'Название фильма...',
  searchButton: 'Поиск',
  popularMovies: 'Популярные фильмы',
  resultsFor: 'Результаты по запросу',
  nothingFound: 'Ничего не найдено.',
  retry: 'Повторить',
  loading: 'Загрузка',
  lightTheme: 'Светлая тема',
  darkTheme: 'Тёмная тема',
  scrollTop: 'Наверх',
  madeBy: 'Сделано:',
  tmdbNotice: 'Этот продукт использует TMDB API, но не одобрен и не сертифицирован',
  noPoster: 'Нет постера',
  back: 'Назад',
  overview: 'Описание',
  noOverview: 'Описание отсутствует.',
  minutes: 'мин.',
  errorNetwork: 'Нет соединения с сервером. Проверьте интернет.',
  errorUnauthorized: 'Неверный токен доступа TMDb.',
  errorNotFound: 'Фильм не найден.',
  errorGeneric: 'Не удалось загрузить данные. Попробуйте позже.',
};

export type MessageKey = keyof typeof ru;

const en: Record<MessageKey, string> = {
  searchPlaceholder: 'Movie title...',
  searchButton: 'Search',
  popularMovies: 'Popular movies',
  resultsFor: 'Results for',
  nothingFound: 'Nothing found.',
  retry: 'Retry',
  loading: 'Loading',
  lightTheme: 'Light theme',
  darkTheme: 'Dark theme',
  scrollTop: 'Back to top',
  madeBy: 'Made by',
  tmdbNotice: 'This product uses the TMDB API but is not endorsed or certified by',
  noPoster: 'No poster',
  back: 'Back',
  overview: 'Overview',
  noOverview: 'No overview available.',
  minutes: 'min',
  errorNetwork: 'No connection to the server. Check your internet.',
  errorUnauthorized: 'Invalid TMDb access token.',
  errorNotFound: 'Movie not found.',
  errorGeneric: 'Failed to load data. Please try again later.',
};

const dictionaries: Record<Lang, Record<MessageKey, string>> = { ru, en };
const TMDB_LANGUAGES: Record<Lang, string> = { ru: 'ru-RU', en: 'en-US' };
const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly langSignal = signal<Lang>(this.readStoredLang());

  readonly lang = this.langSignal.asReadonly();
  readonly languages: readonly Lang[] = ['en', 'ru'];

  constructor() {
    effect(() => {
      const lang = this.langSignal();
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
      }
    });
  }

  t(key: MessageKey): string {
    return dictionaries[this.langSignal()][key];
  }

  tmdbLanguage(): string {
    return TMDB_LANGUAGES[this.langSignal()];
  }

  setLang(lang: Lang): void {
    this.langSignal.set(lang);
  }

  private readStoredLang(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'ru' ? 'ru' : 'en';
    } catch {
      return 'en';
    }
  }
}
