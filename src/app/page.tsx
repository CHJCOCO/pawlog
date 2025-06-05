'use client';

import { useAppStore } from '@/lib/store';
import { formatRelativeTime, calculateAge } from '@/lib/utils';
import { Plus, Heart, Activity, Calendar, Camera, Bell, ChevronRight, Edit3, Zap, Check, X, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BottomNavigation from '@/components/BottomNavigation';
import DogProfileModal from '@/components/DogProfileModal';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dog } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { 
    dogs, 
    getTodayReminders, 
    routineRecords, 
    diaryEntries,
    healthRecords,
    user
  } = useAppStore();

  // 모달 상태 관리
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isStoreReady, setIsStoreReady] = useState(false);

  // 반려견 카드 클릭 핸들러
  const handleDogCardClick = (dog: Dog) => {
    setSelectedDog(dog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDog(null);
  };

  // 클라이언트 마운트 감지
  useEffect(() => {
    setIsClient(true);
    // Zustand persist 자동 복원 완료되면 바로 준비 상태로
    setIsStoreReady(true);
    
    // 디버깅: localStorage 상태 확인 (개발 환경에서만)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔍 localStorage 확인:');
      console.log('- pawlog_authenticated:', localStorage.getItem('pawlog_authenticated'));
      console.log('- pawlog-storage:', localStorage.getItem('pawlog-storage'));
      console.log('- 현재 dogs 수:', dogs.length);
      if (dogs.length > 0) {
        console.log('- 첫 번째 반려견:', dogs[0].name);
      }
    }
  }, [dogs]);

  // 단계적 인증 및 리디렉션 체크 (상태 복원 후에만 실행)
  useEffect(() => {
    if (!isClient || !isStoreReady) return;

    // 1단계: 로그인 확인 (최우선)
    const isAuthenticated = localStorage.getItem('pawlog_authenticated');
    
    if (!isAuthenticated) {
      console.log('🔒 로그인이 필요합니다. 온보딩 페이지로 이동합니다.');
      router.push('/onboarding');
      return;
    }

    // 2단계: 로그인된 상태에서만 반려견 확인
    console.log('✅ 로그인 확인됨. 반려견 등록 여부를 확인합니다.');
    
    // 현재 사용자의 반려견만 체크
    const hasCurrentDogs = dogs.length > 0;
    
    // 로그인은 되어있지만 반려견이 없으면 등록 페이지로
    if (!hasCurrentDogs) {
      console.log('🐕 반려견이 등록되지 않음. 반려견 등록 페이지로 이동합니다.');
      router.push('/dogs/add?first=true');
      return;
    }

    console.log('🏠 모든 조건 만족. 홈 화면을 표시합니다.');
  }, [router, dogs.length, isClient, isStoreReady]);
  
  const todayReminders = getTodayReminders();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 오늘 기록들
  const todayRecords = routineRecords.filter(record => {
    const recordDate = new Date(record.timestamp);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  // 감성 메시지 생성
  const getRandomEmotionalMessage = () => {
    const hour = new Date().getHours();
    const dogNames = dogs.map(d => d.name).join(', ');
    
    const messages = {
      morning: [
        `오늘도 ${dogNames}와 함께하는 상쾌한 아침! ☀️`,
        `${dogNames}와 새로운 하루를 시작해보세요! 🌅`,
        `좋은 아침이에요! ${dogNames}도 기운차게 하루를 시작할 거에요! 💪`
      ],
      afternoon: [
        `${dogNames}와 함께하는 따뜻한 오후! 🌞`,
        `오늘도 ${dogNames}와 즐거운 시간 보내고 계시나요? 😊`,
        `점심 후 ${dogNames}와 산책은 어떠세요? 🚶‍♂️`
      ],
      evening: [
        `${dogNames}와 함께한 하루, 수고하셨어요! 🌆`,
        `저녁 시간, ${dogNames}와 여유로운 시간 보내세요! 🌙`,
        `오늘 하루도 ${dogNames}와 즐겁게 보내셨나요? 💕`
      ],
      night: [
        `${dogNames}와 편안한 밤 되세요! 💤`,
        `내일도 ${dogNames}와 좋은 하루 만들어봐요! ⭐`,
        `오늘도 ${dogNames}와 함께해서 행복했어요! 🥰`
      ]
    };

    let timeMessages;
    if (hour >= 6 && hour < 12) timeMessages = messages.morning;
    else if (hour >= 12 && hour < 18) timeMessages = messages.afternoon;
    else if (hour >= 18 && hour < 22) timeMessages = messages.evening;
    else timeMessages = messages.night;

    return timeMessages[Math.floor(Math.random() * timeMessages.length)];
  };

  // 대표 반려견 (첫 번째 반려견)
  const mainDog = dogs[0];

  // 오늘 루틴 상태 체크
  const getTodayRoutineStatus = (dogId: string) => {
    const dogRecords = todayRecords.filter(r => r.dogId === dogId);
    return {
      walk: dogRecords.some(r => r.type === 'walk'),
      meal: dogRecords.some(r => r.type === 'meal'),
      poop: dogRecords.some(r => r.type === 'poop'),
      brush: dogRecords.some(r => r.type === 'brush'),
      walkTime: dogRecords.find(r => r.type === 'walk')?.timestamp,
      mealTime: dogRecords.find(r => r.type === 'meal')?.timestamp,
      poopTime: dogRecords.find(r => r.type === 'poop')?.timestamp,
      brushTime: dogRecords.find(r => r.type === 'brush')?.timestamp,
    };
  };

  // 로딩 상태 (클라이언트 마운트 전이나 상태 복원 중)
  if (!isClient || !isStoreReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apricot-50 to-apricot-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-apricot-200/50">
          <div className="text-8xl mb-6 animate-bounce">🐾</div>
          <h2 className="text-2xl font-semibold text-warm-gray-800 mb-4">
            PawLog 준비 중...
          </h2>
          <p className="text-soft-gray-400">잠시만 기다려주세요! ✨</p>
        </div>
      </div>
    );
  }

  // 반려견 데이터 없음 (상태 복원 후에도 없으면)
  if (dogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-apricot-50 to-apricot-100 flex items-center justify-center p-4">
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-apricot-200/50">
          <div className="text-8xl mb-6">🐾</div>
          <h2 className="text-2xl font-semibold text-warm-gray-800 mb-4">
            반려견을 등록해주세요
          </h2>
          <p className="text-soft-gray-400 mb-6">아직 등록된 반려견이 없어요!</p>
          <Button
            onClick={() => router.push('/dogs/add?first=true')}
            className="bg-gradient-to-r from-apricot-400 to-coral-400 hover:from-apricot-500 hover:to-coral-500 text-white px-8 py-3 rounded-full shadow-md hover:scale-105 transition-all duration-200"
          >
            첫 번째 가족 등록하기 💕
          </Button>
        </div>
      </div>
    );
  }

  const routineStatus = getTodayRoutineStatus(mainDog.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-apricot-50 to-apricot-100 pb-28">
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 감성 메시지 */}
        <div className="text-center py-6 px-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-apricot-200/50">
          <div className="text-2xl mb-3">✨</div>
          <p className="text-lg font-medium text-warm-gray-800 mb-2 leading-relaxed">
            {getRandomEmotionalMessage()}
          </p>
          <p className="text-sm text-soft-gray-400">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>

        {/* 대표 반려견 카드 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-apricot-200/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-warm-gray-800 flex items-center gap-2">
              🐾 우리 가족
            </h3>
            <button
              onClick={() => handleDogCardClick(mainDog)}
              className="p-2 rounded-full bg-apricot-100 hover:bg-apricot-200 transition-all duration-200 hover:scale-105"
            >
              <Edit3 className="w-4 h-4 text-apricot-600" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {mainDog.photo ? (
              <img 
                src={mainDog.photo} 
                alt={mainDog.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-apricot-300 shadow-lg hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-apricot-200 to-coral-200 rounded-full flex items-center justify-center text-3xl border-4 border-apricot-300 shadow-lg hover:scale-105 transition-transform duration-200">
                🐕
              </div>
            )}
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-warm-gray-800 mb-1">{mainDog.name}</h4>
              <div className="space-y-1">
                <p className="text-sm text-soft-gray-400 flex items-center gap-2">
                  <span>🎂</span>
                  <span>{calculateAge(mainDog.birthDate)}</span>
                </p>
                <p className="text-sm text-soft-gray-400 flex items-center gap-2">
                  <span>🐕</span>
                  <span>{mainDog.breed}</span>
                </p>
                <p className="text-sm text-soft-gray-400 flex items-center gap-2">
                  <span>⚖️</span>
                  <span>{mainDog.weight}kg</span>
                </p>
              </div>
            </div>
          </div>
          
          {dogs.length > 1 && (
            <div className="mt-4 pt-4 border-t border-apricot-200/40">
              <p className="text-sm text-soft-gray-400 text-center">
                +{dogs.length - 1}마리 더 있어요 
                <button 
                  onClick={() => router.push('/profile')}
                  className="text-apricot-600 hover:text-apricot-700 ml-1 transition-colors"
                >
                  전체보기
                </button>
              </p>
            </div>
          )}
        </div>

        {/* 오늘의 리마인더 */}
        {todayReminders.length > 0 && (
          <div className="bg-gradient-to-r from-coral-50 to-apricot-50 border-2 border-coral-200 rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-coral-600" />
              <h3 className="text-lg font-semibold text-warm-gray-800">📌 오늘의 일정</h3>
            </div>
            
            <div className="space-y-3">
              {todayReminders.slice(0, 2).map((reminder) => {
                const dog = dogs.find(d => d.id === reminder.dogId);
                return (
                  <Link key={reminder.id} href="/health">
                    <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-2xl hover:shadow-md transition-all hover:scale-102 border border-apricot-200/30">
                      <div className="text-2xl">📅</div>
                      <div className="flex-1">
                        <p className="font-medium text-warm-gray-800">{reminder.title}</p>
                        <p className="text-sm text-soft-gray-400">{dog?.name}의 건강 관리</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-coral-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 오늘의 루틴 상태 요약 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border border-apricot-200/30">
          <h3 className="text-lg font-semibold text-warm-gray-800 mb-4 flex items-center gap-2">
            📊 오늘의 루틴 상태
          </h3>
          
          <div className="space-y-4">
            {/* 산책 */}
            <div className="flex items-center justify-between p-3 bg-mint-50 rounded-2xl border border-mint-200/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🚶</div>
                <div>
                  <p className="font-medium text-warm-gray-800">산책</p>
                  {routineStatus.walkTime && (
                    <p className="text-xs text-soft-gray-400">
                      {new Date(routineStatus.walkTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {routineStatus.walk ? (
                  <div className="flex items-center gap-1 text-mint-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">완료</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-soft-gray-400">
                    <X className="w-5 h-5" />
                    <span className="text-sm">기록 없음</span>
                  </div>
                )}
              </div>
            </div>

            {/* 식사 */}
            <div className="flex items-center justify-between p-3 bg-apricot-50 rounded-2xl border border-apricot-200/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🍽️</div>
                <div>
                  <p className="font-medium text-warm-gray-800">식사</p>
                  {routineStatus.mealTime && (
                    <p className="text-xs text-soft-gray-400">
                      {new Date(routineStatus.mealTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {routineStatus.meal ? (
                  <div className="flex items-center gap-1 text-apricot-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">완료</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-soft-gray-400">
                    <X className="w-5 h-5" />
                    <span className="text-sm">기록 없음</span>
                  </div>
                )}
              </div>
            </div>

            {/* 배변 */}
            <div className="flex items-center justify-between p-3 bg-coral-50 rounded-2xl border border-coral-200/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">💩</div>
                <div>
                  <p className="font-medium text-warm-gray-800">배변</p>
                  {routineStatus.poopTime && (
                    <p className="text-xs text-soft-gray-400">
                      {new Date(routineStatus.poopTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {routineStatus.poop ? (
                  <div className="flex items-center gap-1 text-coral-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">완료</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-soft-gray-400">
                    <X className="w-5 h-5" />
                    <span className="text-sm">기록 없음</span>
                  </div>
                )}
              </div>
            </div>

            {/* 양치 */}
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-2xl border border-teal-200/50">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🦷</div>
                <div>
                  <p className="font-medium text-warm-gray-800">양치</p>
                  {routineStatus.brushTime && (
                    <p className="text-xs text-soft-gray-400">
                      {new Date(routineStatus.brushTime).toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {routineStatus.brush ? (
                  <div className="flex items-center gap-1 text-teal-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">완료</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-soft-gray-400">
                    <X className="w-5 h-5" />
                    <span className="text-sm">기록 없음</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 동기화 상태 */}
        <div className="bg-apricot-50/50 backdrop-blur-sm rounded-2xl p-4 border border-apricot-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-apricot-500" />
              <span className="text-sm text-soft-gray-400">
                마지막 업데이트: {lastUpdate.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <button
              onClick={() => setLastUpdate(new Date())}
              className="text-xs text-apricot-600 hover:text-apricot-700 font-medium transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </main>

      {/* 하단 고정 빠른 기록 버튼들 */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-apricot-200/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-lg">✨</span>
              <p className="text-sm font-medium text-warm-gray-700">빠른 기록</p>
              <span className="text-lg">✨</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/records">
                <Button 
                  className="w-full bg-gradient-to-r from-mint-400 to-mint-500 hover:from-mint-500 hover:to-mint-600 text-white rounded-full py-3 flex flex-col items-center gap-1 shadow-md hover:scale-105 transition-all duration-200"
                >
                  <div className="text-lg">🚶</div>
                  <span className="text-xs font-medium">루틴 기록</span>
                </Button>
              </Link>
              
              <Link href="/health">
                <Button 
                  className="w-full bg-gradient-to-r from-apricot-400 to-apricot-500 hover:from-apricot-500 hover:to-apricot-600 text-white rounded-full py-3 flex flex-col items-center gap-1 shadow-md hover:scale-105 transition-all duration-200"
                >
                  <div className="text-lg">🩺</div>
                  <span className="text-xs font-medium">건강 관리</span>
                </Button>
              </Link>
              
              <Link href="/diary">
                <Button 
                  className="w-full bg-gradient-to-r from-coral-400 to-coral-500 hover:from-coral-500 hover:to-coral-600 text-white rounded-full py-3 flex flex-col items-center gap-1 shadow-md hover:scale-105 transition-all duration-200"
                >
                  <div className="text-lg">📷</div>
                  <span className="text-xs font-medium">감성 일기</span>
                </Button>
              </Link>
              
              <Link href="/community">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white rounded-full py-3 flex flex-col items-center gap-1 shadow-md hover:scale-105 transition-all duration-200"
                >
                  <div className="text-lg">🌍</div>
                  <span className="text-xs font-medium">커뮤니티</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 반려견 프로필 모달 */}
      <DogProfileModal 
        dog={selectedDog}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <BottomNavigation />
    </div>
  );
}
