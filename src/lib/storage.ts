import { 
  LocalStorageData, 
  BackupData, 
  DataStore, 
  User, 
  Dog, 
  RoutineRecord, 
  HealthRecord, 
  DiaryEntry, 
  Reminder, 
  AppSettings 
} from './types';
import { generateId } from './utils';

// 로컬 저장소 키 상수들 - 사용자별 분리
const STORAGE_KEYS = {
  // 전역 키들
  CURRENT_USER: 'pawlog_current_user',
  AUTHENTICATED: 'pawlog_authenticated',
  
  // 사용자별 키들 (prefix로 사용)
  getUserKey: (userId: string, dataType: string) => `pawlog_${userId}_${dataType}`,
  
  // 기존 호환성 유지
  USER: 'pawlog_user',
  DOGS: 'pawlog_dogs',
  ROUTINE_RECORDS: 'pawlog_routine_records',
  HEALTH_RECORDS: 'pawlog_health_records',
  DIARY_ENTRIES: 'pawlog_diary_entries',
  REMINDERS: 'pawlog_reminders',
  SETTINGS: 'pawlog_settings',
  LAST_BACKUP: 'pawlog_last_backup',
  DATA_VERSION: 'pawlog_data_version'
} as const;

// 현재 데이터 버전 (마이그레이션용)
const CURRENT_DATA_VERSION = '1.0.0';

// 기본 설정값
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'ko',
  notifications: {
    reminders: true,
    dailyRoutine: true,
    healthAlerts: true,
  },
  units: {
    weight: 'kg',
    distance: 'km',
  },
  dataRetention: {
    keepPhotos: true,
    maxPhotosPerEntry: 5,
    autoBackup: true,
  },
};

// 기본 사용자 설정
const DEFAULT_USER_PREFERENCES = {
  defaultReminder: 3,
  darkMode: false,
  language: 'ko' as const,
};

/**
 * MVP용 로컬 저장소 서비스
 * localStorage를 기반으로 하되, 큰 데이터는 IndexedDB 사용 고려
 */
export class LocalStorageService implements DataStore {
  private static instance: LocalStorageService;

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  /**
   * 초기 저장소 설정
   */
  private initializeStorage(): void {
    // 브라우저 환경 체크
    if (typeof window === 'undefined') {
      return; // 서버 환경에서는 초기화하지 않음
    }

    // 버전 체크 및 마이그레이션
    const currentVersion = window.localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    if (!currentVersion || currentVersion !== CURRENT_DATA_VERSION) {
      this.migrateData(currentVersion, CURRENT_DATA_VERSION);
      window.localStorage.setItem(STORAGE_KEYS.DATA_VERSION, CURRENT_DATA_VERSION);
    }

    // 기본 설정 초기화
    if (!window.localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
  }

  /**
   * 데이터 마이그레이션 (버전 업그레이드시 사용)
   */
  private migrateData(fromVersion: string | null, toVersion: string): void {
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
    // TODO: 실제 마이그레이션 로직은 버전별로 구현
  }

  /**
   * localStorage에서 안전하게 데이터 가져오기
   */
  private getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null; // 서버 환경에서는 null 반환
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing data from ${key}:`, error);
      return null;
    }
  }

  /**
   * localStorage에 안전하게 데이터 저장하기
   */
  private setItem(key: string, value: any): void {
    if (typeof window === 'undefined') {
      return; // 서버 환경에서는 저장하지 않음
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      // TODO: 저장 공간 부족시 IndexedDB로 폴백
    }
  }

  /**
   * 제네릭 CRUD 작업들
   */
  async create<T extends { id: string; createdAt: Date }>(
    collection: string, 
    data: Omit<T, 'id' | 'createdAt'>
  ): Promise<T> {
    const newItem = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    } as T;

    const items = this.getItem<T[]>(collection) || [];
    items.push(newItem);
    this.setItem(collection, items);

    return newItem;
  }

  async read<T extends { id: string }>(collection: string, id: string): Promise<T | null> {
    const items = this.getItem<T[]>(collection) || [];
    return items.find(item => item.id === id) || null;
  }

  async update<T extends { id: string; updatedAt?: Date }>(
    collection: string, 
    id: string, 
    data: Partial<T>
  ): Promise<T> {
    const items = this.getItem<T[]>(collection) || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found in ${collection}`);
    }

    items[index] = {
      ...items[index],
      ...data,
      updatedAt: new Date(),
    };

    this.setItem(collection, items);
    return items[index];
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const items = this.getItem<any[]>(collection) || [];
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) {
      return false; // 아이템을 찾지 못함
    }

    this.setItem(collection, filteredItems);
    return true;
  }

  async list<T>(collection: string, filters?: any): Promise<T[]> {
    let items = this.getItem<T[]>(collection) || [];
    
    // 간단한 필터링 로직 (필요시 확장)
    if (filters) {
      items = items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          return (item as any)[key] === value;
        });
      });
    }

    return items;
  }

  /**
   * 백업 생성
   */
  async backup(): Promise<BackupData> {
    const user = this.getItem<User>(STORAGE_KEYS.USER);
    const dogs = this.getItem<Dog[]>(STORAGE_KEYS.DOGS) || [];
    const routineRecords = this.getItem<RoutineRecord[]>(STORAGE_KEYS.ROUTINE_RECORDS) || [];
    const healthRecords = this.getItem<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS) || [];
    const diaryEntries = this.getItem<DiaryEntry[]>(STORAGE_KEYS.DIARY_ENTRIES) || [];
    const reminders = this.getItem<Reminder[]>(STORAGE_KEYS.REMINDERS) || [];
    const settings = this.getItem<AppSettings>(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;

    const backupData: BackupData = {
      version: CURRENT_DATA_VERSION,
      timestamp: new Date(),
      user: user!,
      dogs,
      routineRecords,
      healthRecords,
      diaryEntries,
      reminders,
      settings,
    };

    // 백업 생성 기록
    this.setItem(STORAGE_KEYS.LAST_BACKUP, new Date());

    return backupData;
  }

  /**
   * 백업 복원
   */
  async restore(data: BackupData): Promise<boolean> {
    try {
      // 데이터 검증
      if (!data.version || !data.user || !Array.isArray(data.dogs)) {
        throw new Error('Invalid backup data format');
      }

      // 기존 데이터 백업 (복원 실패시를 위해)
      const existingBackup = await this.backup();
      
      // 복원 실행
      this.setItem(STORAGE_KEYS.USER, data.user);
      this.setItem(STORAGE_KEYS.DOGS, data.dogs);
      this.setItem(STORAGE_KEYS.ROUTINE_RECORDS, data.routineRecords);
      this.setItem(STORAGE_KEYS.HEALTH_RECORDS, data.healthRecords);
      this.setItem(STORAGE_KEYS.DIARY_ENTRIES, data.diaryEntries);
      this.setItem(STORAGE_KEYS.REMINDERS, data.reminders);
      this.setItem(STORAGE_KEYS.SETTINGS, data.settings);

      return true;
    } catch (error) {
      console.error('Restore failed:', error);
      return false;
    }
  }

  /**
   * 저장소 비우기 (개발/테스트용)
   */
  async clearAll(): Promise<void> {
    if (typeof window === 'undefined') {
      return; // 서버 환경에서는 실행하지 않음
    }

    Object.values(STORAGE_KEYS).forEach(key => {
      window.localStorage.removeItem(key);
    });
    this.initializeStorage();
  }

  /**
   * 저장소 사용량 확인
   */
  getStorageUsage(): { used: number; total: number; percentage: number } {
    if (typeof window === 'undefined') {
      return { used: 0, total: 0, percentage: 0 }; // 서버 환경에서는 기본값 반환
    }

    let used = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = window.localStorage.getItem(key);
      if (item) {
        used += item.length * 2; // UTF-16 인코딩이므로 2바이트씩
      }
    });

    const total = 5 * 1024 * 1024; // 5MB (대략적인 localStorage 한계)
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * 특정 컬렉션 키 매핑
   */
  private getCollectionKey(collection: string): string {
    const keyMap: Record<string, string> = {
      'users': STORAGE_KEYS.USER,
      'dogs': STORAGE_KEYS.DOGS,
      'routineRecords': STORAGE_KEYS.ROUTINE_RECORDS,
      'healthRecords': STORAGE_KEYS.HEALTH_RECORDS,
      'diaryEntries': STORAGE_KEYS.DIARY_ENTRIES,
      'reminders': STORAGE_KEYS.REMINDERS,
      'settings': STORAGE_KEYS.SETTINGS,
    };

    return keyMap[collection] || collection;
  }
}

