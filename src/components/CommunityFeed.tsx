'use client';

import { useState, useEffect } from 'react';
import { useCommunityStore } from '@/lib/store';
import { moodEmojis, moodNames, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal,
  MapPin,
  Calendar,
  User,
  Globe,
  Lock
} from 'lucide-react';

export default function CommunityFeed() {
  const { 
    publicFeed, 
    comments, 
    currentUser, 
    toggleLike, 
    addComment, 
    addToPublicFeed,
    loadMockFeed,
    setLoading,
    isLoading 
  } = useCommunityStore();

  const [selectedDiaryId, setSelectedDiaryId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    // 목 데이터 로드
    setLoading(true);
    loadMockFeed();
    setTimeout(() => setLoading(false), 500); // 로딩 효과

    // 공개 일기 추가 이벤트 리스너
    const handleAddToPublicFeed = (event: CustomEvent) => {
      const { diary, dogName } = event.detail;
      addToPublicFeed(diary, dogName);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('addToPublicFeed', handleAddToPublicFeed as EventListener);
      
      return () => {
        window.removeEventListener('addToPublicFeed', handleAddToPublicFeed as EventListener);
      };
    }
  }, [loadMockFeed, setLoading, addToPublicFeed]);

  const handleLike = (diaryId: string) => {
    toggleLike(diaryId);
  };

  const handleComment = (diaryId: string) => {
    if (!commentInput.trim() || !currentUser) return;
    
    addComment(diaryId, commentInput.trim());
    setCommentInput('');
  };

  const handleCommentToggle = (diaryId: string) => {
    setSelectedDiaryId(selectedDiaryId === diaryId ? null : diaryId);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (publicFeed.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-6 text-center pt-20">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            아직 공개된 일기가 없어요
          </h3>
          <p className="text-gray-600 mb-6">
            다른 펫 가족들이 소중한 순간을<br />
            공유할 때까지 조금만 기다려주세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-500" />
            커뮤니티 피드
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            펫 가족들의 소중한 순간들을 함께 나누어보세요
          </p>
        </div>
      </div>

      {/* 피드 리스트 */}
      <div className="space-y-4 p-4">
        {publicFeed.map((diary) => (
          <div 
            key={diary.id} 
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* 작성자 정보 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{diary.nickname}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{diary.dogName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(diary.date)}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* 일기 내용 */}
            <div className="p-4">
              {/* 제목과 감정 */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{moodEmojis[diary.mood]}</div>
                <div className="flex-1">
                  {diary.title && (
                    <h3 className="font-bold text-gray-900">{diary.title}</h3>
                  )}
                  <div className="text-sm text-gray-600">{moodNames[diary.mood]}</div>
                </div>
                {diary.specialMoment && (
                  <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
                    ✨ 특별한 순간
                  </div>
                )}
              </div>

              {/* 내용 */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                <p className="text-gray-700 leading-relaxed">
                  {diary.content}
                </p>
              </div>

              {/* 마일스톤 */}
              {diary.milestone && (
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 text-pink-700">
                    <div className="text-lg">🏆</div>
                    <span className="font-medium">성장 기록: {diary.milestone}</span>
                  </div>
                </div>
              )}

              {/* 태그 */}
              {diary.tags && diary.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {diary.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(diary.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                      diary.isLikedByUser 
                        ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${diary.isLikedByUser ? 'fill-current' : ''}`} 
                    />
                    <span className="text-sm font-medium">{diary.likesCount}</span>
                  </button>
                  
                  <button
                    onClick={() => handleCommentToggle(diary.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{diary.commentsCount}</span>
                  </button>
                </div>
                
                <div className="text-xs text-gray-500">
                  {diary.gratitude && `"${diary.gratitude}"`}
                </div>
              </div>
            </div>

            {/* 댓글 섹션 */}
            {selectedDiaryId === diary.id && (
              <div className="border-t border-gray-100 bg-gray-50">
                {/* 기존 댓글들 */}
                {comments[diary.id] && comments[diary.id].length > 0 && (
                  <div className="px-4 py-3 space-y-3">
                    {comments[diary.id].map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {comment.nickname.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm text-gray-900">{comment.nickname}</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 댓글 입력 */}
                {currentUser && (
                  <div className="px-4 py-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(diary.id)}
                        placeholder="따뜻한 댓글을 남겨주세요..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
                      />
                      <button
                        onClick={() => handleComment(diary.id)}
                        disabled={!commentInput.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 하단 여백 */}
      <div className="h-20"></div>
    </div>
  );
} 