# AI 지역사회 문제 해결 플랫폼

인공지능 기술을 활용하여 지역사회의 다양한 문제를 해결하는 웹 플랫폼입니다.

## 주요 기능

- 지역사회 문제 등록 및 공유
- AI 기반 해결책 자동 생성
- 커뮤니티 기반 해결책 논의 및 개선
- 사용자 인증 시스템
- 반응형 디자인 (모바일, 태블릿, 데스크탑 지원)

## 기술 스택

- **프론트엔드**: Next.js, React, TypeScript, Tailwind CSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: MongoDB, Mongoose
- **인증**: NextAuth.js
- **AI**: OpenAI API
- **배포**: Vercel

## 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- MongoDB 계정
- OpenAI API 키

### 설치 방법

1. 저장소 클론

```bash
git clone https://github.com/yourusername/ai-community-problem-solver.git
cd ai-community-problem-solver
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

4. 개발 서버 실행

```bash
npm run dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

```
src/
├── app/                  # Next.js 앱 라우터
│   ├── (auth)/           # 인증 관련 페이지
│   ├── api/              # API 엔드포인트
│   ├── problems/         # 문제 관련 페이지
│   ├── solutions/        # 해결책 관련 페이지
│   └── profile/          # 사용자 프로필 페이지
├── components/           # 재사용 가능한 컴포넌트
├── lib/                  # 유틸리티 함수 및 설정
└── models/               # MongoDB 모델
```

## 배포

이 프로젝트는 Vercel을 통해 쉽게 배포할 수 있습니다:

```bash
npm run build
vercel --prod
```

## 라이센스

MIT

## 기여하기

기여는 언제나 환영합니다! 이슈를 생성하거나 풀 리퀘스트를 보내주세요.