// 싱글톤 인스턴스를 지연 생성하는 함수
export const getLocalStorageService = (): LocalStorageService => {
  if (typeof window === 'undefined') {
    // 서버 환경에서는 더미 객체 반환
    return {
      create: async () => ({ id: '', createdAt: new Date() } as any),
      read: async () => null,
      update: async () => ({} as any),
      delete: async () => false,
      list: async () => [],
      backup: async () => ({} as any),
      restore: async () => false,
      clearAll: async () => {},
      getStorageUsage: () => ({ used: 0, total: 0, percentage: 0 }),
    } as any;
  }
  return LocalStorageService.getInstance();
};

// 유틸리티 함수들
export const StorageUtils = {
  /**
   * JSON 형태로 데이터 내보내기
   */
  async exportToJSON(options?: { includePhotos?: boolean }): Promise<string> {
    const storage = getLocalStorageService();
    const backup = await storage.backup();
    
    if (!options?.includePhotos) {
      // 사진 데이터 제거해서 파일 크기 줄이기
      backup.diaryEntries = backup.diaryEntries.map((entry: DiaryEntry) => ({
        ...entry,
        photos: []
      }));
      backup.routineRecords = backup.routineRecords.map((record: RoutineRecord) => ({
        ...record,
        photos: record.photos ? [] : undefined
      }));
    }

    return JSON.stringify(backup, null, 2);
  },

  /**
   * 파일에서 데이터 가져오기
   */
  async importFromJSON(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString) as BackupData;
      const storage = getLocalStorageService();
      return await storage.restore(data);
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  },

  /**
   * 자동 백업 (설정에 따라)
   */
  async autoBackup(): Promise<void> {
    const storage = getLocalStorageService();
    const settings = await storage.list('settings') as AppSettings[];
    if (settings[0]?.dataRetention?.autoBackup) {
      const backup = await storage.backup();
      // TODO: 자동 백업을 어디에 저장할지 결정 (예: 다운로드 폴더)
      console.log('Auto backup created:', backup.timestamp);
    }
  }
}; 