'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { RoutineType } from '@/lib/types';
import { 
  formatDate, 
  formatTime, 
  formatRelativeTime, 
  routineEmojis, 
  routineNames,
  calculateAge
} from '@/lib/utils';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import { 
  ArrowLeft, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RecordsPage() {
  const router = useRouter();
  const { routineRecords, dogs, deleteRoutineRecord, addRoutineRecord } = useAppStore();
  
  // 선택된 날짜 (기본: 오늘)
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 기록 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRoutineType, setSelectedRoutineType] = useState<RoutineType>('walk');
  const [selectedDogId, setSelectedDogId] = useState(dogs[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [notes, setNotes] = useState('');

  // 선택된 날짜의 기록들 가져오기
  const selectedDateRecords = useMemo(() => {
    const dateStart = new Date(selectedDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(selectedDate);
    dateEnd.setHours(23, 59, 59, 999);

    return routineRecords
      .filter(record => 
        record.timestamp >= dateStart && record.timestamp <= dateEnd
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // 시간순 정렬
  }, [routineRecords, selectedDate]);

  // 루틴별로 그룹화
  const groupedRecords = useMemo(() => {
    const groups: { [key in RoutineType]: typeof selectedDateRecords } = {
      walk: [],
      meal: [],
      poop: [],
      brush: []
    };

    selectedDateRecords.forEach(record => {
      groups[record.type].push(record);
    });

    return groups;
  }, [selectedDateRecords]);

  // 날짜 이동 함수
  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  // 기록 추가 핸들러
  const handleAddRecord = () => {
    if (!selectedDogId) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const recordDate = new Date(selectedDate);
    recordDate.setHours(hours, minutes, 0, 0);

    const newRecord = {
      dogId: selectedDogId,
      type: selectedRoutineType,
      timestamp: recordDate.toISOString(),
      notes: notes.trim() || undefined,
      // 타입별 기본 값들
      ...(selectedRoutineType === 'walk' && { duration: 30 }),
      ...(selectedRoutineType === 'meal' && { amount: '사료' }),
      ...(selectedRoutineType === 'poop' && { amount: '대변' }),
      ...(selectedRoutineType === 'brush' && { amount: '양치 완료' })
    };

    addRoutineRecord(newRecord);
    
    // 모달 닫기 및 초기화
    setIsAddModalOpen(false);
    setNotes('');
    setSelectedTime(new Date().toTimeString().slice(0, 5));
  };

  // 기록 삭제 핸들러
  const handleDeleteRecord = (recordId: string) => {
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      deleteRoutineRecord(recordId);
    }
  };

  // 루틴별 아이콘과 색상
  const routineStyles = {
    walk: { bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-600', emoji: '🚶' },
    meal: { bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-600', emoji: '🍽️' },
    poop: { bg: 'bg-orange-50', border: 'border-orange-200', color: 'text-orange-600', emoji: '💩' },
    brush: { bg: 'bg-teal-50', border: 'border-teal-200', color: 'text-teal-600', emoji: '🦷' }
  };

  // 시간대별 이모지
  const getTimeEmoji = (timestamp: Date, type: RoutineType) => {
    const hour = timestamp.getHours();
    if (type === 'walk') {
      if (hour >= 5 && hour < 12) return '🌅'; // 아침
      if (hour >= 12 && hour < 17) return '☀️'; // 오후
      if (hour >= 17 && hour < 21) return '🌆'; // 저녁
      return '🌙'; // 밤
    }
    return routineEmojis[type];
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isYesterday = selectedDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
  const isTomorrow = selectedDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-2xl">📊</div>
              <h1 className="text-xl font-bold text-gray-900">루틴 기록</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 날짜 선택기 */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeDate('prev')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {isToday ? '오늘' : isYesterday ? '어제' : isTomorrow ? '내일' : 
                 selectedDate.toLocaleDateString('ko-KR', { 
                   month: 'long', 
                   day: 'numeric',
                   weekday: 'short'
                 })
                }
              </div>
              <div className="text-sm text-gray-600">
                {selectedDate.toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit'
                })}
              </div>
            </div>
            
            <button
              onClick={() => changeDate('next')}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 루틴별 기록 섹션 */}
        {(Object.keys(routineStyles) as RoutineType[]).map((routineType) => {
          const style = routineStyles[routineType];
          const records = groupedRecords[routineType];
          
          return (
            <div key={routineType} className="bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* 섹션 헤더 */}
              <div className={`${style.bg} ${style.border} border-b px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{style.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{routineNames[routineType]}</h3>
                      <p className="text-sm text-gray-600">{records.length}회 기록</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRoutineType(routineType);
                      setIsAddModalOpen(true);
                    }}
                    className={`px-4 py-2 ${style.color} bg-white rounded-full text-sm font-medium hover:shadow-md transition-all flex items-center gap-2`}
                  >
                    <Plus className="w-4 h-4" />
                    추가
                  </button>
                </div>
              </div>

              {/* 기록 목록 */}
              <div className="divide-y divide-gray-100">
                {records.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-3xl mb-2">😴</div>
                    <p className="text-sm">아직 기록이 없어요</p>
                  </div>
                ) : (
                  records.map((record) => {
                    const dog = dogs.find(d => d.id === record.dogId);
                    const timeEmoji = getTimeEmoji(record.timestamp, record.type);
                    
                    return (
                      <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-2xl">{timeEmoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {formatTime(record.timestamp)}
                                </span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{dog?.name}</span>
                              </div>
                              {record.notes && (
                                <p className="text-sm text-gray-600">{record.notes}</p>
                              )}
                              {record.amount && (
                                <p className="text-xs text-gray-500">{record.amount}</p>
                              )}
                              {record.duration && (
                                <p className="text-xs text-gray-500">{record.duration}분</p>
                              )}
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
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

        {/* 오늘 루틴 요약 카드 */}
        <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-3xl p-6 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {isToday ? '오늘의 루틴 요약' : '이날의 루틴 요약'}
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {(Object.keys(routineStyles) as RoutineType[]).map((type) => {
              const count = groupedRecords[type].length;
              const style = routineStyles[type];
              
              return (
                <div key={type} className="bg-white rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-1">{style.emoji}</div>
                  <div className="text-xl font-bold text-gray-900">{count}회</div>
                  <div className="text-sm text-gray-600">{routineNames[type]}</div>
                  {count > 0 && (
                    <div className="text-xs text-green-600 font-medium">✓ 완료</div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedDateRecords.length > 0 && (
            <div className="mt-4 pt-4 border-t border-orange-200">
              <p className="text-center text-sm text-gray-700">
                🎉 총 <span className="font-bold text-orange-600">{selectedDateRecords.length}개</span>의 루틴을 기록했어요!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 기록 추가 바텀 시트 */}
      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="text-2xl">{routineStyles[selectedRoutineType]?.emoji}</div>
            {routineNames[selectedRoutineType]} 기록 추가
          </h3>
          
          <div className="space-y-4">
            {/* 반려견 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반려견
              </label>
              <select
                value={selectedDogId}
                onChange={(e) => setSelectedDogId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 시간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시간
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 메모 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="추가 정보를 입력하세요..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900"
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
              className="flex-1 bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white py-3 rounded-2xl"
            >
              저장
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
} 