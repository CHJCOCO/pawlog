'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { DiaryFormData, MoodType } from '@/lib/types';
import { moodEmojis, moodNames, formatDate, fileToBase64, resizeImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function AddDiaryPage() {
  const router = useRouter();
  const { addDiaryEntry, dogs } = useAppStore();
  
  const [formData, setFormData] = useState<DiaryFormData>({
    dogId: '',
    date: formatDate(new Date()),
    title: '',
    content: '',
    photos: [],
    mood: 'happy',
    weather: undefined,
    tags: [],
    isPublic: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    // 반려견이 한 마리뿐이면 자동으로 선택
    if (dogs.length === 1) {
      setFormData(prev => ({ ...prev, dogId: dogs[0].id }));
    }
  }, [dogs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsLoading(true);
      const newPhotos: string[] = [];
      
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const resizedBase64 = await resizeImage(base64, 800, 600);
        newPhotos.push(resizedBase64);
      }
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    } catch (error) {
      console.error('사진 업로드 중 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dogId) {
      alert('반려견을 선택해주세요.');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('일기 내용을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      addDiaryEntry(formData);
      router.push('/diary');
    } catch (error) {
      console.error('일기 작성 중 오류:', error);
      alert('일기 작성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDog = dogs.find(dog => dog.id === formData.dogId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/diary">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="text-2xl">📷</div>
            <h1 className="text-xl font-bold text-gray-900">일기 쓰기</h1>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
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
                  <span>{selectedDog.name}와의 소중한 순간</span>
                </div>
              )}
            </div>

            {/* 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜 *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* 기분 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘 기분은 어떠셨나요? *
              </label>
              <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                {(Object.keys(moodEmojis) as MoodType[]).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood }))}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.mood === mood
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{moodEmojis[mood]}</div>
                    <div className="text-xs">{moodNames[mood]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 사진 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진
              </label>
              <div className="space-y-3">
                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`사진 ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handlePhotoRemove(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">사진을 추가해보세요</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoAdd}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 (선택사항)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                placeholder="오늘의 제목을 입력해보세요"
              />
            </div>

            {/* 일기 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일기 내용 *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-gray-900"
                placeholder="오늘 반려견과 함께한 특별한 순간을 자유롭게 기록해보세요..."
                required
              />
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그
              </label>
              <div className="space-y-2">
                {(formData.tags && formData.tags.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="hover:text-pink-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    placeholder="태그를 입력하세요 (예: 산책, 놀이, 간식)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTagAdd}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 공개 설정 - 테스트용으로 더 눈에 띄게 */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <label className="block text-lg font-bold text-red-600 mb-3">
                🔥 공개 설정 (테스트) 🔥
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-blue-100 border-2 border-blue-500 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-6 h-6 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-900">🌍 커뮤니티에 공개</div>
                    <div className="text-base text-gray-700">
                      다른 반려동물 가족들과 소중한 순간을 공유해보세요
                    </div>
                  </div>
                  <div className="text-4xl">
                    {formData.isPublic ? '🌍' : '🔒'}
                  </div>
                </label>
                
                {formData.isPublic && (
                  <div className="bg-green-100 border-2 border-green-500 p-4 rounded">
                    <div className="text-lg text-green-800">
                      <strong>✅ 공개 일기 안내:</strong> 커뮤니티에 공개된 일기는 다른 사용자들이 볼 수 있으며, 좋아요와 댓글을 받을 수 있습니다.
                    </div>
                  </div>
                )}
              </div>
              
              {/* 디버깅용 정보 */}
              <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                <strong>디버그:</strong> isPublic = {String(formData.isPublic)}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-3 pt-4">
              <Link href="/diary" className="flex-1">
                <Button variant="outline" className="w-full" disabled={isLoading}>
                  취소
                </Button>
              </Link>
              <Button 
                type="submit" 
                className="flex-1 bg-pink-600 hover:bg-pink-700" 
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '일기 저장'}
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