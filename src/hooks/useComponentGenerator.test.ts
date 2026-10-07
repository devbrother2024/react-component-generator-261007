import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/storage';

const stored = { id: '1', prompt: 'saved', code: 'render(<div />)', createdAt: '2026-01-02T03:04:05.000Z' };

describe('useComponentGenerator 영속화', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<p />)' }) }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('저장된 컴포넌트 목록을 초기값으로 불러온다', () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([stored]));
    const { result } = renderHook(() => useComponentGenerator());
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('생성한 컴포넌트를 localStorage에 저장한다', async () => {
    const { result } = renderHook(() => useComponentGenerator());
    await act(() => result.current.generate('새 프롬프트', undefined, 'google'));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.components)!);
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({ prompt: '새 프롬프트', code: 'render(<p />)' });
    });
  });

  it('삭제하면 localStorage에도 반영된다', async () => {
    localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([stored]));
    const { result } = renderHook(() => useComponentGenerator());
    act(() => result.current.removeComponent('1'));

    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.components)!)).toEqual([]);
    });
  });
});
