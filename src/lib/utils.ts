import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';
import { ko } from 'date-fns/locale';

// Tailwind CSS 클래스 합치기 함수
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ID 생성 함수
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// 날짜 포맷팅 함수들
export function formatDate(date: Date | string | null | undefined): string {
  try {
    // 값이 없으면 오늘 날짜 반환
    if (!date) {
      console.warn('No date provided to formatDate, using current date');
      return new Date().toISOString().split('T')[0];
    }

    // Date 객체로 변환
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      console.warn('Invalid date type provided to formatDate:', typeof date, date);
      return new Date().toISOString().split('T')[0];
    }

    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date provided to formatDate:', date);
      return new Date().toISOString().split('T')[0]; // 오늘 날짜를 기본값으로 반환
    }

    return format(dateObj, 'yyyy-MM-dd', { locale: ko });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return new Date().toISOString().split('T')[0]; // 오늘 날짜를 기본값으로 반환
  }
}

export function formatDateTime(date: Date | string): string {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    return format(dateObj, 'yyyy-MM-dd HH:mm', { locale: ko });
  } catch (error) {
    console.error('Error formatting datetime:', error, date);
    return new Date().toISOString().replace('T', ' ').substring(0, 16);
  }
}

export function formatTime(date: Date | string): string {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return new Date().toTimeString().substring(0, 5);
    }
    return format(dateObj, 'HH:mm', { locale: ko });
  } catch (error) {
    console.error('Error formatting time:', error, date);
    return new Date().toTimeString().substring(0, 5);
  }
}

export function formatRelativeTime(date: Date | string): string {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '방금 전';
    }
    
    if (isToday(dateObj)) {
      return `오늘 ${formatTime(dateObj)}`;
    }
    if (isYesterday(dateObj)) {
      return `어제 ${formatTime(dateObj)}`;
    }
    if (isTomorrow(dateObj)) {
      return `내일 ${formatTime(dateObj)}`;
    }
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ko });
  } catch (error) {
    console.error('Error formatting relative time:', error, date);
    return '방금 전';
  }
}

// 나이 계산 함수
export function calculateAge(birthDate: Date | string): string {
  try {
    const today = new Date();
    const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
    
    if (isNaN(birth.getTime())) {
      console.warn('Invalid birth date provided to calculateAge:', birthDate);
      return '알 수 없음';
    }
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return `${years}살`;
    } else if (months > 0) {
      return `${months}개월`;
    } else {
      const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? `${days}일` : '오늘 태어남';
    }
  } catch (error) {
    console.error('Error calculating age:', error, birthDate);
    return '알 수 없음';
  }
}

// 파일을 Base64로 변환하는 함수
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Base64 이미지를 리사이즈하는 함수
export function resizeImage(base64: string, maxWidth: number = 800, maxHeight: number = 600): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // 비율 유지하면서 크기 조정
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = base64;
  });
}

// 무드 이모지 매핑 (MVP 감성 디자인에 맞게 업데이트)
export const moodEmojis = {
  'very-happy': '😄',
  'happy': '😊',
  'excited': '🤗',
  'normal': '😐',
  'calm': '😌',
  'tired': '😴',
  'sad': '😢',
  'sick': '🤒',
  'anxious': '😰'
};

// 무드 한글 이름 매핑 (MVP 감성 표현)
export const moodNames = {
  'very-happy': '아주 기뻐요',
  'happy': '기뻐요',
  'excited': '신나요',
  'normal': '평범해요',
  'calm': '차분해요',
  'tired': '피곤해요',
  'sad': '슬퍼요',
  'sick': '아파요',
  'anxious': '불안해요'
};

// 무드 색상 매핑 (MVP 따뜻한 색상 팔레트)
export const moodColors = {
  'very-happy': '#FFB6A5', // Coral
  'happy': '#FCD9C1', // Apricot
  'excited': '#FFB6A5', // Coral
  'normal': '#E5E5E5', // Neutral
  'calm': '#A0D8B3', // Mint
  'tired': '#D4C4F9', // Soft purple
  'sad': '#B8C5D6', // Soft blue
  'sick': '#F4A4A4', // Soft red
  'anxious': '#E6D4A3' // Soft yellow
};

// 날씨 이모지 매핑
export const weatherEmojis = {
  'sunny': '☀️',
  'cloudy': '☁️',
  'rainy': '🌧️',
  'snowy': '❄️'
};

// 날씨 한글 이름 매핑
export const weatherNames = {
  'sunny': '맑음',
  'cloudy': '흐림',
  'rainy': '비',
  'snowy': '눈'
};

// 루틴 타입 이모지 매핑 (확장된 타입 포함)
export const routineEmojis = {
  'walk': '🚶',
  'meal': '🍽️',
  'poop': '💩',
  'brush': '🦷'
};

// 루틴 타입 한글 이름 매핑 (확장된 타입 포함)
export const routineNames = {
  'walk': '산책',
  'meal': '식사',
  'poop': '대변',
  'brush': '양치'
};

// 건강 기록 타입 이모지 매핑 (확장된 타입 포함)
export const healthEmojis = {
  'vaccination': '💉',
  'checkup': '🩺',
  'medication': '💊',
  'grooming': '✂️',
  'surgery': '🏥'
};

// 건강 기록 타입 한글 이름 매핑 (확장된 타입 포함)
export const healthNames = {
  'vaccination': '예방접종',
  'checkup': '건강검진',
  'medication': '투약',
  'grooming': '미용',
  'surgery': '수술'
};

// 성별 이모지 매핑
export const genderEmojis = {
  'male': '♂️',
  'female': '♀️'
};

