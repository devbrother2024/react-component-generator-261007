import { describe, it, expect } from 'vitest';
import { MAX_PROMPT_LENGTH, validatePrompt } from './validatePrompt';

describe('validatePrompt', () => {
  it('최대 길이는 500자다', () => {
    expect(MAX_PROMPT_LENGTH).toBe(500);
  });

  it('500자 이하면 유효하다', () => {
    expect(validatePrompt('a'.repeat(500))).toEqual({ valid: true, length: 500 });
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    expect(validatePrompt(`  ${'a'.repeat(500)}\n`)).toEqual({ valid: true, length: 500 });
  });

  it('500자를 넘으면 무효이고 에러 메시지를 반환한다', () => {
    expect(validatePrompt('a'.repeat(501))).toEqual({
      valid: false,
      length: 501,
      error: '프롬프트는 500자 이하로 입력해주세요.',
    });
  });
});
