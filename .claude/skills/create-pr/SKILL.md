---
name: create-pr
description: 현재 브랜치의 변경사항을 분석해 템플릿에 맞는 Pull Request를 생성한다. 한국어 저장소는 한국어 템플릿, 그 외는 영문 템플릿을 쓴다. "PR 만들어줘", "PR 생성", "풀리퀘스트 올려줘", "create a PR" 같은 요청에 활성화한다.
context: fork
allowed-tools: Bash(git *), Bash(gh *), Read, Glob, Grep
---

# Create PR

현재 브랜치를 기준 브랜치에 대한 Pull Request로 생성한다. 이 스킬은 서브 에이전트(`context: fork`)에서 실행되므로 이전 대화 내용을 볼 수 없다. 필요한 정보는 모두 git 이력과 diff에서 직접 수집한다.

인자가 있으면 기준(base) 브랜치로 사용한다. 없으면 저장소의 기본 브랜치를 쓴다.

## 절차

### 1. 상태 확인

- `git branch --show-current`로 현재 브랜치를 확인한다.
- 기본 브랜치는 `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`으로 확인한다.
- 현재 브랜치가 기본 브랜치이면 PR을 만들 수 없다. 그 사실만 알리고 멈춘다.
- `git status`에 커밋되지 않은 변경이 있으면 PR에 포함되지 않는다는 점을 최종 보고에 적는다. 커밋은 대신 하지 않는다.
- `gh pr list --head <현재 브랜치> --state open`으로 이미 열린 PR이 있는지 확인한다. 있으면 그 URL만 알리고 멈춘다.
- `gh`가 설치돼 있지 않거나 인증되지 않았으면 그 사실만 알리고 멈춘다.

### 2. 변경 내용 수집

- `git log <base>..HEAD --oneline`으로 PR에 포함될 커밋을 확인한다.
- `git diff <base>...HEAD --stat`으로 변경 범위를, `git diff <base>...HEAD`로 실제 변경을 읽는다.
- 포함될 커밋이 없으면 그 사실만 알리고 멈춘다.
- diff에 `.env`, 키, 토큰 등 비밀 정보가 보이면 PR을 만들지 말고 사용자에게 알린다.

### 3. 템플릿 언어 선택

아래 순서로 판단하고, 먼저 해당하는 쪽을 쓴다.

1. 인자에 `ko` 또는 `en`이 명시돼 있으면 그대로 따른다.
2. `git log -10 --format=%s`의 커밋 제목이나 `README.md`에 한글이 주로 쓰였으면 한국어.
3. 그 외는 영어.

| 언어 | 템플릿 |
| --- | --- |
| 한국어 | [references/template.ko.md](references/template.ko.md) |
| 영어 | [references/template.en.md](references/template.en.md) |

선택한 템플릿 파일을 Read로 읽어 구조를 그대로 따른다. 섹션 제목을 바꾸거나 빼지 않는다. 해당 사항이 없는 섹션은 `해당 없음` / `N/A`로 채운다.

### 4. 제목과 본문 작성

- 제목은 커밋 컨벤션과 같은 `<type>: <요약>` 형식을 쓴다. type은 `feat`, `fix`, `refactor`, `chore` 중 하나다.
- 한국어 템플릿이면 요약도 한국어로, 영문 템플릿이면 영어로 쓴다. 70자를 넘기지 않고 마침표는 붙이지 않는다.
- 커밋이 여러 개면 가장 큰 목적을 기준으로 type을 정한다.
- 본문은 "무엇을 바꿨는지"보다 "왜 바꿨는지, 어떤 효과가 있는지"가 드러나게 쓴다.
- 테스트 계획에는 실제로 실행해 확인한 것만 체크(`[x]`)한다. 실행하지 않은 항목은 체크하지 않는다.
- 본문 마지막에 아래 줄을 항상 붙인다.

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 5. PR 생성

- 현재 브랜치가 원격에 없으면 `git push -u origin <현재 브랜치>`로 먼저 올린다. 이미 있으면 push하지 않는다.
- 본문은 여러 줄이므로 heredoc으로 임시 파일 없이 `--body-file -`에 전달한다.

```bash
gh pr create --base <base> --title "<제목>" --body-file - <<'EOF'
<본문>
EOF
```

- 사용자가 `--draft`를 요청했을 때만 draft로 만든다.
- 생성 후 PR URL, 제목, 사용한 템플릿 언어, 포함된 커밋 수를 보고한다.

## 하지 않는 일

- 기본 브랜치에 직접 push하지 않는다. `--force` push도 하지 않는다.
- 커밋되지 않은 변경을 대신 커밋하지 않는다. 필요하면 `commit` 스킬을 쓰라고 안내한다.
- 리뷰어, 라벨, 마일스톤은 사용자가 요청할 때만 지정한다.
- 이미 열린 PR의 내용을 덮어쓰지 않는다.
