import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/movie-list').then((m) => m.MovieList) },
  {
    path: 'movie/:id',
    loadComponent: () => import('./components/movie-details').then((m) => m.MovieDetailsPage),
  },
  { path: '**', redirectTo: '' },
];
