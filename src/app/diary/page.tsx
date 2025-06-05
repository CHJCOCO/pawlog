'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { moodEmojis, moodNames, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import { 
  ArrowLeft, 
  Plus, 
  Heart, 
  Camera, 
  Upload, 
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Image,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DiaryPage() {
  const router = useRouter();
  const { diaryEntries, dogs, addDiaryEntry, deleteDiaryEntry } = useAppStore();

  // 새 일기 작성 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEntryDogId, setNewEntryDogId] = useState(dogs[0]?.id || '');
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryMood, setNewEntryMood] = useState<keyof typeof moodEmojis>('happy');
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryPhotos, setNewEntryPhotos] = useState<string[]>([]);
  const [newEntryIsPublic, setNewEntryIsPublic] = useState(false);

  // 최신순으로 정렬된 일기들
  const sortedEntries = diaryEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 감정별 카드 스타일
  const moodStyles = {
    happy: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
    sad: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
    excited: 'bg-gradient-to-br from-pink-50 to-red-50 border-pink-200',
    calm: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    tired: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
    playful: 'bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200',
    anxious: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200',
    sleepy: 'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200'
  };

  // 새 일기 추가 핸들러
  const handleAddEntry = () => {
    if (!newEntryContent.trim() || !newEntryDogId) return;

    const entryDate = new Date(newEntryDate);

    const newEntry = {
      dogId: newEntryDogId,
      date: entryDate.toISOString(),
      title: newEntryTitle.trim() || undefined,
      content: newEntryContent.trim(),
      mood: newEntryMood,
      photos: newEntryPhotos.length > 0 ? newEntryPhotos : [],
      tags: [],
      isPublic: newEntryIsPublic
    };

    addDiaryEntry(newEntry);
    
    // 모달 닫기 및 초기화
    setIsAddModalOpen(false);
    setNewEntryTitle('');
    setNewEntryContent('');
    setNewEntryPhotos([]);
    setNewEntryMood('happy');
    setNewEntryIsPublic(false);
    
    // 성공 피드백 (간단한 알림)
    // 실제로는 toast 라이브러리나 더 감성적인 애니메이션을 추가할 수 있음
  };

  // 일기 삭제 핸들러
  const handleDeleteEntry = (entryId: string) => {
    if (confirm('이 소중한 추억을 정말 삭제하시겠습니까?')) {
      deleteDiaryEntry(entryId);
    }
  };

  // 사진 업로드 핸들러 (실제로는 파일 업로드 로직 필요)
  const handlePhotoUpload = () => {
    // 실제 구현에서는 파일 선택기를 열고 이미지를 업로드하는 로직
    // 여기서는 더미 이미지 URL 추가
    const dummyImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    if (newEntryPhotos.length < 4) {
      setNewEntryPhotos([...newEntryPhotos, dummyImageUrl]);
    }
  };

  // 사진 제거 핸들러
  const handleRemovePhoto = (index: number) => {
    setNewEntryPhotos(newEntryPhotos.filter((_, i) => i !== index));
  };

  // 날짜별 그룹화
  const groupedEntries = sortedEntries.reduce((groups, entry) => {
    const dateKey = formatDate(new Date(entry.date));
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, typeof sortedEntries>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-pink-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-2xl">📷</div>
              <h1 className="text-xl font-bold text-gray-900">감성 사진첩</h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              추억 남기기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {sortedEntries.length === 0 ? (
          // 빈 상태
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 text-center border border-pink-200">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              첫 번째 추억을 남겨보세요
            </h3>
            <p className="text-gray-600 mb-6">
              반려견과의 소중한 순간을<br />
              사진과 글로 기록해보세요 💕
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto shadow-lg"
            >
              <Camera className="w-4 h-4" />
              첫 추억 남기기
            </button>
          </div>
        ) : (
          // 일기 타임라인
          <div className="space-y-6">
            {Object.entries(groupedEntries).map(([date, entries]) => (
              <div key={date} className="space-y-4">
                {/* 날짜 헤더 */}
                <div className="flex items-center gap-3 px-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <h2 className="text-lg font-bold text-gray-800">{date}</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent"></div>
                </div>

                {/* 그날의 일기들 */}
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const dog = dogs.find(d => d.id === entry.dogId);
                    const moodStyle = moodStyles[entry.mood as keyof typeof moodStyles] || moodStyles.happy;
                    
                    return (
                      <div key={entry.id} className={`${moodStyle} border-2 rounded-3xl shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]`}>
                        {/* 사진 영역 */}
                        {entry.photos.length > 0 && (
                          <div className="relative">
                            <div className="grid grid-cols-2 gap-1 max-h-64">
                              {entry.photos.slice(0, 4).map((photo, index) => (
                                <div key={index} className={`relative ${
                                  entry.photos.length === 1 ? 'col-span-2' : 
                                  entry.photos.length === 3 && index === 0 ? 'col-span-2' : ''
                                }`}>
                                  <img 
                                    src={photo} 
                                    alt={`추억 사진 ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                  {index === 3 && entry.photos.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                      <span className="text-white font-medium">+{entry.photos.length - 4}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* 사진 개수 표시 */}
                            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Image className="w-3 h-3" />
                              <span>{entry.photos.length}</span>
                            </div>
                          </div>
                        )}

                        {/* 내용 영역 */}
                        <div className="p-6">
                          {/* 헤더 정보 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl">{moodEmojis[entry.mood]}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{dog?.name}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-600">{moodNames[entry.mood]}</span>
                                {/* 공개 여부 표시 */}
                                <span className="text-sm text-gray-500">•</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  entry.isPublic 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {entry.isPublic ? '🌍 공개됨' : '🔒 나만 보기'}
                                </span>
                              </div>
                              {entry.title && (
                                <h3 className="font-bold text-gray-900 mt-1">{entry.title}</h3>
                              )}
                            </div>
                            
                            {/* 삭제 버튼 - 모든 일기에 표시 */}
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 p-2 rounded-full transition-colors flex-shrink-0"
                              title="일기 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* 내용 */}
                          <div className="bg-white/50 rounded-2xl p-4">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-gray-700 leading-relaxed">
                                {entry.content}
                              </p>
                            </div>
                          </div>

                          {/* 태그 */}
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {entry.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-white/70 text-gray-700 px-3 py-1 rounded-full border">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* 더 많은 추억을 위한 유도 메시지 */}
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-gray-600 mb-4">더 많은 소중한 순간들을<br />기록해보세요!</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-pink-400 to-orange-400 hover:from-pink-500 hover:to-orange-500 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 mx-auto shadow-lg"
              >
                <Heart className="w-4 h-4" />
                새 추억 만들기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 새 일기 작성 바텀 시트 */}
      <BottomSheet isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="text-2xl">📸</div>
            새로운 추억 남기기
          </h3>
          
          <div className="space-y-4">
            {/* 반려견 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                함께한 가족
              </label>
              <select
                value={newEntryDogId}
                onChange={(e) => setNewEntryDogId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              >
                {dogs.map((dog) => (
                  <option key={dog.id} value={dog.id}>
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 날짜 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                날짜
              </label>
              <input
                type="date"
                value={newEntryDate}
                onChange={(e) => setNewEntryDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 제목 (선택) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 (선택)
              </label>
              <input
                type="text"
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                placeholder="오늘의 특별한 순간"
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* 감정 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘의 기분
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(moodEmojis).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => setNewEntryMood(mood as keyof typeof moodEmojis)}
                    className={`p-3 rounded-2xl text-center transition-all ${
                      newEntryMood === mood 
                        ? 'bg-pink-100 border-2 border-pink-500 scale-110' 
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-2xl">{emoji}</div>
                    <div className="text-xs text-gray-600 mt-1">{moodNames[mood as keyof typeof moodNames]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 사진 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사진 (최대 4장)
              </label>
              <div className="space-y-3">
                {/* 업로드 버튼 */}
                {newEntryPhotos.length < 4 && (
                  <button
                    onClick={handlePhotoUpload}
                    className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-pink-400 hover:bg-pink-50 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">사진 추가하기</p>
                  </button>
                )}

                {/* 업로드된 사진들 */}
                {newEntryPhotos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {newEntryPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={photo} 
                          alt={`업로드된 사진 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘의 기록 *
              </label>
              <textarea
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                placeholder="오늘 우리 아이와 함께한 특별한 순간을 적어보세요..."
                rows={4}
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newEntryContent.length}/200자
              </p>
            </div>

            {/* 공개 설정 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공개 설정
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={newEntryIsPublic}
                  onChange={(e) => setNewEntryIsPublic(e.target.checked)}
                  className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">커뮤니티에 공개</div>
                  <div className="text-sm text-gray-600">
                    다른 반려동물 가족들과 소중한 순간을 공유해보세요
                  </div>
                </div>
                <div className="text-2xl">
                  {newEntryIsPublic ? '🌍' : '🔒'}
                </div>
              </label>
              
              {newEntryIsPublic && (
                <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                  <div className="text-sm text-blue-700">
                    <strong>공개 일기 안내:</strong> 커뮤니티에 공개된 일기는 다른 사용자들이 볼 수 있으며, 좋아요와 댓글을 받을 수 있습니다.
                  </div>
                </div>
              )}
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
              onClick={handleAddEntry}
              disabled={!newEntryContent.trim()}
              className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white py-3 rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              추억 저장하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
} 