# 🐾 PawLog - 반려동물 케어 일기장

반려동물과 함께하는 소중한 순간들을 기록하고 관리하는 종합 케어 플랫폼입니다.

## ✨ 주요 기능

### 📱 핵심 기능
- **반려견 프로필 관리**: 여러 반려견의 정보를 체계적으로 관리
- **루틴 기록**: 산책, 식사, 배변, 양치 등 일상 루틴 추적
- **건강 관리**: 예방접종, 건강검진, 투약, 미용, 수술 기록
- **감성 일기**: 사진과 함께하는 감정 기반 일기 작성
- **리마인더**: 건강 관리 일정 알림 시스템

### 🌍 커뮤니티 기능 (NEW!)
- **공개 일기**: 일기를 커뮤니티에 공개하여 다른 펫 가족들과 공유
- **좋아요 & 댓글**: 다른 사용자의 일기에 반응하고 소통
- **피드 시스템**: 실시간으로 업데이트되는 커뮤니티 피드
- **감정 공유**: 반려동물의 감정과 특별한 순간들을 함께 나누기

## 🚀 시작하기

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── community/         # 커뮤니티 피드 페이지
│   ├── diary/             # 감성 일기 관련 페이지
│   ├── health/            # 건강 관리 페이지
│   ├── records/           # 루틴 기록 페이지
│   └── onboarding/        # 온보딩 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   └── CommunityFeed.tsx # 커뮤니티 피드 컴포넌트
├── lib/                   # 유틸리티 및 상태 관리
│   ├── store.ts          # Zustand 상태 관리
│   ├── types.ts          # TypeScript 타입 정의
│   └── utils.ts          # 유틸리티 함수
└── styles/               # 스타일 파일
```

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **상태 관리**: Zustand with Persist
- **스타일링**: Tailwind CSS
- **아이콘**: Lucide React
- **데이터 저장**: localStorage (MVP), Firebase 확장 예정

## 📊 데이터 구조

### 커뮤니티 기능 관련 타입

```typescript
// 일기 엔트리 (커뮤니티 필드 포함)
interface DiaryEntry {
  id: string;
  dogId: string;
  content: string;
  mood: MoodType;
  photos: string[];
  // 커뮤니티 관련 필드
  isPublic: boolean;    // 공개 여부
  userId: string;       // 작성자 ID
  nickname: string;     // 작성자 닉네임
  // ... 기타 필드들
}

// 공개 일기 (피드용)
interface PublicDiary extends DiaryEntry {
  dogName: string;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
}

// 댓글
interface Comment {
  id: string;
  diaryId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
}
```

## 🎯 MVP 구현 상태

### ✅ 완료된 기능
- [x] 반려견 프로필 관리
- [x] 루틴 기록 (산책, 식사, 배변, 양치)
- [x] 건강 관리 (예방접종, 건강검진, 투약, 미용, 수술)
- [x] 감성 일기 작성
- [x] 리마인더 시스템
- [x] localStorage 기반 데이터 저장
- [x] **커뮤니티 피드 UI/UX**
- [x] **공개 일기 작성 기능**
- [x] **좋아요/댓글 시스템 (UI)**
- [x] **목 데이터 기반 피드 시뮬레이션**

### 🔄 진행 중 (MVP2 예정)
- [ ] Firebase 백엔드 연동
- [ ] 실제 사용자 인증 시스템
- [ ] 실시간 커뮤니티 기능
- [ ] 푸시 알림
- [ ] 사진 업로드 및 저장
- [ ] 데이터 동기화

## 🌟 커뮤니티 기능 사용법

### 1. 공개 일기 작성
1. 일기 작성 페이지에서 "커뮤니티에 공개" 체크박스 선택
2. 일기 작성 완료 후 저장
3. 자동으로 커뮤니티 피드에 추가됨

### 2. 커뮤니티 피드 이용
1. 홈 화면에서 "🌍 커뮤니티" 버튼 클릭
2. 다른 펫 가족들의 공개 일기 확인
3. 좋아요 버튼으로 반응 표현
4. 댓글로 따뜻한 소통

### 3. 공개 여부 확인
- 내 일기 목록에서 "🌍 공개됨" 또는 "🔒 나만 보기" 뱃지로 구분
- 언제든지 공개 설정 변경 가능

## 🔮 향후 계획

### Phase 2: Firebase 연동
- 실제 사용자 인증 (Google, 카카오 로그인)
- Firestore 데이터베이스 연동
- 실시간 커뮤니티 기능
- 클라우드 사진 저장

### Phase 3: 고급 기능
- AI 기반 건강 분석
- 수의사 상담 연결
- 반려동물 용품 추천
- 지역 기반 커뮤니티

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해 주세요.

---

**PawLog**와 함께 반려동물과의 소중한 순간들을 기록하고, 전 세계 펫 가족들과 따뜻한 소통을 나누어보세요! 🐾💕
