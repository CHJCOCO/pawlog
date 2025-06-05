'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { HealthType } from '@/lib/types';
import { 
  formatDate, 
  formatTime,
  formatRelativeTime, 
  calculateDDay,
  healthEmojis, 
  healthNames 
} from '@/lib/utils';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import { 
  ArrowLeft, 
  Plus, 
  Filter, 
  Calendar,
  Clock,
  MapPin,
  FileText,
  Trash2,
  Bell,
  AlertTriangle,
  CheckCircle,
  Check,
  X,
  Pill,
  Stethoscope,
  Shield,
  Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HealthPage() {
  const router = useRouter();
  const { healthRecords, dogs, deleteHealthRecord, addHealthRecord, updateHealthRecord } = useAppStore();
  
  // 필터 상태
  const [selectedDogId, setSelectedDogId] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<HealthType | 'all'>('all');
  
  // 기록 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRecordType, setNewRecordType] = useState<HealthType>('vaccination');
  const [newRecordTitle, setNewRecordTitle] = useState('');
  const [newRecordDate, setNewRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRecordVeterinarian, setNewRecordVeterinarian] = useState('');
  const [newRecordNotes, setNewRecordNotes] = useState('');
  const [newRecordNextDate, setNewRecordNextDate] = useState('');
  const [newRecordDogId, setNewRecordDogId] = useState(dogs[0]?.id || '');

  // 필터링된 기록들
  const filteredRecords = useMemo(() => {
    let filtered = [...healthRecords];
    
    // 반려견 필터
    if (selectedDogId !== 'all') {
      filtered = filtered.filter(record => record.dogId === selectedDogId);
    }
    
    // 타입 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(record => record.type === selectedType);
    }
    
    // 날짜순 정렬 (최신순)
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [healthRecords, selectedDogId, selectedType]);

  // 다가오는 리마인더들
  const upcomingReminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return healthRecords
      .filter(record => {
        if (!record.nextDate) return false;
        const nextDate = new Date(record.nextDate);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate >= today;
      })
      .sort((a, b) => new Date(a.nextDate!).getTime() - new Date(b.nextDate!).getTime())
      .slice(0, 3); // 상위 3개만
  }, [healthRecords]);

  // 타입별 스타일링
  const healthTypeStyles = {
    vaccination: { 
      bg: 'bg-blue-50', 
      border: 'border-blue-200', 
      color: 'text-blue-600', 
      emoji: '💉',
      icon: Shield 
    },
    checkup: { 
      bg: 'bg-green-50', 
      border: 'border-green-200', 
      color: 'text-green-600', 
      emoji: '🩺',
      icon: Stethoscope 
    },
    medication: { 
      bg: 'bg-purple-50', 
      border: 'border-purple-200', 
      color: 'text-purple-600', 
      emoji: '💊',
      icon: Pill 
    },
    surgery: { 
      bg: 'bg-red-50', 
      border: 'border-red-200', 
      color: 'text-red-600', 
      emoji: '🏥',
      icon: Heart 
    },
    grooming: { 
      bg: 'bg-pink-50', 
      border: 'border-pink-200', 
      color: 'text-pink-600', 
      emoji: '✂️',
      icon: Heart 
    }
  };

  // 기록 추가 핸들러
  const handleAddRecord = () => {
    if (!newRecordTitle.trim() || !newRecordDogId) return;

    const recordDate = new Date(newRecordDate);
    const nextDate = newRecordNextDate ? new Date(newRecordNextDate) : undefined;

    const newRecord = {
      dogId: newRecordDogId,
      type: newRecordType,
      title: newRecordTitle.trim(),
      date: recordDate.toISOString(),
      veterinarian: newRecordVeterinarian.trim() || undefined,
      notes: newRecordNotes.trim() || undefined,
      nextDate: nextDate?.toISOString() || undefined,
      completed: true
    };

    addHealthRecord(newRecord);
    
    // 모달 닫기 및 초기화
    setIsAddModalOpen(false);
    setNewRecordTitle('');
    setNewRecordVeterinarian('');
    setNewRecordNotes('');
    setNewRecordNextDate('');
  };

  // 기록 삭제 핸들러
  const handleDeleteRecord = (recordId: string) => {
    if (confirm('이 건강 기록을 삭제하시겠습니까?')) {
      deleteHealthRecord(recordId);
    }
  };

  // 리마인더 D-Day 스타일
  const getDDayStyle = (dday: string) => {
    if (dday === 'D-Day') return 'bg-red-100 text-red-700 border-red-200';
    if (dday.includes('D-') && parseInt(dday.split('-')[1]) <= 7) 
      return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-2xl">🩺</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">건강 관리</h1>
                <p className="text-xs text-gray-500">예방접종부터 전체 건강까지</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 기록
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 💉 예방접종 현황 (상단 강조) */}
        {(() => {
          const vaccinationRecords = filteredRecords.filter(r => r.type === 'vaccination');
          const upcomingVaccinations = upcomingReminders.filter(r => r.type === 'vaccination');
          
          return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-3xl shadow-lg p-6 border-2 border-blue-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">💉 예방접종 관리</h3>
                  <p className="text-sm text-blue-600">우리 아이의 건강을 지켜주세요</p>
                </div>
              </div>
              
              {upcomingVaccinations.length > 0 ? (
                <div className="space-y-3 mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    다음 예정
                  </h4>
                  {upcomingVaccinations.slice(0, 2).map((record) => {
                    const dog = dogs.find(d => d.id === record.dogId);
                    const dDay = calculateDDay(record.nextDate!);
                    
                    return (
                      <div key={record.id} className="p-3 bg-white rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{record.title}</p>
                            <p className="text-sm text-gray-600">{dog?.name} • {formatDate(record.nextDate!)}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDDayStyle(dDay)}`}>
                            {dDay}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">예정된 예방접종이 없습니다</p>
                  <button
                    onClick={() => {
                      setNewRecordType('vaccination');
                      setIsAddModalOpen(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    예방접종 기록하기
                  </button>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">총 접종 기록</span>
                  <span className="font-bold text-blue-600">{vaccinationRecords.length}회</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 🔔 기타 건강 리마인더 */}
        {(() => {
          const otherReminders = upcomingReminders.filter(r => r.type !== 'vaccination');
          return otherReminders.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">🔔 다른 건강 일정</h3>
              </div>
              
              <div className="space-y-3">
                {otherReminders.map((record) => {
                  const dog = dogs.find(d => d.id === record.dogId);
                  const dDay = calculateDDay(record.nextDate!);
                  const style = healthTypeStyles[record.type];
                  
                  return (
                    <div key={record.id} className={`p-4 ${style.bg} ${style.border} border rounded-2xl`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{style.emoji}</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {record.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {dog?.name} • {formatDate(record.nextDate!)}
                            </p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDDayStyle(dDay)}`}>
                          {dDay}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 필터 섹션 */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">필터</h3>
          </div>
          
          <div className="space-y-4">
            {/* 반려견 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반려견
              </label>
              <select
                value={selectedDogId}
                onChange={(e) => setSelectedDogId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              >
                <option value="all">전체</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 건강 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기록 타입
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                    selectedType === 'all' 
                      ? 'bg-slate-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                {(Object.keys(healthTypeStyles) as HealthType[]).map((type) => {
                  const style = healthTypeStyles[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                        selectedType === type 
                          ? `${style.color} ${style.bg} ${style.border} border` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{style.emoji}</span>
                      <span>{healthNames[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 기록 리스트 */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 건강 기록이 없어요
            </h3>
            <p className="text-gray-600 mb-6">
              반려견의 첫 건강 기록을 추가해보세요!
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              첫 건강 기록 추가하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const dog = dogs.find(d => d.id === record.dogId);
              const style = healthTypeStyles[record.type];
              
              return (
                <div key={record.id} className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  {/* 기록 헤더 */}
                  <div className={`${style.bg} ${style.border} border-b p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{style.emoji}</div>
                        <div>
                          <h4 className="font-bold text-gray-900">{record.title}</h4>
                          <p className="text-sm text-gray-600">
                            {dog?.name} • {healthNames[record.type]}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 기록 내용 */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>기록일: {formatDate(record.date)}</span>
                      </div>
                      
                      {record.veterinarian && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>병원: {record.veterinarian}</span>
                        </div>
                      )}
                      
                      {record.nextDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600 font-medium">
                            다음 일정: {formatDate(record.nextDate)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDDayStyle(calculateDDay(record.nextDate))}`}>
                            {calculateDDay(record.nextDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{record.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 기록 추가 바텀 시트 */}
      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="text-2xl">🩺</div>
            새 건강 기록 추가
          </h3>
          
          <div className="space-y-4">
            {/* 반려견 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반려견
              </label>
              <select
                value={newRecordDogId}
                onChange={(e) => setNewRecordDogId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 기록 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기록 타입
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(healthTypeStyles) as HealthType[]).map((type) => {
                  const style = healthTypeStyles[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewRecordType(type)}
                      className={`p-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                        newRecordType === type 
                          ? `${style.color} ${style.bg} ${style.border} border` 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>{style.emoji}</span>
                      <span>{healthNames[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={newRecordTitle}
                onChange={(e) => setNewRecordTitle(e.target.value)}
                placeholder="예: 광견병 예방접종, 건강검진 등"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                기록 날짜 *
              </label>
              <input
                type="date"
                value={newRecordDate}
                onChange={(e) => setNewRecordDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 병원명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                병원명 (선택)
              </label>
              <input
                type="text"
                value={newRecordVeterinarian}
                onChange={(e) => setNewRecordVeterinarian(e.target.value)}
                placeholder="예: 우리동물병원"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 다음 일정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                다음 일정 (리마인더)
              </label>
              <input
                type="date"
                value={newRecordNextDate}
                onChange={(e) => setNewRecordNextDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                다음 일정을 설정하면 홈 화면에 리마인더가 표시됩니다
              </p>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택)
              </label>
              <textarea
                value={newRecordNotes}
                onChange={(e) => setNewRecordNotes(e.target.value)}
                placeholder="추가 메모를 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none text-gray-900"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-3 rounded-2xl"
            >
              취소
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={!newRecordTitle.trim()}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              저장
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
} 