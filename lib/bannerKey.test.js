import { describe, test, expect } from 'vitest';
import { bannerKey } from './bannerKey.js';

describe('bannerKey', () => {
  test('is stable for identical content', () => {
    expect(bannerKey('notificationHidden', 'Jul 23, 2026', 'text'))
      .toBe(bannerKey('notificationHidden', 'Jul 23, 2026', 'text'));
  });

  test('keeps a readable scope prefix', () => {
    expect(bannerKey('notificationHidden', 'text')).toMatch(/^notificationHidden:[0-9a-z]+$/);
  });

  test('changes when the data date changes', () => {
    expect(bannerKey('notificationHidden', 'Jul 23, 2026', 'text'))
      .not.toBe(bannerKey('notificationHidden', 'Jul 24, 2026', 'text'));
  });

  test('changes when any message part changes', () => {
    expect(bannerKey('disclaimerHidden', 'Disclaimer', 'old wording'))
      .not.toBe(bannerKey('disclaimerHidden', 'Disclaimer', 'new wording'));
  });

  test('ignores absent parts, so a missing date equals no date part', () => {
    expect(bannerKey('notificationHidden', null, 'text')).toBe(bannerKey('notificationHidden', 'text'));
  });

  test('does not collide when content shifts between parts', () => {
    expect(bannerKey('s', 'ab', 'c')).not.toBe(bannerKey('s', 'a', 'bc'));
  });
});
