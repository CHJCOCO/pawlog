'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { DogFormData } from '@/lib/types';
import { fileToBase64, resizeImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Camera, Heart, ArrowLeft } from 'lucide-react';

// 동적 렌더링으로 설정
export const dynamic = 'force-dynamic';

export default function AddDogPage() {
  const router = useRouter();
  const { addDog, user } = useAppStore();
  
  // URL 파라미터로 첫 방문자인지 확인
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // 클라이언트에서만 searchParams 확인
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setIsFirstTime(urlParams.get('first') === 'true');
    }
    
    // 로그인 가드 - 로그인 안 된 사용자는 온보딩으로 리디렉션
    const isAuthenticated = localStorage.getItem('pawlog_authenticated');
    if (!isAuthenticated) {
      console.log('🔒 로그인이 필요한 페이지입니다. 온보딩 페이지로 이동합니다.');
      router.push('/onboarding');
      return;
    }
  }, [router]);
  
  const [formData, setFormData] = useState<DogFormData>({
    name: '',
    breed: '',
    birthDate: '',
    weight: 0,
    gender: 'male',
    isNeutered: false,
    photo: undefined,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'weight') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const base64 = await fileToBase64(file);
      const resizedBase64 = await resizeImage(base64, 400, 400);
      
      setFormData(prev => ({ ...prev, photo: resizedBase64 }));
      setPhotoPreview(resizedBase64);
    } catch (error) {
      console.error('사진 업로드 중 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (!formData.breed.trim()) {
      alert('견종을 입력해주세요.');
      return;
    }
    
    if (!formData.birthDate) {
      alert('생년월일을 선택해주세요.');
      return;
    }
    
    if (formData.weight <= 0) {
      alert('올바른 체중을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      addDog(formData);
      
      // 등록 완료 플래그 설정 (새로고침 시 리디렉션 방지)
      localStorage.setItem('pawlog_has_dogs', 'true');
      
      // 첫 방문자인 경우 특별한 메시지와 함께 홈으로
      if (isFirstTime) {
        localStorage.setItem('pawlog_first_dog_added', 'true');
        setTimeout(() => {
          alert(`🎉 ${formData.name}이(가) 우리 가족이 되었어요! 이제 PawLog와 함께 소중한 순간들을 기록해보세요.`);
        }, 500);
      }
      
      router.push('/');
    } catch (error) {
      console.error('반려견 등록 중 오류:', error);
      alert('반려견 등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          {isClient && !isFirstTime && (
            <button
              onClick={() => router.back()}
              className="absolute left-4 top-8 p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          <div className="text-7xl mb-4">🐕</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {!isClient ? '새로운 가족 등록' : 
             isFirstTime ? `안녕하세요, ${user?.name || ''}님! 👋` : '새로운 가족 등록'}
          </h1>
          <p className="text-lg text-gray-600">
            {!isClient ? '소중한 가족을 등록해보세요' :
             isFirstTime 
              ? '첫 번째 가족을 소개해주세요' 
              : '또 다른 소중한 가족을 등록해보세요'
            }
          </p>
        </div>

        {/* 등록 폼 */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 사진 업로드 */}
            <div className="text-center">
              <div className="relative inline-block">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="미리보기"
                    className="w-32 h-32 rounded-full object-cover border-4 border-orange-200 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 border-4 border-orange-200 flex items-center justify-center shadow-lg">
                    <Camera className="w-10 h-10 text-orange-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-orange-400 to-pink-400 text-white p-3 rounded-full cursor-pointer hover:from-orange-500 hover:to-pink-500 transition-all shadow-lg">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-3">사진을 선택해주세요 📸</p>
            </div>

            {/* 기본 정보 */}
            <div className="space-y-5">
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  이름 ✨
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-lg text-gray-900"
                  placeholder="어떤 이름인가요?"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  견종 🐕
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-lg text-gray-900"
                  placeholder="예: 골든 리트리버, 믹스견 등"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    생일 🎂
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-lg text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    체중 ⚖️
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-12 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-lg text-gray-900"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      required
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">kg</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    성별 👦👧
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-lg text-gray-900"
                  >
                    <option value="male">남아</option>
                    <option value="female">여아</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-3">
                    중성화 🏥
                  </label>
                  <div className="flex items-center h-12 px-4 border-2 border-orange-200 rounded-2xl">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isNeutered"
                        checked={formData.isNeutered}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-orange-400 rounded focus:ring-orange-400"
                      />
                      <span className="ml-2 text-gray-700">완료</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 등록 버튼 */}
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white text-xl py-4 rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Heart className="w-6 h-6" />
                {isLoading ? '등록 중...' : (!isClient ? '가족 추가하기' : isFirstTime ? '우리 가족 되기 💕' : '가족 추가하기')}
              </Button>
            </div>

            {isClient && isFirstTime && (
              <div className="text-center mt-6 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
                <p className="text-sm text-gray-600">
                  등록 후 홈 화면에서 <br />
                  <span className="font-bold text-orange-600">루틴 기록</span>, <span className="font-bold text-green-600">건강 관리</span>, <span className="font-bold text-pink-600">감성 일기</span>를 <br />
                  시작할 수 있어요! 🎉
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 