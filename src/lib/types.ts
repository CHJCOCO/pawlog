// 반려견 기본 정보 (DogProfile)
export interface Dog {
  id: string;
  name: string;
  breed: string;
  birthDate: Date;
  weight: number;
  photo?: string; // Base64 또는 File URL (MVP), Firebase Storage URL (확장시)
  gender: 'male' | 'female';
  isNeutered: boolean;
  microchipId?: string; // 마이크로칩 번호 (선택사항)
  notes?: string; // 특이사항
  createdAt: Date;
  updatedAt: Date;
  // Firebase 확장시 추가될 필드들
  ownerId?: string; // 사용자 ID (Firebase 도입시)
  isActive?: boolean; // 활성 상태 (무지개다리 건넌 아이들 관리용)
}

// 루틴 기록 타입들 (RoutineEntry)
export type RoutineType = 'walk' | 'meal' | 'poop' | 'brush';

export interface RoutineRecord {
  id: string;
  dogId: string;
  type: RoutineType;
  timestamp: Date;
  // 산책 관련 필드
  duration?: number; // 산책/놀이 시간 (분)
  distance?: number; // 산책 거리 (km)
  // 식사 관련 필드
  amount?: string; // 식사량 (예: "1컵", "50g")
  foodType?: string; // 사료 종류
  // 공통 필드
  notes?: string;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location?: string; // 산책 장소 (선택사항)
  photos?: string[]; // 활동 사진들 (Base64)
  mood?: MoodType; // 활동 후 반려견 상태
  createdAt: Date;
  // Firebase 확장시 추가될 필드들
  syncStatus?: 'local' | 'synced' | 'conflict'; // 동기화 상태
}

// 건강 기록 타입들 (HealthEntry)
export type HealthType = 
  | 'vaccination' // 예방접종
  | 'checkup' // 건강검진
  | 'medication' // 투약
  | 'grooming' // 미용
  | 'surgery'; // 수술

export interface HealthRecord {
  id: string;
  dogId: string;
  type: HealthType;
  title: string;
  description?: string;
  date: Date;
  nextDate?: Date; // 다음 예정일 (리마인더용) - MVP 핵심!
  // 병원/의료진 정보
  veterinarian?: string; // 수의사명
  clinic?: string; // 병원명
  // 비용 정보
  cost?: number; // 비용
  // 약물 관련 (medication 타입일 때)
  medicationName?: string; // 약물명
  dosage?: string; // 용량
  frequency?: string; // 복용 빈도
  duration?: number; // 복용 기간 (일)
  // 백신 관련 (vaccination 타입일 때)
  vaccineName?: string; // 백신명
  batchNumber?: string; // 로트번호
  // 첨부 파일
  attachments?: string[]; // 진료 기록, 처방전 등 (Base64)
  notes?: string;
  completed: boolean;
  // 리마인더 설정
  reminderEnabled: boolean;
  reminderDays?: number; // 며칠 전에 알림 (기본 3일)
  createdAt: Date;
  updatedAt?: Date;
  // Firebase 확장시 추가될 필드들
  syncStatus?: 'local' | 'synced' | 'conflict';
}

// 감성 일기 관련 타입들 (DiaryEntry)
export type MoodType = 
  | 'very-happy' // 아주 기뻐함 😄
  | 'happy' // 기뻐함 😊
  | 'excited' // 신남 🤗
  | 'normal' // 평범함 😐
  | 'calm' // 차분함 😌
  | 'tired' // 피곤함 😴
  | 'sad' // 슬픔 😢
  | 'sick' // 아픔 🤒
  | 'anxious'; // 불안함 😰

export interface DiaryEntry {
  id: string;
  dogId: string;
  date: Date;
  title?: string; // 일기 제목 (선택사항)
  content: string; // 일기 내용 - MVP 핵심!
  photos: string[]; // Base64 인코딩된 이미지들 - MVP 핵심!
  mood: MoodType; // 감정 태그 - MVP 핵심!
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  tags?: string[]; // 감정 태그들 (예: #산책, #놀이, #간식, #첫만남)
  // 추가 감성 요소들
  specialMoment?: boolean; // 특별한 순간 표시
  milestone?: string; // 성장 기록 (예: "첫 산책", "예방접종 완료")
  gratitude?: string; // 감사 메시지 (예: "오늘도 건강해서 고마워")
  // 메타데이터
  wordCount?: number; // 글자 수 (통계용)
  createdAt: Date;
  updatedAt: Date;
  // 커뮤니티 기능 관련 필드들
  isPublic: boolean; // 공개 여부 - 커뮤니티 핵심!
  userId: string; // 작성자 ID
  nickname: string; // 작성자 닉네임
  // Firebase 확장시 추가될 필드들
  isShared?: boolean; // 공유 여부
  likes?: number; // 좋아요 수 (커뮤니티 기능시)
  syncStatus?: 'local' | 'synced' | 'conflict';
}

// 사용자 프로필 타입 (User)
export interface User {
  id: string;
  email: string; // 로컬 식별용 - MVP 핵심!
  name?: string; // 사용자 이름 (선택사항)
  nickname: string; // 닉네임 - 커뮤니티 기능용
  avatar?: string; // 프로필 사진 (Base64)
  createdAt: Date;
  updatedAt: Date;
  // MVP 설정들
  preferences: {
    defaultReminder: number; // 기본 리마인더 일수 (예: 3일 전)
    darkMode: boolean;
    language: 'ko' | 'en';
  };
  // Firebase 확장시 추가될 필드들
  firebaseUid?: string; // Firebase Auth UID
  subscription?: 'free' | 'premium'; // 구독 상태
  lastSync?: Date; // 마지막 동기화 시간
}

