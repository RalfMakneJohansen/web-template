import { favoriteIdsOf, isFavorite, toggleFavoriteId, MAX_FAVORITES } from './favorites';

const userWith = favoriteListingIds => ({
  attributes: { profile: { privateData: { favoriteListingIds } } },
});

describe('favorites', () => {
  it('reads saved ids from private data, ignoring junk', () => {
    expect(favoriteIdsOf(userWith(['a', 2, 'b']))).toEqual(['a', 'b']);
    expect(favoriteIdsOf(null)).toEqual([]);
    expect(favoriteIdsOf(userWith('nope'))).toEqual([]);
  });

  it('knows whether a listing is saved', () => {
    expect(isFavorite(userWith(['a']), 'a')).toBe(true);
    expect(isFavorite(userWith(['a']), 'b')).toBe(false);
  });

  it('saves newest first and un-saves', () => {
    expect(toggleFavoriteId(['a'], 'b')).toEqual(['b', 'a']);
    expect(toggleFavoriteId(['b', 'a'], 'b')).toEqual(['a']);
  });

  it('keeps at most MAX_FAVORITES', () => {
    const full = Array.from({ length: MAX_FAVORITES }, (_, i) => `id${i}`);
    const next = toggleFavoriteId(full, 'new');
    expect(next).toHaveLength(MAX_FAVORITES);
    expect(next[0]).toBe('new');
  });
});
