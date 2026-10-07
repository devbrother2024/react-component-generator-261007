export const STORAGE_KEYS = {
  apiKeys: 'rcg:apiKeys',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;

// 저장소 접근/파싱 실패나 형식 불일치는 모두 fallback으로 처리한다.
export function readStorage<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T | undefined,
): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return parse(JSON.parse(stored)) ?? fallback;
  } catch {
    return fallback;
  }
}

// 용량 초과, 사생활 보호 모드 등으로 쓰기가 실패해도 앱 동작은 막지 않는다.
export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 무시
  }
}
