'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { RoutineFormData, RoutineType, MoodType } from '@/lib/types';
import { routineEmojis, routineNames, weatherEmojis, weatherNames, moodEmojis, moodNames, formatDate, fileToBase64, resizeImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ArrowLeft, Camera, Clock, MapPin, Plus, X } from 'lucide-react';
import Link from 'next/link';

// 동적 렌더링으로 설정
export const dynamic = 'force-dynamic';

export default function AddRoutinePage() {
  const router = useRouter();
  const { addRoutineRecord, dogs } = useAppStore();
  
  // 클라이언트에서만 URL 파라미터 확인
  const [typeFromUrl, setTypeFromUrl] = useState<RoutineType | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlType = urlParams.get('type') as RoutineType | null;
      setTypeFromUrl(urlType);
    }
  }, []);
  
  const [formData, setFormData] = useState<RoutineFormData>({
    dogId: '',
    type: typeFromUrl || 'walk',
    timestamp: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm 형식
    duration: undefined,
    distance: undefined,
    amount: '',
    notes: '',
    weather: undefined,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 반려견이 한 마리뿐이면 자동으로 선택
    if (dogs.length === 1) {
      setFormData(prev => ({ ...prev, dogId: dogs[0].id }));
    }
  }, [dogs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'duration' || name === 'distance') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dogId) {
      alert('반려견을 선택해주세요.');
      return;
    }
    
    if (!formData.timestamp) {
      alert('날짜와 시간을 선택해주세요.');
      return;
    }

    // 타입별 필수 검증
    if (formData.type === 'walk' && !formData.duration) {
      alert('산책 시간을 입력해주세요.');
      return;
    }
    
    if (formData.type === 'meal' && !formData.amount) {
      alert('식사량을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      addRoutineRecord(formData);
      router.push('/records');
    } catch (error) {
      console.error('루틴 기록 중 오류:', error);
      alert('루틴 기록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDog = dogs.find(dog => dog.id === formData.dogId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-2xl">{routineEmojis[formData.type]}</div>
            <h1 className="text-xl font-bold text-gray-900">
              {routineNames[formData.type]} 기록
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 반려견 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반려견 선택 *
              </label>
              <select
                name="dogId"
                value={formData.dogId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">반려견을 선택하세요</option>
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name} ({dog.breed})
                  </option>
                ))}
              </select>
              {selectedDog && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  {selectedDog.photo ? (
                    <img 
                      src={selectedDog.photo} 
                      alt={selectedDog.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      🐕
                    </div>
                  )}
                  <span>{selectedDog.name}와 함께한 {routineNames[formData.type]}</span>
                </div>
              )}
            </div>

            {/* 루틴 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                루틴 타입 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(Object.keys(routineEmojis) as RoutineType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{routineEmojis[type]}</div>
                    <div className="text-sm font-medium">{routineNames[type]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜 및 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                날짜 및 시간 *
              </label>
              <input
                type="datetime-local"
                name="timestamp"
                value={formData.timestamp}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* 타입별 상세 정보 */}
            {formData.type === 'walk' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">산책 상세 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      산책 시간 (분) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거리 (km)
                    </label>
                    <input
                      type="number"
                      name="distance"
                      value={formData.distance || ''}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'meal' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">식사 상세 정보</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    식사량 *
                  </label>
                  <select
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">식사량을 선택하세요</option>
                    <option value="소량">소량 (평소보다 적게)</option>
                    <option value="적정량">적정량 (평소와 같게)</option>
                    <option value="과량">과량 (평소보다 많이)</option>
                    <option value="거부">거부 (먹지 않음)</option>
                  </select>
                </div>
              </div>
            )}

            {formData.type === 'poop' && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-800">배변 상세 정보</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">상태를 선택하세요</option>
                    <option value="정상">정상</option>
                    <option value="묽음">묽음</option>
                    <option value="딱딱함">딱딱함</option>
                    <option value="혈변">혈변</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            )}

            {formData.type === 'brush' && (
              <div className="space-y-4 p-4 bg-teal-50 rounded-lg">
                <h3 className="font-medium text-teal-800">양치 상세 정보</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    양치 상태
                  </label>
                  <select
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">상태를 선택하세요</option>
                    <option value="양치 완료">양치 완료</option>
                    <option value="일부만 완료">일부만 완료</option>
                    <option value="거부함">거부함</option>
                    <option value="치석 제거">치석 제거</option>
                  </select>
                </div>
              </div>
            )}

            {/* 날씨 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날씨
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(Object.keys(weatherEmojis) as Array<keyof typeof weatherEmojis>).map((weather) => (
                  <button
                    key={weather}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      weather: prev.weather === weather ? undefined : weather 
                    }))}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.weather === weather
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{weatherEmojis[weather]}</div>
                    <div className="text-xs">{weatherNames[weather]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                메모
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={`${routineNames[formData.type]}에 대한 특별한 사항이나 메모를 남겨보세요...`}
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  취소
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={isLoading}
              >
                {isLoading ? '기록 중...' : '기록하기'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* 바텀 네비게이션 공간 확보 */}
      <div className="h-20"></div>
    </div>
  );
} 