// 성별 한글 이름 매핑
export const genderNames = {
  'male': '수컷',
  'female': '암컷'
};

// D-Day 계산 함수
export function calculateDDay(targetDate: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'D-Day';
  } else if (diffDays > 0) {
    return `D-${diffDays}`;
  } else {
    return `D+${Math.abs(diffDays)}`;
  }
}

// 색상 생성 함수 (견종별 아바타 색상)
export function generateColor(text: string): string {
  const colors = [
    'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
    'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-teal-400',
    'bg-orange-400', 'bg-cyan-400'
  ];
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

// 감성 메시지 함수들
export const getSuccessMessage = (type: 'routine' | 'health' | 'diary' | 'reminder', dogName?: string): string => {
  const messages = {
    routine: [
      `${dogName ? dogName + '의 ' : ''}루틴이 기록되었어요! 🐕`,
      `오늘도 함께해서 고마워요! ✨`,
      `소중한 시간이 기록되었어요! 💕`
    ],
    health: [
      `${dogName ? dogName + '의 ' : ''}건강 관리 기록이 저장되었어요! 🏥`,
      `건강한 우리 아이를 위한 첫걸음이에요! 💪`,
      `꾸준한 관리가 최고의 사랑이에요! ❤️`
    ],
    diary: [
      `${dogName ? dogName + '와의 ' : ''}소중한 추억이 저장되었어요! 📝`,
      `오늘의 감정이 아름답게 기록되었어요! 🌈`,
      `함께한 순간들이 영원히 남아있을 거예요! ✨`
    ],
    reminder: [
      `리마인더가 설정되었어요! 🔔`,
      `잊지 않도록 알려드릴게요! ⏰`,
      `소중한 일정이 등록되었어요! 📅`
    ]
  };
  
  const messageList = messages[type];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

export const getMotivationMessage = (): string => {
  const messages = [
    '오늘도 함께해줘서 고마워요! 🐾',
    '반려견과의 행복한 시간 되세요 💕',
    '매일매일이 특별한 추억이에요 ✨',
    '사랑이 가득한 하루 보내세요! 🌟',
    '우리 가족의 행복을 응원해요! 📣',
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
};

// 리마인더 우선순위 색상 매핑
export const priorityColors = {
  'high': '#FF6B6B', // 높음 - 빨강
  'medium': '#FFB366', // 보통 - 주황
  'low': '#4ECDC4' // 낮음 - 청록
};

// 우선순위 한글 이름 매핑
export const priorityNames = {
  'high': '높음',
  'medium': '보통',
  'low': '낮음'
};

// 저장소 크기 포맷팅 함수
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 감정 점수 계산 함수 (통계용)
export function getMoodScore(mood: string): number {
  const scores = {
    'very-happy': 5,
    'happy': 4,
    'excited': 4,
    'normal': 3,
    'calm': 3,
    'tired': 2,
    'sad': 1,
    'sick': 1,
    'anxious': 1,
  };
  return scores[mood as keyof typeof scores] || 3;
}

// 텍스트 길이에 따른 읽기 시간 추정 (일기용)
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200; // 평균 읽기 속도
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}

// 백업 파일 이름 생성
export function generateBackupFileName(includeDogs: boolean = false): string {
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd_HH-mm-ss');
  const prefix = includeDogs ? 'pawlog_with_photos' : 'pawlog';
  return `${prefix}_backup_${dateStr}.json`;
}

// 반려견 나이를 월 단위로 변환
export function getDogAgeInMonths(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months += today.getMonth() - birth.getMonth();
  
  // 일수가 부족하면 한 달 빼기
  if (today.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

// 입력 검증 함수들
export const validation = {
  // 이메일 검증
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // 반려견 이름 검증
  isValidDogName: (name: string): boolean => {
    return name.trim().length >= 1 && name.trim().length <= 20;
  },
  
  // 체중 검증 (0.1kg ~ 100kg)
  isValidWeight: (weight: number): boolean => {
    return weight >= 0.1 && weight <= 100;
  },
  
  // 날짜 검증 (과거 날짜만 허용)
  isValidBirthDate: (date: Date): boolean => {
    const today = new Date();
    return date <= today;
  },
  
  // 일기 내용 검증
  isValidDiaryContent: (content: string): boolean => {
    return content.trim().length >= 1 && content.trim().length <= 2000;
  }
};

// 오류 메시지 상수
export const errorMessages = {
  INVALID_EMAIL: '올바른 이메일 형식이 아닙니다.',
  INVALID_DOG_NAME: '반려견 이름은 1-20자 사이여야 합니다.',
  INVALID_WEIGHT: '체중은 0.1kg - 100kg 사이여야 합니다.',
  INVALID_BIRTH_DATE: '생년월일은 오늘 이전 날짜여야 합니다.',
  INVALID_DIARY_CONTENT: '일기 내용은 1-2000자 사이여야 합니다.',
  STORAGE_FULL: '저장 공간이 부족합니다. 일부 데이터를 삭제해주세요.',
  SYNC_FAILED: '데이터 동기화에 실패했습니다.',
  BACKUP_FAILED: '백업 생성에 실패했습니다.',
  IMPORT_FAILED: '데이터 가져오기에 실패했습니다.',
};

// 동기화 애니메이션용 로딩 메시지
export const getLoadingMessage = (): string => {
  const messages = [
    '데이터를 불러오고 있어요...',
    '추억들을 정리하고 있어요...',
    '소중한 기록들을 찾고 있어요...',
    '잠시만 기다려주세요...',
    '거의 다 됐어요...'
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}; 