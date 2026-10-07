import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentState } from './usePersistentState';

const parseString = (raw: unknown) => (typeof raw === 'string' ? raw : undefined);

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('저장된 값이 없으면 초기값을 쓴다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init', parseString));
    expect(result.current[0]).toBe('init');
  });

  it('저장된 값이 있으면 그 값으로 시작한다', () => {
    localStorage.setItem('k', JSON.stringify('saved'));
    const { result } = renderHook(() => usePersistentState('k', 'init', parseString));
    expect(result.current[0]).toBe('saved');
  });

  it('값이 바뀌면 localStorage에 저장한다', () => {
    const { result } = renderHook(() => usePersistentState('k', 'init', parseString));
    act(() => result.current[1]('next'));
    expect(JSON.parse(localStorage.getItem('k')!)).toBe('next');
  });
});
