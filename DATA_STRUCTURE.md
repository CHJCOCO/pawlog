# PawLog MVP 데이터 구조 설계

## 🎯 MVP 핵심 목표
"기능보다 감성" - 따뜻하고 안정적인 톤으로 반려견과의 감정적 연결을 우선시하는 펫 다이어리 앱

## 📊 데이터 저장 방식

### 현재 (MVP)
- **localStorage** 기반 로컬 저장
- **Zustand** 상태 관리
- **JSON** 형태 데이터 저장
- 단일 사용자 / 다중 반려견 지원

### 확장 계획 (Firebase 도입시)
- **Firestore** 실시간 동기화
- **Firebase Auth** 사용자 인증
- **Cloud Storage** 이미지 저장
- **FCM** 푸시 알림

## 🗂️ 데이터 모델

### 1. User (사용자 프로필)
```typescript
interface User {
  id: string;
  email: string;              // 로컬 식별용 (MVP 핵심)
  name?: string;
  avatar?: string;            // Base64 (MVP) → URL (Firebase)
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    defaultReminder: number;  // 기본 리마인더 일수
    darkMode: boolean;
    language: 'ko' | 'en';
  };
  // Firebase 확장시
  firebaseUid?: string;
  subscription?: 'free' | 'premium';
  lastSync?: Date;
}
```

### 2. Dog (반려견 프로필)
```typescript
interface Dog {
  id: string;
  name: string;
  breed: string;
  birthDate: Date;
  weight: number;
  photo?: string;             // Base64 (MVP) → URL (Firebase)
  gender: 'male' | 'female';
  isNeutered: boolean;
  microchipId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Firebase 확장시
  ownerId?: string;
  isActive?: boolean;
}
```

### 3. RoutineRecord (루틴 기록)
```typescript
interface RoutineRecord {
  id: string;
  dogId: string;
  type: 'walk' | 'meal' | 'poop' | 'pee' | 'play' | 'training';
  timestamp: Date;
  // 산책 관련
  duration?: number;          // 분
  distance?: number;          // km
  // 식사 관련
  amount?: string;            // "1컵", "50g"
  foodType?: string;
  // 공통
  notes?: string;
  weather?: string;
  location?: string;
  photos?: string[];          // Base64 배열
  mood?: MoodType;
  createdAt: Date;
  // Firebase 확장시
  syncStatus?: 'local' | 'synced' | 'conflict';
}
```

### 4. HealthRecord (건강 기록) - MVP 핵심!
```typescript
interface HealthRecord {
  id: string;
  dogId: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'grooming' | 'dental' | 'surgery' | 'emergency' | 'supplement';
  title: string;
  description?: string;
  date: Date;
  nextDate?: Date;            // 리마인더용 (MVP 핵심!)
  // 병원 정보
  veterinarian?: string;
  clinic?: string;
  cost?: number;
  // 약물/백신 세부정보
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: number;
  vaccineName?: string;
  batchNumber?: string;
  // 첨부 파일
  attachments?: string[];     // Base64 배열
  notes?: string;
  completed: boolean;
  // 리마인더 설정 (MVP 핵심!)
  reminderEnabled: boolean;
  reminderDays?: number;      // 며칠 전 알림
  createdAt: Date;
  updatedAt?: Date;
}
```

### 5. DiaryEntry (감성 일기) - MVP 핵심!
```typescript
interface DiaryEntry {
  id: string;
  dogId: string;
  date: Date;
  title?: string;
  content: string;            // 일기 내용 (MVP 핵심!)
  photos: string[];           // 사진들 (MVP 핵심!)
  mood: MoodType;             // 감정 태그 (MVP 핵심!)
  weather?: string;
  tags?: string[];            // #산책 #놀이 #간식
  // 감성 요소들
  specialMoment?: boolean;    // 특별한 순간
  milestone?: string;         // "첫 산책", "예방접종 완료"
  gratitude?: string;         // "오늘도 건강해서 고마워"
  wordCount?: number;         // 통계용
  createdAt: Date;
  updatedAt: Date;
  // Firebase 확장시
  isShared?: boolean;
  likes?: number;
}
```

### 6. Reminder (리마인더) - MVP 핵심!
```typescript
interface Reminder {
  id: string;
  dogId: string;
  type: 'health' | 'routine' | 'custom';
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  relatedRecordId?: string;   // 건강기록 연결
  notificationSent?: boolean; // 알림 발송 여부
  createdAt: Date;
}
```

## 🎨 감정 표현 시스템

