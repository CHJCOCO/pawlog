import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Dog, 
  RoutineRecord, 
  HealthRecord, 
  DiaryEntry, 
  Reminder, 
  AppSettings,
  DogFormData,
  RoutineFormData,
  HealthFormData,
  DiaryFormData,
  User,
  PublicDiary,
  Comment,
  CommunityState
} from './types';
import { generateId } from './utils';
import { getLocalStorageService, StorageUtils } from './storage';

interface AppState {
  // 데이터
  user: User | null;
  dogs: Dog[];
  routineRecords: RoutineRecord[];
  healthRecords: HealthRecord[];
  diaryEntries: DiaryEntry[];
  reminders: Reminder[];
  settings: AppSettings;
  
  // 상태 관리
  isLoading: boolean;
  error: string | null;
  
  // 사용자 관련 액션
  initializeUser: (email: string, name?: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // 반려견 관련 액션
  addDog: (dogData: DogFormData) => Promise<Dog>;
  updateDog: (id: string, dogData: Partial<DogFormData>) => Promise<void>;
  deleteDog: (id: string) => Promise<void>;
  getDogById: (id: string) => Dog | undefined;
  
  // 루틴 기록 관련 액션
  addRoutineRecord: (recordData: RoutineFormData) => Promise<RoutineRecord>;
  updateRoutineRecord: (id: string, recordData: Partial<RoutineFormData>) => Promise<void>;
  deleteRoutineRecord: (id: string) => Promise<void>;
  getRoutineRecordsByDog: (dogId: string) => RoutineRecord[];
  getRoutineRecordsByDate: (date: Date) => RoutineRecord[];
  getRecentRoutinesByType: (dogId: string, type: string, days?: number) => RoutineRecord[];
  
  // 건강 기록 관련 액션 - MVP 핵심!
  addHealthRecord: (recordData: HealthFormData) => Promise<HealthRecord>;
  updateHealthRecord: (id: string, recordData: Partial<HealthFormData>) => Promise<void>;
  deleteHealthRecord: (id: string) => Promise<void>;
  getHealthRecordsByDog: (dogId: string) => HealthRecord[];
  getUpcomingHealthRecords: (days?: number) => HealthRecord[];
  getOverdueHealthRecords: () => HealthRecord[];
  
  // 일기 관련 액션 - MVP 핵심!
  addDiaryEntry: (entryData: DiaryFormData) => Promise<DiaryEntry>;
  updateDiaryEntry: (id: string, entryData: Partial<DiaryFormData>) => Promise<void>;
  deleteDiaryEntry: (id: string) => Promise<void>;
  getDiaryEntriesByDog: (dogId: string) => DiaryEntry[];
  getDiaryEntriesByDateRange: (start: Date, end: Date, dogId?: string) => DiaryEntry[];
  getDiaryStatsByMood: (dogId?: string) => Record<string, number>;
  
  // 리마인더 관련 액션 - MVP 핵심!
  addReminder: (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => Promise<Reminder>;
  updateReminder: (id: string, reminderData: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  getTodayReminders: () => Reminder[];
  getUpcomingReminders: (days?: number) => Reminder[];
  completeReminder: (id: string) => Promise<void>;
  
  // 설정 관련 액션
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // 데이터 관리 액션
  syncWithStorage: () => Promise<void>;
  exportData: (options?: { includePhotos?: boolean }) => Promise<string>;
  importData: (jsonData: string) => Promise<boolean>;
  clearAllData: () => Promise<void>;
  getStorageInfo: () => { used: number; total: number; percentage: number };
  
  // 통계 관련 액션 (MVP Should Have)
  getDogStats: (dogId: string) => {
    totalRoutines: number;
    totalDiaryEntries: number;
    healthRecordsCount: number;
    averageMood: string;
  };
  
  // 오류 상태 관리
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// 기본 설정값 (MVP 중심으로 단순화)
const defaultSettings: AppSettings = {
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

// 기본 사용자 프로필 생성 함수
const createDefaultUser = (email: string, name?: string): User => ({
  id: generateId(),
  email,
  name: name || '',
  nickname: name || '펫로그유저',
  createdAt: new Date(),
  updatedAt: new Date(),
  preferences: {
    defaultReminder: 3,
    darkMode: false,
    language: 'ko',
  },
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  // 초기 상태
  user: null,
  dogs: [],
  routineRecords: [],
  healthRecords: [],
  diaryEntries: [],
  reminders: [],
  settings: defaultSettings,
  isLoading: false,
  error: null,
  
  // 사용자 관련 액션
  initializeUser: async (email, name) => {
    try {
      set({ isLoading: true, error: null });
      
      // 간단하게 새 사용자 생성 (persist가 알아서 저장함)
      const newUser = createDefaultUser(email, name);
      set({ user: newUser });
      
    } catch (error) {
      set({ error: 'Failed to initialize user' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateUser: async (userData) => {
    const { user } = get();
    if (!user) return;
    
    try {
      const storage = getLocalStorageService();
      const updatedUser = await storage.update('users', user.id, {
        ...userData,
        updatedAt: new Date(),
      });
      set({ user: updatedUser });
    } catch (error) {
      set({ error: 'Failed to update user' });
    }
  },
  
  // 반려견 관련 액션
  addDog: async (dogData) => {
    try {
      set({ isLoading: true, error: null });
      
      const newDog: Dog = {
        id: generateId(),
        name: dogData.name,
        breed: dogData.breed,
        birthDate: new Date(dogData.birthDate),
        weight: dogData.weight,
        gender: dogData.gender,
        isNeutered: dogData.isNeutered,
        photo: dogData.photo,
        isActive: true,
        notes: undefined,
        microchipId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => ({
        dogs: [...state.dogs, newDog]
      }));
      
      return newDog;
    } catch (error) {
      set({ error: 'Failed to add dog' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateDog: async (id, dogData) => {
    try {
      const storage = getLocalStorageService();
      const updatedDog = await storage.update<Dog>('dogs', id, {
        ...dogData,
        birthDate: dogData.birthDate ? new Date(dogData.birthDate) : undefined,
      });
      
      set((state) => ({
        dogs: state.dogs.map((dog) => dog.id === id ? updatedDog : dog)
      }));
    } catch (error) {
      set({ error: 'Failed to update dog' });
    }
  },
  
  deleteDog: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const storage = getLocalStorageService();
      // 관련 데이터도 모두 삭제
      const { routineRecords, healthRecords, diaryEntries, reminders } = get();
      
      // 병렬로 관련 데이터 삭제
      await Promise.all([
        storage.delete('dogs', id),
        ...routineRecords.filter(r => r.dogId === id).map(r => 
          storage.delete('routineRecords', r.id)
        ),
        ...healthRecords.filter(r => r.dogId === id).map(r => 
          storage.delete('healthRecords', r.id)
        ),
        ...diaryEntries.filter(e => e.dogId === id).map(e => 
          storage.delete('diaryEntries', e.id)
        ),
        ...reminders.filter(r => r.dogId === id).map(r => 
          storage.delete('reminders', r.id)
        ),
      ]);
      
      set((state) => ({
        dogs: state.dogs.filter((dog) => dog.id !== id),
        routineRecords: state.routineRecords.filter((record) => record.dogId !== id),
        healthRecords: state.healthRecords.filter((record) => record.dogId !== id),
        diaryEntries: state.diaryEntries.filter((entry) => entry.dogId !== id),
        reminders: state.reminders.filter((reminder) => reminder.dogId !== id),
      }));
      
      // 반려견이 모두 삭제되면 플래그도 제거
      if (get().dogs.length === 0 && typeof window !== 'undefined') {
        window.localStorage.removeItem('pawlog_has_dogs');
      }
    } catch (error) {
      set({ error: 'Failed to delete dog' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getDogById: (id) => {
    return get().dogs.find((dog) => dog.id === id);
  },
  
  // 루틴 기록 관련 액션
  addRoutineRecord: async (recordData) => {
    try {
      const newRecord: RoutineRecord = {
        id: generateId(),
        dogId: recordData.dogId,
        type: recordData.type,
        timestamp: new Date(recordData.timestamp),
        duration: recordData.duration,
        distance: recordData.distance,
        amount: recordData.amount,
        foodType: recordData.foodType,
        notes: recordData.notes,
        weather: recordData.weather,
        location: recordData.location,
        photos: recordData.photos || [],
        mood: recordData.mood,
        createdAt: new Date(),
      };
      
      set((state) => ({
        routineRecords: [...state.routineRecords, newRecord]
      }));
      
      return newRecord;
    } catch (error) {
      set({ error: 'Failed to add routine record' });
      throw error;
    }
  },
  
  updateRoutineRecord: async (id, recordData) => {
    try {
      const storage = getLocalStorageService();
      const updatedRecord = await storage.update<RoutineRecord>('routineRecords', id, {
        ...recordData,
        timestamp: recordData.timestamp ? new Date(recordData.timestamp) : undefined,
      });
      
      set((state) => ({
        routineRecords: state.routineRecords.map((record) =>
          record.id === id ? updatedRecord : record
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update routine record' });
    }
  },
  
  deleteRoutineRecord: async (id) => {
    try {
      const storage = getLocalStorageService();
      await storage.delete('routineRecords', id);
      set((state) => ({
        routineRecords: state.routineRecords.filter((record) => record.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete routine record' });
    }
  },
  
  getRoutineRecordsByDog: (dogId) => {
    return get().routineRecords
      .filter((record) => record.dogId === dogId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
  
  getRoutineRecordsByDate: (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return get().routineRecords
      .filter((record) => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= targetDate && recordDate < nextDay;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
  
  getRecentRoutinesByType: (dogId, type, days = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return get().routineRecords
      .filter((record) => 
        record.dogId === dogId && 
        record.type === type && 
        record.timestamp >= cutoffDate
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
  
  // 건강 기록 관련 액션 - MVP 핵심!
  addHealthRecord: async (recordData) => {
    try {
      const storage = getLocalStorageService();
      const newRecord = await storage.create<HealthRecord>('healthRecords', {
        dogId: recordData.dogId,
        type: recordData.type,
        title: recordData.title,
        description: recordData.description,
        date: new Date(recordData.date),
        nextDate: recordData.nextDate ? new Date(recordData.nextDate) : undefined,
        veterinarian: recordData.veterinarian,
        clinic: recordData.clinic,
        cost: recordData.cost,
        medicationName: recordData.medicationName,
        dosage: recordData.dosage,
        frequency: recordData.frequency,
        duration: recordData.duration,
        vaccineName: recordData.vaccineName,
        batchNumber: recordData.batchNumber,
        attachments: recordData.attachments || [],
        notes: recordData.notes,
        completed: recordData.completed,
        reminderEnabled: recordData.reminderEnabled ?? true,
        reminderDays: recordData.reminderDays ?? get().user?.preferences.defaultReminder ?? 3,
      });
      
      set((state) => ({
        healthRecords: [...state.healthRecords, newRecord]
      }));
      
      // 리마인더 자동 생성 (MVP 핵심!)
      if (recordData.nextDate && newRecord.reminderEnabled && !recordData.completed) {
        const reminderDate = new Date(recordData.nextDate);
        reminderDate.setDate(reminderDate.getDate() - newRecord.reminderDays!);
        
        await get().addReminder({
          dogId: recordData.dogId,
          type: 'health',
          title: `${recordData.title} 예정`,
          description: recordData.description || `${recordData.title}이 예정되어 있습니다.`,
          dueDate: reminderDate,
          priority: recordData.type === 'vaccination' ? 'high' : 'medium',
          isCompleted: false,
          relatedRecordId: newRecord.id,
        });
      }
      
      return newRecord;
    } catch (error) {
      set({ error: 'Failed to add health record' });
      throw error;
    }
  },
  
  updateHealthRecord: async (id, recordData) => {
    try {
      const storage = getLocalStorageService();
      const updatedRecord = await storage.update<HealthRecord>('healthRecords', id, {
        ...recordData,
        date: recordData.date ? new Date(recordData.date) : undefined,
        nextDate: recordData.nextDate ? new Date(recordData.nextDate) : undefined,
      });
      
      set((state) => ({
        healthRecords: state.healthRecords.map((record) =>
          record.id === id ? updatedRecord : record
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update health record' });
    }
  },
  
  deleteHealthRecord: async (id) => {
    try {
      const storage = getLocalStorageService();
      await storage.delete('healthRecords', id);
      
      // 관련 리마인더도 삭제
      const relatedReminders = get().reminders.filter(r => r.relatedRecordId === id);
      await Promise.all(
        relatedReminders.map(r => storage.delete('reminders', r.id))
      );
      
      set((state) => ({
        healthRecords: state.healthRecords.filter((record) => record.id !== id),
        reminders: state.reminders.filter((reminder) => reminder.relatedRecordId !== id),
      }));
    } catch (error) {
      set({ error: 'Failed to delete health record' });
    }
  },
  
  getHealthRecordsByDog: (dogId) => {
    return get().healthRecords
      .filter((record) => record.dogId === dogId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  
  getUpcomingHealthRecords: (days = 30) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return get().healthRecords
      .filter((record) => 
        record.nextDate && 
        record.nextDate >= today && 
        record.nextDate <= futureDate && 
        !record.completed
      )
      .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
  },
  
  getOverdueHealthRecords: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().healthRecords
      .filter((record) => 
        record.nextDate && 
        record.nextDate < today && 
        !record.completed
      )
      .sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
  },
  
  // 일기 관련 액션 - MVP 핵심!
  addDiaryEntry: async (entryData) => {
    try {
      const { user, dogs } = get();
      if (!user) throw new Error('User not authenticated');
      
      const storage = getLocalStorageService();
      const newEntry = await storage.create<DiaryEntry>('diaryEntries', {
        dogId: entryData.dogId,
        date: new Date(entryData.date),
        title: entryData.title,
        content: entryData.content,
        photos: entryData.photos,
        mood: entryData.mood,
        weather: entryData.weather,
        tags: entryData.tags,
        specialMoment: entryData.specialMoment,
        milestone: entryData.milestone,
        gratitude: entryData.gratitude,
        wordCount: entryData.content.length,
        updatedAt: new Date(),
        // 커뮤니티 필드들
        isPublic: entryData.isPublic || false,
        userId: user.id,
        nickname: user.nickname,
      });
      
      set((state) => ({
        diaryEntries: [...state.diaryEntries, newEntry]
      }));
      
      // 공개 일기인 경우 커뮤니티 피드에도 추가
      if (newEntry.isPublic) {
        const dog = dogs.find(d => d.id === newEntry.dogId);
        if (dog) {
          // 커뮤니티 스토어의 addToPublicFeed 호출
          // 이는 별도 스토어이므로 직접 호출할 수 없으므로 window 이벤트 사용
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('addToPublicFeed', {
              detail: { diary: newEntry, dogName: dog.name }
            }));
          }
        }
      }
      
      return newEntry;
    } catch (error) {
      set({ error: 'Failed to add diary entry' });
      throw error;
    }
  },
  
  updateDiaryEntry: async (id, entryData) => {
    try {
      const { user } = get();
      const storage = getLocalStorageService();
      const updatedEntry = await storage.update<DiaryEntry>('diaryEntries', id, {
        ...entryData,
        date: entryData.date ? new Date(entryData.date) : undefined,
        wordCount: entryData.content ? entryData.content.length : undefined,
        // 커뮤니티 필드가 제공되면 업데이트
        ...(entryData.isPublic !== undefined && { 
          isPublic: entryData.isPublic,
          userId: user?.id || 'unknown',
          nickname: user?.nickname || '알 수 없음'
        }),
      });
      
      set((state) => ({
        diaryEntries: state.diaryEntries.map((entry) =>
          entry.id === id ? updatedEntry : entry
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update diary entry' });
    }
  },
  
  deleteDiaryEntry: async (id) => {
    try {
      const storage = getLocalStorageService();
      await storage.delete('diaryEntries', id);
      set((state) => ({
        diaryEntries: state.diaryEntries.filter((entry) => entry.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete diary entry' });
    }
  },
  
  getDiaryEntriesByDog: (dogId) => {
    return get().diaryEntries
      .filter((entry) => entry.dogId === dogId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  
  getDiaryEntriesByDateRange: (start, end, dogId) => {
    return get().diaryEntries
      .filter((entry) => {
        const entryDate = new Date(entry.date);
        const matchesDate = entryDate >= start && entryDate <= end;
        const matchesDog = dogId ? entry.dogId === dogId : true;
        return matchesDate && matchesDog;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },
  
  getDiaryStatsByMood: (dogId) => {
    const entries = dogId 
      ? get().diaryEntries.filter(e => e.dogId === dogId)
      : get().diaryEntries;
      
    return entries.reduce((stats, entry) => {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
  },
  
  // 리마인더 관련 액션 - MVP 핵심!
  addReminder: async (reminderData) => {
    try {
      const storage = getLocalStorageService();
      const newReminder = await storage.create<Reminder>('reminders', {
        ...reminderData,
        priority: reminderData.priority || 'medium',
      });
      
      set((state) => ({
        reminders: [...state.reminders, newReminder]
      }));
      
      return newReminder;
    } catch (error) {
      set({ error: 'Failed to add reminder' });
      throw error;
    }
  },
  
  updateReminder: async (id, reminderData) => {
    try {
      const storage = getLocalStorageService();
      const updatedReminder = await storage.update<Reminder>('reminders', id, {
        ...reminderData,
        dueDate: reminderData.dueDate ? new Date(reminderData.dueDate) : undefined,
      });
      
      set((state) => ({
        reminders: state.reminders.map((reminder) =>
          reminder.id === id ? updatedReminder : reminder
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update reminder' });
    }
  },
  
  deleteReminder: async (id) => {
    try {
      const storage = getLocalStorageService();
      await storage.delete('reminders', id);
      set((state) => ({
        reminders: state.reminders.filter((reminder) => reminder.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete reminder' });
    }
  },
  
  getTodayReminders: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return get().reminders
      .filter((reminder) => {
        const dueDate = new Date(reminder.dueDate);
        return dueDate >= today && dueDate < tomorrow && !reminder.isCompleted;
      })
      .sort((a, b) => {
        // 우선순위별로 정렬 (high -> medium -> low)
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
  },
  
  getUpcomingReminders: (days = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return get().reminders
      .filter((reminder) => {
        const dueDate = new Date(reminder.dueDate);
        return dueDate >= today && dueDate <= futureDate && !reminder.isCompleted;
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },
  
  completeReminder: async (id) => {
    try {
      const storage = getLocalStorageService();
      await get().updateReminder(id, { isCompleted: true });
    } catch (error) {
      set({ error: 'Failed to complete reminder' });
    }
  },
  
  // 설정 관련 액션
  updateSettings: async (newSettings) => {
    try {
      const updatedSettings = { ...get().settings, ...newSettings };
      // 설정은 localStorage에 직접 저장
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pawlog_settings', JSON.stringify(updatedSettings));
      }
      set({ settings: updatedSettings });
    } catch (error) {
      set({ error: 'Failed to update settings' });
    }
  },
  
  resetSettings: async () => {
    try {
      // 설정은 localStorage에 직접 저장
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('pawlog_settings', JSON.stringify(defaultSettings));
      }
      set({ settings: defaultSettings });
    } catch (error) {
      set({ error: 'Failed to reset settings' });
    }
  },
  
  // 데이터 관리 액션
  syncWithStorage: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const storage = getLocalStorageService();
      // 로컬 저장소에서 모든 데이터 동기화
      const [
        dogs,
        routineRecords, 
        healthRecords,
        diaryEntries,
        reminders
      ] = await Promise.all([
        storage.list<Dog>('dogs'),
        storage.list<RoutineRecord>('routineRecords'),
        storage.list<HealthRecord>('healthRecords'),
        storage.list<DiaryEntry>('diaryEntries'),
        storage.list<Reminder>('reminders'),
      ]);
      
      // 설정은 별도로 로드
      let settings = defaultSettings;
      if (typeof window !== 'undefined') {
        const storedSettings = window.localStorage.getItem('pawlog_settings');
        if (storedSettings) {
          try {
            settings = JSON.parse(storedSettings);
          } catch (error) {
            console.error('Failed to parse settings:', error);
          }
        }
      }
      
      set({
        dogs,
        routineRecords,
        healthRecords,
        diaryEntries,
        reminders,
        settings,
      });
    } catch (error) {
      set({ error: 'Failed to sync with storage' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  exportData: async (options) => {
    try {
      return await StorageUtils.exportToJSON(options);
    } catch (error) {
      set({ error: 'Failed to export data' });
      throw error;
    }
  },
  
  importData: async (jsonData) => {
    try {
      set({ isLoading: true, error: null });
      const success = await StorageUtils.importFromJSON(jsonData);
      if (success) {
        await get().syncWithStorage();
      }
      return success;
    } catch (error) {
      set({ error: 'Failed to import data' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  clearAllData: async () => {
    try {
      set({ isLoading: true, error: null });
      const storage = getLocalStorageService();
      await storage.clearAll();
      
      // 상태 초기화
      set({
        user: null,
        dogs: [],
        routineRecords: [],
        healthRecords: [],
        diaryEntries: [],
        reminders: [],
        settings: defaultSettings,
      });
      
      // 브라우저 플래그도 제거
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('pawlog_has_dogs');
      }
    } catch (error) {
      set({ error: 'Failed to clear data' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  getStorageInfo: () => {
    const storage = getLocalStorageService();
    return storage.getStorageUsage();
  },
  
  // 통계 관련 액션 (MVP Should Have)
  getDogStats: (dogId) => {
    const { routineRecords, diaryEntries, healthRecords } = get();
    
    const dogRoutines = routineRecords.filter(r => r.dogId === dogId);
    const dogDiaries = diaryEntries.filter(e => e.dogId === dogId);
    const dogHealth = healthRecords.filter(r => r.dogId === dogId);
    
    // 평균 감정 계산
    const moodScores = {
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
    
    const avgMoodScore = dogDiaries.length > 0
      ? dogDiaries.reduce((sum, entry) => sum + (moodScores[entry.mood] || 3), 0) / dogDiaries.length
      : 3;
      
    const avgMoodText = avgMoodScore >= 4.5 ? 'very-happy'
      : avgMoodScore >= 3.5 ? 'happy'
      : avgMoodScore >= 2.5 ? 'normal'
      : avgMoodScore >= 1.5 ? 'sad'
      : 'sick';
    
    return {
      totalRoutines: dogRoutines.length,
      totalDiaryEntries: dogDiaries.length,
      healthRecordsCount: dogHealth.length,
      averageMood: avgMoodText,
    };
  },
  
  // 오류 상태 관리
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  // 사용자별 데이터 로드 함수 추가
  loadUserData: async (userId: string) => {
    try {
      const storage = getLocalStorageService();
      const [
        dogs,
        routineRecords, 
        healthRecords,
        diaryEntries,
        reminders
      ] = await Promise.all([
        storage.list<Dog>('dogs'),
        storage.list<RoutineRecord>('routineRecords'),
        storage.list<HealthRecord>('healthRecords'),
        storage.list<DiaryEntry>('diaryEntries'),
        storage.list<Reminder>('reminders'),
      ]);

      // 현재 사용자 소유 데이터만 필터링
      const userDogs = dogs.filter(dog => dog.ownerId === userId);
      const userRoutineRecords = routineRecords.filter(record => 
        userDogs.some(dog => dog.id === record.dogId)
      );
      const userHealthRecords = healthRecords.filter(record => 
        userDogs.some(dog => dog.id === record.dogId)
      );
      const userDiaryEntries = diaryEntries.filter(entry => 
        userDogs.some(dog => dog.id === entry.dogId)
      );
      const userReminders = reminders.filter(reminder => 
        userDogs.some(dog => dog.id === reminder.dogId)
      );

      set({
        dogs: userDogs,
        routineRecords: userRoutineRecords,
        healthRecords: userHealthRecords,
        diaryEntries: userDiaryEntries,
        reminders: userReminders,
      });
    } catch (error) {
      set({ error: 'Failed to load user data' });
    }
  },
  
  // 로그아웃 함수 추가
  logout: async () => {
    try {
      // 상태 초기화
      set({
        user: null,
        dogs: [],
        routineRecords: [],
        healthRecords: [],
        diaryEntries: [],
        reminders: [],
        settings: defaultSettings,
      });
      
      // 인증 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pawlog_authenticated');
        localStorage.removeItem('pawlog_has_dogs');
      }
    } catch (error) {
      set({ error: 'Failed to logout' });
    }
  },
}),
    {
      name: 'pawlog-storage', // localStorage 키 이름
      storage: createJSONStorage(() => localStorage),
      // 지속성에서 제외할 상태들 (임시 상태)
      partialize: (state) => ({
        user: state.user,
        dogs: state.dogs,
        routineRecords: state.routineRecords,
        healthRecords: state.healthRecords,
        diaryEntries: state.diaryEntries,
        reminders: state.reminders,
        settings: state.settings,
        // isLoading, error는 제외 (임시 상태)
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 기존 일기 데이터에 isPublic, userId, nickname 필드가 없으면 기본값 추가
          state.diaryEntries = state.diaryEntries.map(entry => ({
            ...entry,
            isPublic: entry.isPublic ?? false,
            userId: entry.userId ?? state.user?.id ?? 'unknown',
            nickname: entry.nickname ?? state.user?.nickname ?? '알 수 없음',
          }));
          
          // 사용자에게 nickname이 없으면 기본값 추가
          if (state.user && !state.user.nickname) {
            state.user.nickname = state.user.name || '펫로그유저';
          }
        }
      },
    }
  )
);

// 커뮤니티 상태 관리를 위한 별도 스토어
export const useCommunityStore = create<CommunityState & {
  // 액션들
  addToPublicFeed: (diary: DiaryEntry, dogName: string) => void;
  removeFromPublicFeed: (diaryId: string) => void;
  toggleLike: (diaryId: string) => void;
  addComment: (diaryId: string, content: string) => void;
  setCurrentUser: (user: { id: string; nickname: string } | null) => void;
  loadMockFeed: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}>()((set, get) => ({
  // 초기 상태
  publicFeed: [],
  likes: {},
  comments: {},
  currentUser: null,
  isLoading: false,
  error: null,
  
  // 공개 피드에 일기 추가
  addToPublicFeed: (diary, dogName) => {
    const publicDiary: PublicDiary = {
      ...diary,
      dogName,
      likesCount: 0,
      commentsCount: 0,
      isLikedByUser: false,
    };
    
    set((state) => ({
      publicFeed: [publicDiary, ...state.publicFeed],
      likes: { ...state.likes, [diary.id]: 0 },
      comments: { ...state.comments, [diary.id]: [] }
    }));
  },
  
  // 공개 피드에서 일기 제거
  removeFromPublicFeed: (diaryId) => {
    set((state) => ({
      publicFeed: state.publicFeed.filter(diary => diary.id !== diaryId),
      likes: Object.fromEntries(Object.entries(state.likes).filter(([id]) => id !== diaryId)),
      comments: Object.fromEntries(Object.entries(state.comments).filter(([id]) => id !== diaryId))
    }));
  },
  
  // 좋아요 토글
  toggleLike: (diaryId) => {
    set((state) => {
      const currentLikes = state.likes[diaryId] || 0;
      const diary = state.publicFeed.find(d => d.id === diaryId);
      
      if (diary) {
        const newLikesCount = diary.isLikedByUser ? currentLikes - 1 : currentLikes + 1;
        
        return {
          likes: { ...state.likes, [diaryId]: newLikesCount },
          publicFeed: state.publicFeed.map(d => 
            d.id === diaryId 
              ? { ...d, likesCount: newLikesCount, isLikedByUser: !d.isLikedByUser }
              : d
          )
        };
      }
      
      return state;
    });
  },
  
  // 댓글 추가
  addComment: (diaryId, content) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      diaryId,
      userId: currentUser.id,
      nickname: currentUser.nickname,
      content,
      createdAt: new Date(),
    };
    
    set((state) => ({
      comments: {
        ...state.comments,
        [diaryId]: [...(state.comments[diaryId] || []), newComment]
      },
      publicFeed: state.publicFeed.map(d => 
        d.id === diaryId 
          ? { ...d, commentsCount: d.commentsCount + 1 }
          : d
      )
    }));
  },
  
  // 현재 사용자 설정
  setCurrentUser: (user) => {
    set({ currentUser: user });
  },
  
  // 목 데이터로 피드 로드
  loadMockFeed: () => {
    const mockDiaries: PublicDiary[] = [
      {
        id: 'mock-diary-1',
        dogId: 'mock-dog-1',
        date: new Date(Date.now() - 86400000), // 어제
        title: '첫 산책 성공! 🐕',
        content: '오늘 우리 모찌가 처음으로 집 밖으로 나가서 산책을 했어요! 처음엔 무서워했지만 조금씩 적응하더니 나중엔 꼬리를 흔들면서 걸었답니다. 정말 기특한 우리 아가 ❤️',
        photos: [],
        mood: 'excited',
        tags: ['첫산책', '성장', '기특함'],
        wordCount: 85,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        isPublic: true,
        userId: 'mock-user-1',
        nickname: '모찌엄마',
        dogName: '모찌',
        likesCount: 12,
        commentsCount: 3,
        isLikedByUser: false,
        specialMoment: true,
        milestone: '첫 산책'
      },
      {
        id: 'mock-diary-2',
        dogId: 'mock-dog-2',
        date: new Date(Date.now() - 172800000), // 2일 전
        title: '간식 먹방 타임',
        content: '새로 산 간식을 처음 줘봤는데 너무 맛있어하네요 ㅎㅎ 눈을 동그랗게 뜨고 더 달라고 보채는 모습이 너무 귀여워요!',
        photos: [],
        mood: 'happy',
        tags: ['간식', '먹방'],
        wordCount: 56,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        isPublic: true,
        userId: 'mock-user-2',
        nickname: '콩이아빠',
        dogName: '콩이',
        likesCount: 8,
        commentsCount: 1,
        isLikedByUser: false
      },
      {
        id: 'mock-diary-3',
        dogId: 'mock-dog-3',
        date: new Date(Date.now() - 259200000), // 3일 전
        title: '비 오는 날의 실내 놀이',
        content: '오늘은 비가 와서 산책을 못 갔지만, 집에서 숨바꼭질하고 공 던지기 놀이를 했어요. 생각보다 집에서도 충분히 놀 수 있다는 걸 깨달았네요!',
        photos: [],
        mood: 'excited',
        tags: ['실내놀이', '비오는날'],
        wordCount: 71,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 259200000),
        isPublic: true,
        userId: 'mock-user-3',
        nickname: '루이맘',
        dogName: '루이',
        likesCount: 5,
        commentsCount: 2,
        isLikedByUser: true
      }
    ];
    
    // 초기 좋아요/댓글 데이터 설정
    const initialLikes: Record<string, number> = {};
    const initialComments: Record<string, Comment[]> = {};
    
    mockDiaries.forEach(diary => {
      initialLikes[diary.id] = diary.likesCount;
      initialComments[diary.id] = [];
    });
    
    set({
      publicFeed: mockDiaries,
      likes: initialLikes,
      comments: initialComments
    });
  },
  
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading }),
})); 