export const MAX_HISTORY = 20;

export function addToHistory(history: string[], prompt: string): string[] {
  return [prompt, ...history.filter((p) => p !== prompt)].slice(0, MAX_HISTORY);
}

export function parseHistory(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw) || !raw.every((p) => typeof p === 'string')) return undefined;
  return raw;
}
