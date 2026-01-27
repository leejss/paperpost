# Biome 설정 가이드

이 프로젝트는 린팅과 포맷팅을 위해 **Biome**를 사용합니다.

## Biome란?

Biome는 웹 프로젝트를 위한 통합 도구체인으로, 다음과 같은 특징이 있습니다:

- **빠른 포맷터**: Prettier보다 ~35배 빠르며 97% 호환성 제공
- **강력한 린터**: ESLint, TypeScript ESLint 등에서 가져온 426개 이상의 규칙
- **다양한 언어 지원**: JavaScript, TypeScript, JSX, TSX, JSON, HTML, CSS, GraphQL
- **통합 도구**: 린팅과 포맷팅을 하나의 도구로 처리
- **자동 import 정리**: 사용하지 않는 import 자동 제거 및 정렬

## 설치

```bash
npm install --save-dev --save-exact @biomejs/biome
```

## 사용 가능한 명령어

### `npm run lint`
프로젝트의 린트 검사를 실행합니다.

```bash
npm run lint
```

### `npm run format`
프로젝트의 모든 파일을 포맷팅합니다.

```bash
npm run format
```

### `npm run check`
린팅, 포맷팅, import 정리를 모두 실행하고 자동으로 수정합니다.

```bash
npm run check
```

### `npm run ci`
CI/CD 환경에서 사용하기 위한 명령어입니다. 파일을 수정하지 않고 검사만 수행합니다.

```bash
npm run ci
```

## 프로젝트 설정

### `biome.json`

프로젝트의 Biome 설정은 `biome.json` 파일에 정의되어 있습니다:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.13/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "recommended": true
      }
    }
  },
  "css": {
    "parser": {
      "tailwindDirectives": true
    }
  }
}
```

### 주요 설정 내용

- **들여쓰기**: 탭 사용
- **줄 길이**: 최대 100자
- **따옴표**: 큰따옴표 (`"`) 사용
- **세미콜론**: 필요한 경우에만 사용
- **Tailwind CSS**: 지원 활성화
- **접근성 규칙**: 권장 규칙 활성화
- **자동 import 정리**: 저장 시 자동 정렬

## 에디터 통합

### VS Code / Cursor

1. Biome 확장 프로그램 설치:
   - [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

2. 설정 추가 (선택사항):
   ```json
   {
     "[javascript][typescript]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     }
   }
   ```

## ESLint에서 마이그레이션

이 프로젝트는 ESLint에서 Biome로 마이그레이션되었습니다. ESLint와 Prettier는 제거되었으며, Biome가 두 도구의 기능을 모두 제공합니다.

## 참고 자료

- [Biome 공식 문서](https://biomejs.dev/)
- [Biome GitHub](https://github.com/biomejs/biome)
- [Configuration Reference](https://biomejs.dev/reference/configuration/)
