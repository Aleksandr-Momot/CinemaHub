import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form (submit)="submit($event)" class="flex gap-2">
      <input
        type="search"
        name="query"
        [placeholder]="i18n.t('searchPlaceholder')"
        autocomplete="off"
        [value]="text()"
        (input)="onInput($event)"
        class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 outline-none focus:border-amber-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-amber-400"
      />
      <button
        type="submit"
        class="rounded-lg bg-amber-400 px-5 py-2 font-semibold text-slate-900 transition hover:bg-amber-300"
      >
        {{ i18n.t('searchButton') }}      </button>
    </form>
  `,
})
export class SearchBar implements OnInit {
  protected readonly i18n = inject(I18nService);
  readonly value = input('');
  readonly search = output<string>();

  protected readonly text = signal('');
  private readonly typed = new Subject<string>();

  constructor() {
    this.typed
      .pipe(
        map((text) => text.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((text) => this.search.emit(text));
  }

  ngOnInit(): void {
    this.text.set(this.value());
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.text.set(text);
    this.typed.next(text);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.search.emit(this.text().trim());
  }
}