### MoodType (9가지 감정)
```typescript
type MoodType = 
  | 'very-happy'  // 아주 기뻐함 😄
  | 'happy'       // 기뻐함 😊  
  | 'excited'     // 신남 🤗
  | 'normal'      // 평범함 😐
  | 'calm'        // 차분함 😌
  | 'tired'       // 피곤함 😴
  | 'sad'         // 슬픔 😢
  | 'sick'        // 아픔 🤒
  | 'anxious';    // 불안함 😰
```

### 감정별 색상 (따뜻한 팔레트)
- **very-happy/excited**: Coral (#FFB6A5)
- **happy**: Apricot (#FCD9C1)  
- **normal**: Neutral Gray (#E5E5E5)
- **calm**: Mint (#A0D8B3)
- **tired**: Soft Purple (#D4C4F9)
- **sad**: Soft Blue (#B8C5D6)
- **sick**: Soft Red (#F4A4A4)
- **anxious**: Soft Yellow (#E6D4A3)

## 🏗️ 저장소 구조

### LocalStorage 키
```
pawlog_user              // 사용자 정보
pawlog_dogs              // 반려견 목록
pawlog_routine_records   // 루틴 기록들
pawlog_health_records    // 건강 기록들  
pawlog_diary_entries     // 일기 목록
pawlog_reminders         // 리마인더 목록
pawlog_settings          // 앱 설정
pawlog_last_backup       // 마지막 백업 시간
pawlog_data_version      // 데이터 버전 (마이그레이션용)
```

### 백업 데이터 구조
```typescript
interface BackupData {
  version: string;          // "1.0.0"
  timestamp: Date;
  user: User;
  dogs: Dog[];
  routineRecords: RoutineRecord[];
  healthRecords: HealthRecord[];
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  settings: AppSettings;
}
```

## 🚀 MVP 우선순위 (MoSCoW)

### Must Have (MVP 필수)
- ✅ 반려견 프로필 관리 (이미지 포함)
- ✅ 루틴 기록 (산책/식사/배변) CRUD
- ✅ 건강 기록 + 리마인더 날짜 설정
- ✅ 감성 일기 (사진 + 메모 + 감정 태그)
- ✅ 홈/건강 화면 리마인더 표시

### Should Have (있으면 좋음)
- ✅ JSON 백업/복원
- ✅ 감정 태그 선택 UI
- ✅ 기본 통계 (루틴 수, 일기 수, 평균 감정)

### Could Have (나중에)
- 📱 로컬 알림 (Notification API)
- 📊 고급 통계 및 차트
- 🔄 CSV/PDF 내보내기

### Won't Have (MVP에선 제외)
- 🔥 Firebase 연동
- 👥 소셜 기능
- 💰 프리미엄 기능

## 🔧 기술 스택

### 현재 MVP
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **State**: Zustand + localStorage
- **Storage**: localStorage (JSON) + Base64 이미지
- **Design**: Glass morphism + 따뜻한 색상 팔레트

### Firebase 확장시
```
데이터 경로:
/users/{userId}/
├── profile/           # 사용자 정보
├── dogs/{dogId}/      # 반려견별 데이터
│   ├── routines/      # 루틴 기록들
│   ├── health/        # 건강 기록들  
│   ├── diary/         # 일기들
│   └── reminders/     # 리마인더들
└── settings/          # 앱 설정
```

## 💾 데이터 관리 전략

### 저장 최적화
- 사진은 최대 5장/항목, 800x600 해상도로 압축
- localStorage 5MB 한계 관리
- 자동 백업 (설정에 따라)

### 검증 및 보안
- 이메일 형식 검증
- 반려견 이름 1-20자 제한
- 체중 0.1-100kg 범위
- 일기 내용 1-2000자 제한
- 생년월일 과거 날짜만 허용

### 오류 처리
- 저장 실패시 사용자 친화적 메시지
- 데이터 복원 기능
- 동기화 상태 표시

## 📱 확장성 고려사항

1. **다중 사용자**: User 모델에 firebaseUid 필드 준비
2. **오프라인 지원**: syncStatus로 동기화 상태 관리  
3. **마이그레이션**: 데이터 버전 관리 시스템
4. **성능**: 페이지네이션 및 가상 스크롤 준비
5. **국제화**: 언어 설정 및 메시지 시스템

이 구조는 현재 MVP 요구사항을 만족하면서도 향후 Firebase 도입과 확장이 용이하도록 설계되었습니다. 🐕✨ 