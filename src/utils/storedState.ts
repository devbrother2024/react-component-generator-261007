import type { GeneratedComponent, Provider } from '../types';

export type ApiKeys = Record<Provider, string>;

export const EMPTY_API_KEYS: ApiKeys = { anthropic: '', google: '' };

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === 'object' && raw !== null;

export function parseProvider(raw: unknown): Provider | undefined {
  return raw === 'anthropic' || raw === 'google' ? raw : undefined;
}

export function parseApiKeys(raw: unknown): ApiKeys | undefined {
  if (!isRecord(raw)) return undefined;
  const pick = (value: unknown) => (typeof value === 'string' ? value : '');
  return { anthropic: pick(raw.anthropic), google: pick(raw.google) };
}

// 형식이 깨진 항목만 건너뛰어 나머지 목록은 살린다. createdAt은 JSON에서 문자열이 되므로 Date로 복원한다.
export function parseComponents(raw: unknown): GeneratedComponent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const components: GeneratedComponent[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const { id, prompt, code, createdAt } = item;
    if (typeof id !== 'string' || typeof prompt !== 'string' || typeof code !== 'string') continue;
    if (typeof createdAt !== 'string') continue;
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) continue;
    components.push({ id, prompt, code, createdAt: date });
  }
  return components;
}
