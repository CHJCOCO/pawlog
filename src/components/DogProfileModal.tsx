'use client';

import { Dog } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { calculateAge, formatRelativeTime } from '@/lib/utils';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import { Heart, Calendar, Stethoscope, Edit3, Activity, Syringe } from 'lucide-react';
import Link from 'next/link';

interface DogProfileModalProps {
  dog: Dog | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DogProfileModal({ dog, isOpen, onClose }: DogProfileModalProps) {
  const { routineRecords, healthRecords, getTodayReminders } = useAppStore();

  if (!dog) return null;

  // 시간대별 감성 메시지
  const getEmotionalMessage = () => {
    const hour = new Date().getHours();
    const messages = {
      morning: [`${dog.name}와 함께하는 상쾌한 아침이에요! ☀️`, `오늘도 ${dog.name}와 즐거운 하루 보내세요! 🌅`],
      afternoon: [`${dog.name}가 오늘도 건강하게 하루 보내고 있어요! 😊`, `우리 ${dog.name}, 점심시간엔 뭐 하고 있을까요? 🍽️`],
      evening: [`${dog.name}와 함께한 하루, 어떠셨나요? 🌙`, `${dog.name}도 하루 종일 수고 많았어요! 🌆`],
      night: [`${dog.name}와 함께 편안한 밤 보내세요 💤`, `내일도 ${dog.name}와 좋은 하루 만들어봐요! ⭐`]
    };

    if (hour >= 6 && hour < 12) return messages.morning[Math.floor(Math.random() * messages.morning.length)];
    if (hour >= 12 && hour < 18) return messages.afternoon[Math.floor(Math.random() * messages.afternoon.length)];
    if (hour >= 18 && hour < 22) return messages.evening[Math.floor(Math.random() * messages.evening.length)];
    return messages.night[Math.floor(Math.random() * messages.night.length)];
  };

  // 최근 일주일 산책 횟수
  const getWeeklyWalkCount = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return routineRecords.filter(record => 
      record.dogId === dog.id && 
      record.type === 'walk' && 
      new Date(record.timestamp) >= oneWeekAgo
    ).length;
  };

  // 마지막 접종 날짜
  const getLastVaccination = () => {
    const vaccinations = healthRecords
      .filter(record => record.dogId === dog.id && record.type === 'vaccination')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return vaccinations[0] || null;
  };

  // 오늘/내일 리마인더
  const getUpcomingReminder = () => {
    const reminders = getTodayReminders().filter(reminder => reminder.dogId === dog.id);
    return reminders[0] || null;
  };

  const weeklyWalks = getWeeklyWalkCount();
  const lastVaccination = getLastVaccination();
  const upcomingReminder = getUpcomingReminder();
  const age = calculateAge(dog.birthDate);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* 감성 메시지 */}
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
          <p className="text-lg font-medium text-gray-800">
            {getEmotionalMessage()}
          </p>
        </div>

        {/* 기본 프로필 */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          {dog.photo ? (
            <img 
              src={dog.photo} 
              alt={dog.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
              🐕
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{dog.name}</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🎂</span>
                <span>{age}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🐕</span>
                <span>{dog.breed}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>⚖️</span>
                <span>{dog.weight}kg</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{dog.gender === 'male' ? '♂️' : '♀️'}</span>
                <span>{dog.isNeutered ? '중성화 완료' : '중성화 미완료'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상태 요약 */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            최근 상태
          </h4>
          
          <div className="grid grid-cols-1 gap-3">
            {/* 산책 통계 */}
            <div className="p-4 bg-blue-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚶</div>
                <div>
                  <p className="font-medium text-gray-900">최근 7일 산책</p>
                  <p className="text-sm text-gray-600">
                    총 <span className="font-bold text-blue-600">{weeklyWalks}회</span> 산책했어요
                    {weeklyWalks >= 7 && <span className="text-green-600"> 💪 꾸준히 잘하고 있어요!</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* 건강 관리 */}
            <div className="p-4 bg-green-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💉</div>
                <div>
                  <p className="font-medium text-gray-900">건강 관리</p>
                  <p className="text-sm text-gray-600">
                    {lastVaccination 
                      ? `마지막 접종: ${formatRelativeTime(lastVaccination.date)}`
                      : '접종 기록이 없어요'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 리마인더 */}
            {upcomingReminder && (
              <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <p className="font-medium text-gray-900">다가오는 일정</p>
                    <p className="text-sm text-gray-600">{upcomingReminder.title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 바로가기 버튼들 */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-gray-900">빠른 이동</h4>
          
          <div className="grid grid-cols-1 gap-3">
            <Link href="/profile" onClick={onClose}>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white hover:bg-gray-50 border-2 border-gray-200 py-4"
              >
                <Edit3 className="w-5 h-5 mr-3 text-gray-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">프로필 수정</p>
                  <p className="text-sm text-gray-600">정보 업데이트하기</p>
                </div>
              </Button>
            </Link>

            <Link href="/health" onClick={onClose}>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white hover:bg-gray-50 border-2 border-gray-200 py-4"
              >
                <Stethoscope className="w-5 h-5 mr-3 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">건강 관리</p>
                  <p className="text-sm text-gray-600">접종/진료 기록 보기</p>
                </div>
              </Button>
            </Link>

            <Link href="/records" onClick={onClose}>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-white hover:bg-gray-50 border-2 border-gray-200 py-4"
              >
                <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">활동 기록</p>
                  <p className="text-sm text-gray-600">루틴 기록 전체보기</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* 하단 감성 메시지 */}
        <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl border-2 border-pink-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span className="text-lg font-medium text-gray-800">사랑하는 우리 가족</span>
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <p className="text-sm text-gray-600">
            매일매일 {dog.name}와 함께하는 소중한 시간들을 기록해보세요 💕
          </p>
        </div>
      </div>
    </BottomSheet>
  );
} 