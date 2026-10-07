# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI 프로바이더 프록시. Vite dev 서버가 `/api`를 `localhost:3002`로 프록시한다 (`vite.config.ts:9-14`).

## Tech Stack & Constraints

- 런타임 API는 `Bun.serve`, `process.env`, 전역 `fetch`만 사용한다. 외부 HTTP/SDK 라이브러리는 추가하지 않는다. 현재 모든 프로바이더 호출이 `fetch` 직접 호출이다 (`server/index.ts:69,101`).
- 포트 `3002`는 `server/index.ts:139`와 `vite.config.ts:11`에 중복 정의되어 있다. 변경 시 양쪽을 함께 수정한다.

## Implementation Patterns

- 라우트는 `fetch(req)` 핸들러 하나에서 `method` + `pathname`으로 분기한다. 모든 응답에 `CORS_HEADERS`를 붙인다 (`server/index.ts:51`).
- 프로바이더별 함수 `callXxx(prompt, apiKey)`는 문자열(생성 코드)만 반환한다. 정규화는 호출부에서 한다.
- 키 결정 순서: 클라이언트 입력 > 환경변수 (`resolveApiKey`, `server/index.ts:64-66`).
- 모델 폴백은 `withModelFallback(models, attempt)`를 사용한다 (`server/fallback.ts`). 모델 목록은 우선순위 순서 상수로 둔다 (`GOOGLE_MODELS`, `server/index.ts:5`).

## Testing Strategy

- 단일 실행: `bun run test server/`
- 테스트는 `generator.ts`, `fallback.ts`에만 있다. 이유: `index.ts`는 import 시 서버가 기동된다. 새 로직은 부수효과 없는 모듈로 분리해 테스트를 함께 추가한다.
- 네트워크 호출은 테스트에서 하지 않는다. `vi.fn`으로 `attempt`를 주입한다 (`server/fallback.test.ts`).

## Local Golden Rules

- Asymmetry: Anthropic은 모델 폴백이 없고 단일 모델 `claude-haiku-4-5-20251001` 고정(`server/index.ts:77`), Google만 폴백을 쓴다 (`server/index.ts:135`). Anthropic에 폴백을 추가하려면 `withModelFallback`을 재사용한다.
- Asymmetry: `MAX_TOKENS` 잘림 검사는 Google 경로에만 있다 (`server/index.ts:123`). Anthropic 경로에서 `stop_reason` 검사는 없다. 잘린 코드는 미리보기에서 구문 오류가 된다.
- Double Defense: `render()` 보장은 프롬프트 지시(`server/index.ts:12`)와 `ensureRenderCall` 후처리(`server/generator.ts:258`) 이중으로 한다. 한쪽을 제거하지 마라.
- Do: 에러 상태 매핑(503, 429)은 `message.includes()` 기반이다 (`server/index.ts:194-206`). 프로바이더 에러 포맷을 바꾸면 이 매핑이 깨진다.
- Don't: `withModelFallback`에서 에러 종류와 무관하게 폴백한다 (`server/fallback.ts:15-19`). 인증 실패(401)도 다음 모델로 재시도되므로 모델별 분기가 필요하면 `attempt` 내부에서 처리한다.
