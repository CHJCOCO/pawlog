'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { HealthFormData, HealthType } from '@/lib/types';
import { healthEmojis, healthNames, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, DollarSign, MapPin, FileText, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AddHealthPage() {
  const router = useRouter();
  const { addHealthRecord, dogs } = useAppStore();
  
  const [formData, setFormData] = useState<HealthFormData>({
    dogId: '',
    type: 'vaccination',
    title: '',
    description: '',
    date: formatDate(new Date()),
    nextDate: '',
    veterinarian: '',
    cost: undefined,
    notes: '',
    completed: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [enableReminder, setEnableReminder] = useState(false);

  useEffect(() => {
    // 반려견이 한 마리뿐이면 자동으로 선택
    if (dogs.length === 1) {
      setFormData(prev => ({ ...prev, dogId: dogs[0].id }));
    }
  }, [dogs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'cost') {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (newType: HealthType) => {
    setFormData(prev => ({ 
      ...prev, 
      type: newType,
      title: getDefaultTitle(newType),
      completed: newType !== 'vaccination' // 예방접종이 아니면 기본적으로 완료로 설정
    }));
  };

  const getDefaultTitle = (type: HealthType): string => {
    switch (type) {
      case 'vaccination':
        return '종합백신';
      case 'checkup':
        return '정기 건강검진';
      case 'medication':
        return '약물 치료';
      case 'grooming':
        return '미용';
      case 'surgery':
        return '수술';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dogId) {
      alert('반려견을 선택해주세요.');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    // 리마인더 설정 시 다음 예정일 필수
    if (enableReminder && !formData.nextDate) {
      alert('다음 예정일을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const submitData = {
        ...formData,
        nextDate: enableReminder ? formData.nextDate : '',
      };
      
      addHealthRecord(submitData);
      router.push('/health');
    } catch (error) {
      console.error('건강 기록 중 오류:', error);
      alert('건강 기록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDog = dogs.find(dog => dog.id === formData.dogId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/health">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-2xl">{healthEmojis[formData.type]}</div>
            <h1 className="text-xl font-bold text-gray-900">
              {healthNames[formData.type]} 기록
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
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
                  <span>{selectedDog.name}의 {healthNames[formData.type]} 기록</span>
                </div>
              )}
            </div>

            {/* 건강 타입 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                건강 관리 타입 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(Object.keys(healthEmojis) as HealthType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.type === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{healthEmojis[type]}</div>
                    <div className="text-sm font-medium">{healthNames[type]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 종합백신, 심장사상충 예방접종 등"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="상세 설명 (선택사항)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    날짜 *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    비용 (원)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost || ''}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  병원/수의사명
                </label>
                <input
                  type="text"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 사랑동물병원, 김수의사"
                />
              </div>
            </div>

            {/* 상태 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="completed"
                checked={formData.completed}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                완료됨 (체크 해제 시 예정된 일정으로 표시)
              </label>
            </div>

            {/* 리마인더 설정 */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="ml-2 text-sm font-medium text-purple-800">
                  <Bell className="w-4 h-4 inline mr-1" />
                  다음 예정일 리마인더 설정
                </label>
              </div>
              
              {enableReminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다음 예정일 *
                  </label>
                  <input
                    type="date"
                    name="nextDate"
                    value={formData.nextDate}
                    onChange={handleInputChange}
                    min={formData.date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={enableReminder}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    예: 연간 백신의 경우 1년 후 날짜를 설정하세요
                  </p>
                </div>
              )}
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                메모
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="특별한 사항이나 주의사항을 기록해보세요..."
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <Link href="/health" className="flex-1">
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  취소
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-purple-600 hover:bg-purple-700" 
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