import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

const parseString = (raw: unknown) => (typeof raw === 'string' ? raw : undefined);

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 fallback을 반환한다', () => {
    expect(readStorage('k', 'fallback', parseString)).toBe('fallback');
  });

  it('writeStorage로 저장한 값을 readStorage로 읽는다', () => {
    writeStorage('k', 'value');
    expect(readStorage('k', 'fallback', parseString)).toBe('value');
  });

  it('JSON이 깨져 있으면 fallback을 반환한다', () => {
    localStorage.setItem('k', '{not json');
    expect(readStorage('k', 'fallback', parseString)).toBe('fallback');
  });

  it('parse가 undefined를 반환하면 fallback을 반환한다', () => {
    localStorage.setItem('k', JSON.stringify(123));
    expect(readStorage('k', 'fallback', parseString)).toBe('fallback');
  });

  it('localStorage 접근이 실패해도 읽기는 fallback을 반환한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readStorage('k', 'fallback', parseString)).toBe('fallback');
    vi.restoreAllMocks();
  });

  it('localStorage 쓰기가 실패해도 예외를 던지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => writeStorage('k', 'value')).not.toThrow();
    vi.restoreAllMocks();
  });
});
