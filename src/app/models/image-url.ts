const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function imageUrl(path: string | null, size: 'w342' | 'w500' = 'w500'): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