// 리마인더 타입 (MVP 핵심!)
export interface Reminder {
  id: string;
  dogId: string;
  type: 'health' | 'routine' | 'custom';
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high'; // 우선순위
  relatedRecordId?: string; // 관련 건강기록 ID
  notificationSent?: boolean; // 알림 발송 여부 (나중에 사용)
  createdAt: Date;
  // Firebase 확장시 추가될 필드들
  syncStatus?: 'local' | 'synced' | 'conflict';
}

// 통계 관련 타입들
export interface WalkStats {
  totalWalks: number;
  totalDuration: number; // 분
  totalDistance: number; // km
  averageDuration: number;
  averageDistance: number;
}

export interface HealthStats {
  upcomingAppointments: number;
  overdueAppointments: number;
  totalCost: number;
  lastCheckup?: Date;
}

// 폼 관련 타입들
export interface DogFormData {
  name: string;
  breed: string;
  birthDate: string; // HTML input[type="date"] 형식
  weight: number;
  gender: 'male' | 'female';
  isNeutered: boolean;
  photo?: string;
}

export interface RoutineFormData {
  dogId: string;
  type: RoutineType;
  timestamp: string; // HTML input[type="datetime-local"] 형식
  duration?: number;
  distance?: number;
  amount?: string;
  foodType?: string;
  notes?: string;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  location?: string;
  photos?: string[];
  mood?: MoodType;
}

export interface HealthFormData {
  dogId: string;
  type: HealthType;
  title: string;
  description?: string;
  date: string;
  nextDate?: string;
  veterinarian?: string;
  clinic?: string;
  cost?: number;
  // 약물 관련 필드
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: number;
  // 백신 관련 필드
  vaccineName?: string;
  batchNumber?: string;
  // 첨부 파일
  attachments?: string[];
  notes?: string;
  completed: boolean;
  // 리마인더 설정
  reminderEnabled?: boolean;
  reminderDays?: number;
}

export interface DiaryFormData {
  dogId: string;
  date: string;
  title?: string;
  content: string;
  photos: string[];
  mood: MoodType;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  tags?: string[];
  // 추가 감성 요소들
  specialMoment?: boolean;
  milestone?: string;
  gratitude?: string;
  // 커뮤니티 관련 필드
  isPublic?: boolean;
}

// 앱 전체 설정 타입
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  notifications: {
    reminders: boolean;
    dailyRoutine: boolean;
    healthAlerts: boolean;
  };
  units: {
    weight: 'kg' | 'lb';
    distance: 'km' | 'mi';
  };
  // MVP 추가 설정들
  dataRetention: {
    keepPhotos: boolean; // 사진 보관 여부
    maxPhotosPerEntry: number; // 항목당 최대 사진 수
    autoBackup: boolean; // 자동 백업 여부
  };
}

// MVP 백업/내보내기 관련 타입들
export interface BackupData {
  version: string; // 백업 데이터 버전
  timestamp: Date; // 백업 생성 시간
  user: User;
  dogs: Dog[];
  routineRecords: RoutineRecord[];
  healthRecords: HealthRecord[];
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  settings: AppSettings;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includePhotos: boolean;
  categories: {
    routines: boolean;
    health: boolean;
    diary: boolean;
  };
}

// 데이터 저장소 추상화 인터페이스 (Firebase 확장 대비)
export interface DataStore {
  // CRUD 기본 작업들
  create<T extends { id: string; createdAt: Date }>(
    collection: string, 
    data: Omit<T, 'id' | 'createdAt'>
  ): Promise<T>;
  read<T extends { id: string }>(collection: string, id: string): Promise<T | null>;
  update<T extends { id: string; updatedAt?: Date }>(
    collection: string, 
    id: string, 
    data: Partial<T>
  ): Promise<T>;
  delete(collection: string, id: string): Promise<boolean>;
  list<T>(collection: string, filters?: any): Promise<T[]>;
  
  // 백업/복원
  backup(): Promise<BackupData>;
  restore(data: BackupData): Promise<boolean>;
  
  // 동기화 (Firebase 확장시 사용)
  sync?(): Promise<void>;
}

// MVP에서 사용할 로컬 저장소 타입
export interface LocalStorageData {
  user: User | null;
  dogs: Dog[];
  routineRecords: RoutineRecord[];
  healthRecords: HealthRecord[];
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  settings: AppSettings;
  lastBackup?: Date;
}

// 커뮤니티 기능 관련 타입들
export interface Comment {
  id: string;
  diaryId: string;
  userId: string;
  nickname: string;
  content: string;
  createdAt: Date;
  // 대댓글 기능 (MVP2에서 구현 예정)
  parentId?: string;
  replies?: Comment[];
}

// 공개 일기를 위한 타입 (DiaryEntry를 확장)
export interface PublicDiary extends DiaryEntry {
  dogName: string; // 반려견 이름
  likesCount: number; // 좋아요 수
  commentsCount: number; // 댓글 수
  isLikedByUser: boolean; // 현재 사용자가 좋아요 했는지
}

// 커뮤니티 상태 관리를 위한 인터페이스
export interface CommunityState {
  publicFeed: PublicDiary[];
  likes: Record<string, number>; // diaryId -> 좋아요 수
  comments: Record<string, Comment[]>; // diaryId -> 댓글 배열
  currentUser: {
    id: string;
    nickname: string;
  } | null;
  isLoading: boolean;
  error: string | null;
} 