# PaperPost

Markdown과 단일 HTML 문서를 작성하고 공유할 수 있는 간단한 서비스입니다.

## 기능

- 마크다운 에디터로 문서 작성
- 실시간 미리보기
- HTML 파일 업로드 또는 코드 붙여넣기 후 미리보기·공유
- HTML의 CSS·JavaScript를 격리된 iframe에서 실행
- 공유 문서·원문·다운로드에 검색엔진 색인 제외 설정
- 공개/비공개 설정으로 공유
- 1일/7일/30일/영구 유효기간 선택
- 생성한 문서 관리 (삭제 기능)

## 인증 및 권한 정책

- 인증은 이메일/비밀번호 기반 계정 시스템을 사용합니다.
- 문서 생성은 로그인 여부와 무관하게 가능합니다.
- 로그인한 상태에서 생성한 문서는 `userId`가 연결되어 소유권 기반 관리가 가능합니다.
- 소유권이 연결되지 않은 문서(기존/익명 생성)는 owner token 기반 삭제를 지원합니다.

## 아키텍처

### 데이터 흐름

```
Markdown: 사용자 → Next.js Server Actions → Database (Neon) / R2
HTML: 사용자 → Server Actions (메타데이터와 업로드 URL 발급)
           → R2로 직접 업로드 → Server Actions (크기·형식·소유 토큰 확인 후 활성화)
HTML 열람·원문·다운로드: R2 → Next.js 스트리밍 응답 → 브라우저
```

### 저장 구조

- **Database**: 문서 메타데이터 (ID, 유효기간, 공개설정, 상태 등)
- **R2 Storage**: 실제 문서 내용 (`docs/{id}.md` 또는 `docs/{id}.html`로 저장)

## HTML 사용 방법 및 제한

- 작성 화면에서 **Markdown ↔ HTML 스위치**로 HTML을 선택하고 `.html`/`.htm` 파일 1개를 업로드하거나 코드를 붙여넣습니다. 스위치는 키보드 Space/Enter로도 전환할 수 있습니다.
- UTF-8 기준 HTML은 최대 **20MB**, Markdown은 **1MB**를 지원합니다. 초안은 형식을 전환해도 각각 유지됩니다.
- 미리보기에서 확인한 뒤 기존과 동일하게 만료기간을 정해 공유할 수 있습니다.
- CSS·JavaScript·이미지는 HTML 안에 포함하거나 절대 HTTPS 주소로 참조해야 합니다. 상대경로의 별도 파일은 업로드하지 않습니다.
- HTML은 `sandbox="allow-scripts"` 프레임으로 표시됩니다. 부모 화면·쿠키·저장소 접근, 폼 제출, 팝업 및 내부 iframe은 제한됩니다. 외부 HTTPS 리소스는 해당 서버의 CORS 정책에 따라 동작합니다.
- 원문은 `text/plain`, 다운로드는 `.html` 첨부파일로 반환하며 원본 내용을 유지합니다.
- 기존 Markdown은 저장 키의 `.md` 확장자로 구분하므로 DB 변경이 필요하지 않습니다.

## 큰 HTML 파일 배포 설정

- HTML 본문은 5분간 유효한 서명 URL로 브라우저에서 R2에 직접 업로드합니다. 파일 크기·형식·신규 객체 조건을 서명하고, 업로드 확인 시 소유 토큰과 실제 객체 크기·형식을 검사합니다. 같은 업로드 URL로 공유된 파일을 덮어쓸 수 없습니다.
- 공유 페이지에는 HTML 전체를 넣지 않고 `/html/{id}`의 격리된 스트리밍 응답을 표시합니다. 원문·다운로드도 스트리밍합니다. 이는 [Vercel Function의 요청·응답 용량 제한](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)을 고려한 구조입니다.
- 브라우저의 직접 업로드를 허용하려면 **R2 버킷 CORS 설정이 필요합니다**. 실제 앱 origin으로 다음 예시를 수정해 적용하세요. 로컬 검증 시에는 사용하는 `http://localhost:3000` 또는 `http://127.0.0.1:3000` origin도 추가해야 합니다. 버킷 공개 설정은 필요하지 않습니다.

```json
[
  {
    "AllowedOrigins": ["https://your-app.example"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type", "Content-Length", "If-None-Match"],
    "MaxAgeSeconds": 3600
  }
]
```

- R2 연결 후 실제 브라우저에서 20MB 업로드·공유 열람·다운로드와 CORS 정책을 확인해야 합니다. [R2 CORS 안내](https://developers.cloudflare.com/r2/buckets/cors/)

## 검색 노출 정책

- `/d/*`에는 robots 메타 태그, `/d/*`·`/html/*`·`/raw/*`·`/download/*`에는 `X-Robots-Tag: noindex, nofollow, noarchive` 헤더를 적용합니다. 기존 문서에도 적용됩니다.
- 검색엔진이 `noindex`를 읽을 수 있도록 해당 경로를 `robots.txt`로 차단하지 않습니다.
- 검색 제외는 접근 제한이 아닙니다. 링크를 아는 사람은 열람할 수 있으며, 이미 색인된 링크는 검색엔진의 재수집 이후 반영됩니다.
- R2 버킷은 비공개로 운영해야 합니다. 버킷의 공개 주소로 직접 제공하면 앱의 검색 제외 헤더와 실행 격리를 우회하게 됩니다.
