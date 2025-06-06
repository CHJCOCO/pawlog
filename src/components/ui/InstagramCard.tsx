import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { DiaryEntry, MoodType } from '@/lib/types';
import { moodEmojis, moodNames, formatRelativeTime } from '@/lib/utils';

interface InstagramCardProps {
  diary: DiaryEntry;
  dogName: string;
  userName?: string;
  onLike?: (diaryId: string) => void;
  onComment?: (diaryId: string) => void;
  onShare?: (diaryId: string) => void;
  isLiked?: boolean;
  likeCount?: number;
  commentCount?: number;
  showInteractions?: boolean;
}

export default function InstagramCard({
  diary,
  dogName,
  userName = "펫 가족",
  onLike,
  onComment,
  onShare,
  isLiked = false,
  likeCount = 0,
  commentCount = 0,
  showInteractions = true
}: InstagramCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likeCount);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
    onLike?.(diary.id);
  };

  const handleComment = () => {
    onComment?.(diary.id);
  };

  const handleShare = () => {
    onShare?.(diary.id);
  };

  // 가상의 이미지 URL 생성 (실제로는 diary.photos 사용)
  const getImageUrl = () => {
    if (diary.photos && diary.photos.length > 0) {
      return diary.photos[0];
    }
    // 기본 이미지: 감정에 따른 그라데이션 색상
    const moodColors: Record<MoodType, string> = {
      'very-happy': 'from-yellow-200 to-orange-200',
      'happy': 'from-pink-200 to-rose-200',
      'excited': 'from-purple-200 to-pink-200',
      'normal': 'from-green-200 to-emerald-200',
      'calm': 'from-blue-200 to-cyan-200',
      'tired': 'from-gray-200 to-slate-200',
      'sad': 'from-blue-200 to-gray-200',
      'sick': 'from-red-200 to-pink-200',
      'anxious': 'from-indigo-200 to-purple-200'
    };
    return `bg-gradient-to-br ${moodColors[diary.mood] || 'from-gray-200 to-gray-300'}`;
  };

  return (
    <div className="instagram-card bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden max-w-md mx-auto">
      {/* 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-soft-pink-400 to-peach-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {dogName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{dogName}</p>
            <p className="text-xs text-gray-500">{formatRelativeTime(diary.date)}</p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* 이미지 또는 색상 배경 */}
      <div className="relative aspect-square">
        {diary.photos && diary.photos.length > 0 ? (
          <img
            src={diary.photos[0]}
            alt={diary.title || "일기 사진"}
            className="w-full h-full object-cover image-hover-effect"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full ${getImageUrl()} flex items-center justify-center`}>
            <div className="text-center">
              <div className="text-6xl mb-2 instagram-float">
                {moodEmojis[diary.mood]}
              </div>
              <p className="text-gray-600 font-medium text-lg">
                {moodNames[diary.mood]}
              </p>
            </div>
          </div>
        )}
        
        {/* 특별한 순간 뱃지 */}
        {diary.specialMoment && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            ✨ 특별한 순간
          </div>
        )}
      </div>

      {/* 인터랙션 버튼 */}
      {showInteractions && (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`instagram-heart ${liked ? 'liked' : ''}`}
              >
                <Heart 
                  className={`w-6 h-6 ${liked ? 'fill-current text-red-500' : 'text-gray-700'}`}
                />
              </button>
              <button onClick={handleComment} className="text-gray-700 hover:text-gray-900 transition-colors">
                <MessageCircle className="w-6 h-6" />
              </button>
              <button onClick={handleShare} className="text-gray-700 hover:text-gray-900 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          {/* 좋아요 수 */}
          {likes > 0 && (
            <p className="text-sm font-medium text-gray-900">
              좋아요 {likes}개
            </p>
          )}
        </div>
      )}

      {/* 내용 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 제목 */}
        {diary.title && (
          <h3 className="font-serif font-medium text-gray-900 text-lg leading-relaxed">
            {diary.title}
          </h3>
        )}
        
        {/* 캡션 */}
        <div className="text-gray-700 text-sm leading-relaxed">
          <span className="font-medium text-gray-900">{dogName}</span>
          {" "}
          {diary.content}
        </div>

        {/* 마일스톤 */}
        {diary.milestone && (
          <div className="bg-gradient-to-r from-lavender-50 to-soft-pink-50 border border-lavender-200 rounded-2xl p-3 mt-3">
            <div className="flex items-center space-x-2 text-lavender-700">
              <span className="text-lg">🏆</span>
              <span className="font-medium text-sm">성장 기록: {diary.milestone}</span>
            </div>
          </div>
        )}

        {/* 태그 */}
        {diary.tags && diary.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {diary.tags.map((tag, index) => (
              <span key={index} className="text-xs text-lavender-600 hover:text-lavender-700 cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 댓글 보기 */}
        {showInteractions && commentCount > 0 && (
          <button 
            onClick={handleComment}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            댓글 {commentCount}개 모두 보기
          </button>
        )}
      </div>
    </div>
  );
} 