## Epic 1. 문서 생성 및 공유

### US-1: 마크다운 작성/붙여넣기

* **As a** 사용자
* **I want** 웹에서 마크다운을 작성하거나 붙여넣을 수 있고
* **So that** LLM이 만든 아티팩트를 빠르게 공유할 수 있다.
* **Acceptance**

  * 에디터 입력 가능(타이핑/붙여넣기)
  * 1MB 초과 시 업로드 불가 안내

### US-2: 링크 생성(Share)

* **As a** 사용자
* **I want** Share 버튼으로 문서를 업로드하고 공유 링크를 받으며
* **So that** 대화 맥락 없이 문서만 공유할 수 있다.
* **Acceptance**

  * Share 클릭 시 `createDocAction()` 실행
  * presigned URL 발급 후 클라이언트가 R2 업로드
  * 업로드 성공 시 `confirmUploadAction(id)`로 active 전환
  * 결과로 `/d/<id>` 링크를 표시하고 “복사” 제공

### US-3: 기본 가시성은 Unlisted

* **As a** 사용자
* **I want** 기본이 unlisted로 생성되며
* **So that** 링크를 아는 사람만 접근하게 할 수 있다.
* **Acceptance**

  * 생성 시 `visibility=unlisted` 기본
  * (옵션) public 전환은 설정 UI로 제공(최소 MVP에서 토글만 있어도 됨)

### US-4: 만료 설정(preset)

* **As a** 사용자
* **I want** 문서 만료 기간을 1일/7일/30일/영구 중 선택하고
* **So that** 민감한 내용을 자동으로 사라지게 할 수 있다.
* **Acceptance**

  * 기본 7일 선택됨
  * 만료 시각이 DB에 저장됨

---

## Epic 2. 공유 페이지 소비(뷰/원문/다운로드)

### US-5: 공유 페이지 렌더(Reader View)

* **As a** 링크 방문자
* **I want** 공유 링크에서 마크다운이 보기 좋게 렌더링된 페이지를 보고
* **So that** 내용을 쉽게 읽을 수 있다.
* **Acceptance**

  * `/d/<id>` 접근 시 서버가 DB→R2→렌더+sanitize 후 응답
  * `status=pending`이면 업로드 중/실패 안내
  * `status=deleted/blocked`는 적절한 안내

### US-6: Raw 보기

* **As a** 링크 방문자
* **I want** 원문 마크다운을 raw로 볼 수 있고
* **So that** 복사/재사용을 쉽게 할 수 있다.
* **Acceptance**

  * `/raw/<id>`에서 md 원문 반환
  * 권한/만료 체크는 동일하게 적용

### US-7: .md 다운로드

* **As a** 링크 방문자
* **I want** 마크다운 파일을 다운로드할 수 있고
* **So that** 로컬에 저장하거나 다른 툴로 옮길 수 있다.
* **Acceptance**

  * `/download/<id>.md`에서 `Content-Disposition: attachment`로 내려감
  * 파일명 규칙은 `<id>.md` (또는 title 기반은 추후)

### US-8: 만료 문서 처리(410)

* **As a** 링크 방문자
* **I want** 만료된 문서는 명확히 만료 안내를 보고
* **So that** 링크가 왜 안 열리는지 이해할 수 있다.
* **Acceptance**

  * 만료 시 `/d/<id>`는 **410 Gone** + 안내 페이지
  * raw/download도 동일 정책

---

## Epic 3. 작성자 제어(삭제)

### US-9: owner token 기반 삭제

* **As a** 작성자
* **I want** 로그인 없이도 내 문서를 삭제할 수 있고
* **So that** 실수로 공유한 내용을 회수할 수 있다.
* **Acceptance**

  * 생성 시 `ownerToken` 1회 제공(복사 UI)
  * `deleteDocAction(id, ownerToken)`로 삭제 가능
  * DB에는 `owner_token_hash`만 저장
  * 삭제 후 `/d/<id>`는 deleted 안내

---

## Epic 4. 안전성/운영 최소선

### US-10: XSS 안전 렌더

* **As a** 서비스 운영자
* **I want** 공유 페이지가 XSS에 안전하게 렌더링되며
* **So that** 악성 스크립트 유포를 막을 수 있다.
* **Acceptance**

  * Markdown 렌더 시 sanitize 적용
  * 외부 링크에 `rel="noopener noreferrer nofollow"` 적용
  * HTML 태그는 기본 비활성화(또는 엄격 whitelist)

### US-11: Rate limit 및 크기 제한

* **As a** 서비스 운영자
* **I want** 생성/조회 남용을 최소한으로 방지하고
* **So that** 비용 폭증과 스팸을 줄일 수 있다.
* **Acceptance**

  * 생성 요청 rate limit
  * 업로드 1MB 제한(서버/클라 모두)

---

## Epic 5. 성능(Option A 캐시)

### US-12: 캐싱(revalidate 300s)

* **As a** 서비스 운영자
* **I want** immutable 문서 렌더 결과가 캐시되어
* **So that** R2 요청/렌더 비용을 줄일 수 있다.
* **Acceptance**

  * `/d/<id>`는 `revalidate=300s`로 시작
  * 캐시 정책이 만료/삭제 상태와 충돌하지 않도록 안전하게 동작

---
