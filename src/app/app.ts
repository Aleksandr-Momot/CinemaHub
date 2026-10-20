import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { Footer } from './components/footer';
import { ScrollTop } from './components/scroll-top';
import { I18nService } from './services/i18n.service';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [RouterOutlet, RouterLink, ScrollTop, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('CinemaHub');
  protected readonly i18n = inject(I18nService);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly showFooter = computed(() => this.url().startsWith('/movie/'));
}
