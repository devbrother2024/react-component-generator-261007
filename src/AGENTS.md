# src/AGENTS.md

## Module Context

Vite + React 19 브라우저 앱. 서버와는 `/api/generate`, `/api/config` HTTP로만 통신한다 (`src/hooks/useComponentGenerator.ts:23`).

## Tech Stack & Constraints

- 브라우저 전용. `Bun`/`process`/`server/` import 금지.
- tsconfig 엄격 옵션: `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `verbatimModuleSyntax` (`tsconfig.app.json`). 타입 import는 `import type`을 사용하고, `enum`/`namespace`/생성자 파라미터 프로퍼티는 쓰지 않는다.

## Implementation Patterns

- 서버 호출과 상태는 `src/hooks/useComponentGenerator.ts`에 모은다. 컴포넌트에서 `fetch`를 직접 호출하지 않는다.
- 공용 타입은 `src/types/index.ts`.
- 컴포넌트는 named export, 파일명은 PascalCase (`LivePreview.tsx`, `PromptInput.tsx`).
- 스타일은 `src/App.css`, `src/index.css`의 클래스 기반이다. 생성된 컴포넌트 코드만 인라인 스타일을 쓴다.

## Testing Strategy

- 실행: `bun run test src/`
- 환경은 jsdom, 전역 설정은 `src/test/setup.ts` (jest-dom 매처, 각 테스트 후 `cleanup()`). `afterEach` 정리를 테스트에서 중복하지 않는다.
- 패턴: `@testing-library/react` + `userEvent` (`src/components/PromptInput.test.tsx`).
- 테스트 경계: 테스트가 있는 곳은 `PromptInput`뿐이다. `LivePreview`, `useComponentGenerator`, `CodeView`, `ComponentCard`는 테스트가 없다. 훅 수정 시 `fetch` 모킹 테스트를 함께 추가한다.

## Local Golden Rules

- Hard Constraint: `LivePreview`는 `<LiveProvider code={code} noInline>`을 쓴다 (`src/components/LivePreview.tsx:14`). `noInline`을 제거하면 서버가 생성하는 `render(<X />)` 형식 코드가 동작하지 않는다.
- Do: 서버 에러 응답은 `data.error`를 사용자 메시지로 표시한다 (`src/hooks/useComponentGenerator.ts:31-33`). 서버 에러 문구는 한국어 사용자 노출용이므로 가공하지 않는다.
- Do: `apiKey`는 값이 있을 때만 요청 본문에 포함한다 (`src/hooks/useComponentGenerator.ts:26`). 빈 문자열을 보내면 서버가 환경변수 키로 폴백하지 못할 수 있다 (`server/index.ts:65`는 `||` 이므로 안전하지만 의도를 유지한다).
- Don't: API 키를 `localStorage` 등에 저장하거나 로그로 남기지 마라. 현재 키는 요청 본문으로만 전달된다.
