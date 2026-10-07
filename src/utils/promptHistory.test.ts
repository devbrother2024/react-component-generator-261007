import { describe, it, expect } from 'vitest';
import { MAX_HISTORY, addToHistory, parseHistory } from './promptHistory';

describe('addToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addToHistory(['a'], 'b')).toEqual(['b', 'a']);
  });

  it('이미 있는 프롬프트는 중복 없이 맨 앞으로 옮긴다', () => {
    expect(addToHistory(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it(`최대 ${MAX_HISTORY}개까지만 유지한다`, () => {
    const history = Array.from({ length: MAX_HISTORY }, (_, i) => `p${i}`);
    const next = addToHistory(history, 'new');
    expect(next).toHaveLength(MAX_HISTORY);
    expect(next[0]).toBe('new');
    expect(next).not.toContain(`p${MAX_HISTORY - 1}`);
  });
});

describe('parseHistory', () => {
  it('문자열 배열이면 그대로 반환한다', () => {
    expect(parseHistory(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('배열이 아니면 undefined를 반환한다', () => {
    expect(parseHistory('a')).toBeUndefined();
  });

  it('문자열이 아닌 요소가 섞여 있으면 undefined를 반환한다', () => {
    expect(parseHistory(['a', 1])).toBeUndefined();
  });
});
