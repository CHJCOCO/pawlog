'use client';

import { useState, useEffect } from 'react';
import { useCommunityStore } from '@/lib/store';
import { moodEmojis, moodNames, formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import InstagramCard from '@/components/ui/InstagramCard';
import { 
  Heart, 
  MessageCircle, 
  Send, 
  MoreHorizontal,
  MapPin,
  Calendar,
  User,
  Globe,
  Lock,
  Camera,
  Plus
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
      <div className="min-h-screen instagram-bg">
        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="glass-effect rounded-3xl p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
                  </div>
                </div>
                <div className="aspect-square bg-gray-300 rounded-2xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (publicFeed.length === 0) {
    return (
      <div className="min-h-screen instagram-bg">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* 헤더 */}
          <div className="glass-effect rounded-3xl p-6 mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
              <Camera className="w-7 h-7 text-soft-pink-500" />
              커뮤니티 피드
            </h1>
            <p className="text-gray-600 mt-2 font-light">
              펫 가족들의 소중한 순간들을 함께 나누어보세요 ✨
            </p>
          </div>

          {/* 빈 상태 */}
          <div className="glass-effect rounded-3xl p-8 text-center">
            <div className="text-8xl mb-6 instagram-float">🌸</div>
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">
              아직 공개된 일기가 없어요
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              다른 펫 가족들이 소중한 순간을<br />
              공유할 때까지 조금만 기다려주세요!
            </p>
            <div className="flex justify-center">
              <Button className="bg-gradient-to-r from-soft-pink-400 to-peach-400 hover:from-soft-pink-500 hover:to-peach-500 text-white px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                첫 번째 일기 공유하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen instagram-bg pb-20">
      {/* 헤더 */}
      <div className="sticky top-0 glass-effect border-b border-white/20 z-10">
        <div className="max-w-md mx-auto px-6 py-5">
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <Camera className="w-7 h-7 text-soft-pink-500" />
            커뮤니티 피드
          </h1>
          <p className="text-gray-600 mt-1 font-light">
            펫 가족들의 소중한 순간들을 함께 나누어보세요 ✨
          </p>
        </div>
      </div>

      {/* 피드 리스트 */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {publicFeed.map((diary) => (
          <InstagramCard
            key={diary.id}
            diary={diary}
            dogName={diary.dogName}
            userName={diary.nickname}
            onLike={handleLike}
            onComment={handleCommentToggle}
            isLiked={diary.isLikedByUser}
            likeCount={diary.likesCount}
            commentCount={diary.commentsCount}
            showInteractions={true}
          />
        ))}
      </div>

      {/* 댓글 섹션 */}
      {selectedDiaryId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
          <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg">댓글</h3>
              <button 
                onClick={() => setSelectedDiaryId(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* 댓글 목록 */}
            {comments[selectedDiaryId]?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-soft-pink-400 to-peach-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {comment.nickname.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="font-medium text-sm text-gray-900 mb-1">
                      {comment.nickname}
                    </div>
                    <p className="text-gray-700 text-sm">{comment.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-4">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))}

            {/* 댓글 입력 */}
            <div className="flex space-x-3 pt-4 border-t border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-soft-pink-400 to-peach-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {currentUser?.nickname.charAt(0)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full p-3 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-soft-pink-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleComment(selectedDiaryId)}
                    disabled={!commentInput.trim()}
                    className="bg-gradient-to-r from-soft-pink-400 to-peach-400 hover:from-soft-pink-500 hover:to-peach-500 text-white px-6 py-2 rounded-full text-sm disabled:opacity-50 transition-all"
                  >
                    댓글 달기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 