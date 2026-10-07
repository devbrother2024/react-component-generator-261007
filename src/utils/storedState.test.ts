import { describe, it, expect } from 'vitest';
import { parseApiKeys, parseComponents, parseProvider } from './storedState';

describe('parseProvider', () => {
  it('유효한 provider면 그대로 반환한다', () => {
    expect(parseProvider('anthropic')).toBe('anthropic');
    expect(parseProvider('google')).toBe('google');
  });

  it('알 수 없는 값이면 undefined를 반환한다', () => {
    expect(parseProvider('openai')).toBeUndefined();
    expect(parseProvider(1)).toBeUndefined();
  });
});

describe('parseApiKeys', () => {
  it('provider별 문자열 키를 반환한다', () => {
    expect(parseApiKeys({ anthropic: 'a', google: 'g' })).toEqual({ anthropic: 'a', google: 'g' });
  });

  it('누락된 provider는 빈 문자열로 채운다', () => {
    expect(parseApiKeys({ google: 'g' })).toEqual({ anthropic: '', google: 'g' });
  });

  it('문자열이 아닌 값은 빈 문자열로 처리한다', () => {
    expect(parseApiKeys({ anthropic: 1, google: 'g' })).toEqual({ anthropic: '', google: 'g' });
  });

  it('객체가 아니면 undefined를 반환한다', () => {
    expect(parseApiKeys('key')).toBeUndefined();
    expect(parseApiKeys(null)).toBeUndefined();
  });
});

describe('parseComponents', () => {
  const stored = { id: '1', prompt: 'p', code: 'c', createdAt: '2026-01-02T03:04:05.000Z' };

  it('createdAt 문자열을 Date로 복원한다', () => {
    const [component] = parseComponents([stored])!;
    expect(component.createdAt).toBeInstanceOf(Date);
    expect(component.createdAt.toISOString()).toBe(stored.createdAt);
    expect(component).toMatchObject({ id: '1', prompt: 'p', code: 'c' });
  });

  it('배열이 아니면 undefined를 반환한다', () => {
    expect(parseComponents({})).toBeUndefined();
  });

  it('형식이 맞지 않는 항목은 건너뛴다', () => {
    const result = parseComponents([stored, { id: '2' }, null, { ...stored, id: '3', createdAt: 'nope' }]);
    expect(result?.map((c) => c.id)).toEqual(['1']);
  });
});
