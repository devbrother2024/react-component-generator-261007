# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정 (`bun.lock` 사용). npm/yarn/pnpm 사용 금지.
- 설치: `bun install`
- 개발 (API + Vite 동시): `bun run dev` — API는 `:3002`, Vite는 `:5173`
- API 서버만: `bun run server` (`bun --watch`)
- 테스트: `bun run test` (vitest run). 단일 파일: `bun run test server/generator.test.ts`
- 타입체크 + 빌드: `bun run build` (`tsc -b && vite build`)
- 린트: `bun run lint`
- 주의: `bun test`는 Bun 내장 러너를 실행하므로 vitest 설정(jsdom, setup)이 적용되지 않는다. 반드시 `bun run test`를 사용한다.

## Golden Rules

### Immutable

- API 키는 서버 밖으로 노출하지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다 (`server/index.ts:147-157`). 키 값을 응답에 포함하지 마라.
- `.env`는 커밋 금지 (`.gitignore:54`). `README.md`가 `.env.example`을 언급하지만 저장소에는 없다. 키 값을 담은 파일을 새로 만들지 마라.
- AI 생성 코드를 소비하는 쪽은 react-live `noInline` 모드다 (`src/components/LivePreview.tsx:14`). 이 모드는 `render(...)` 호출이 없으면 아무것도 그리지 않는다.

### Do's & Don'ts

- Do: AI 응답은 반드시 `ensureRenderCall(stripCodeFences(text))` 순서로 정규화한다 (`server/index.ts:188`). 새 프로바이더를 추가해도 동일 경로를 통과시킨다.
- Do: `SYSTEM_PROMPT`(`server/index.ts:7-49`)를 수정할 때 "import 금지", "인라인 스타일", "TypeScript 문법 금지", "`render(<X />)`로 종료" 제약을 유지한다. 모두 react-live 런타임 제약에서 온 것이다.
- Do: 프로바이더 에러 메시지에 HTTP 상태 코드 문자열(`503`, `429`)을 유지한다. `server/index.ts:194,201`이 `message.includes()`로 상태를 판별한다.
- Do: 새 프로바이더 또는 모델 추가 시 `Provider` 타입이 서버(`server/index.ts:57`)와 프론트(`src/types/index.ts:1`)에 각각 정의되어 있으므로 양쪽을 함께 수정한다.
- Don't: Gemini API 키를 에러 메시지나 로그에 출력하지 마라. 키가 URL 쿼리에 들어간다 (`server/index.ts:99`).
- Don't: 브라우저 코드(`src/`)에서 `server/`를 import하지 마라. `tsconfig.app.json`은 `src`만 포함하고 서버는 Bun 전역(`Bun`, `process.env`)에 의존한다.
- Don't: `server/index.ts`에서 순수 로직을 직접 늘리지 마라. 테스트 가능한 로직은 부수효과 없는 모듈(`server/generator.ts`, `server/fallback.ts`)로 분리한다. `index.ts`는 import 시 `Bun.serve`가 실행되어 테스트가 없다.

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기를 제공하는 도구. 상세는 `README.md` 참고.
- Stack: React 19, TypeScript 5.9, Vite 8, Bun(API 서버), react-live, Vitest 4, Testing Library, ESLint 9.

## Standards & References

- 커밋: `<type>: <한국어 요약>` (예: `feat:`, `chore:`). `commit` 스킬(`.claude/skills/commit/SKILL.md`) 사용. 본문과 주석은 한국어.
- 테스트 파일은 대상 파일 옆에 `*.test.ts(x)`로 둔다 (`vite.config.ts:20` include 패턴: `src/**`, `server/**`).
- 규칙은 하위 파일을 참조한다. 서버와 프론트는 런타임이 다르다.

## Maintenance Policy

- 규칙과 코드 사이에 괴리를 발견하면 즉시 해당 AGENTS.md 업데이트를 제안한다.
- 인용한 파일·라인이 이동하면 규칙의 근거를 갱신한다.

## Context Map

- **[API 서버 수정 (Bun)](./server/AGENTS.md)** — 프로바이더 호출, 응답 정규화, 폴백 로직 수정 시.
- **[프론트엔드 수정 (React)](./src/AGENTS.md)** — 컴포넌트, 훅, 프론트 테스트 작성 시.
