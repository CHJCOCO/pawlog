import React from 'react';
import { DiaryEntry } from '@/lib/types';
import { moodEmojis, formatRelativeTime } from '@/lib/utils';

interface InstagramGridProps {
  diaries: DiaryEntry[];
  onDiaryClick?: (diary: DiaryEntry) => void;
  columns?: 2 | 3;
}

export default function InstagramGrid({ 
  diaries, 
  onDiaryClick, 
  columns = 3 
}: InstagramGridProps) {
  if (diaries.length === 0) {
    return (
      <div className="glass-effect rounded-3xl p-8 text-center">
        <div className="text-6xl mb-4 instagram-float">📸</div>
        <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">
          아직 기록된 순간이 없어요
        </h3>
        <p className="text-gray-600 text-sm font-light">
          첫 번째 소중한 순간을 기록해보세요!
        </p>
      </div>
    );
  }

  const getImageOrGradient = (diary: DiaryEntry) => {
    if (diary.photos && diary.photos.length > 0) {
      return {
        type: 'image',
        src: diary.photos[0]
      };
    }
    
    // 감정에 따른 그라데이션 색상
    const moodColors: Record<string, string> = {
      'very-happy': 'from-yellow-300 to-orange-300',
      'happy': 'from-pink-300 to-rose-300',
      'excited': 'from-purple-300 to-pink-300',
      'normal': 'from-green-300 to-emerald-300',
      'calm': 'from-blue-300 to-cyan-300',
      'tired': 'from-gray-300 to-slate-300',
      'sad': 'from-blue-300 to-gray-300',
      'sick': 'from-red-300 to-pink-300',
      'anxious': 'from-indigo-300 to-purple-300'
    };

    return {
      type: 'gradient',
      gradient: `bg-gradient-to-br ${moodColors[diary.mood] || 'from-gray-300 to-gray-400'}`
    };
  };

  return (
    <div className={`instagram-grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
      {diaries.map((diary) => {
        const content = getImageOrGradient(diary);
        
        return (
          <div
            key={diary.id}
            onClick={() => onDiaryClick?.(diary)}
            className="aspect-square cursor-pointer group relative overflow-hidden rounded-2xl instagram-card"
          >
            {content.type === 'image' ? (
              <img
                src={content.src}
                alt={diary.title || "일기 사진"}
                className="w-full h-full object-cover image-hover-effect"
                loading="lazy"
              />
            ) : (
              <div className={`w-full h-full ${content.gradient} flex items-center justify-center`}>
                <div className="text-center">
                  <div className="text-3xl mb-1 instagram-float">
                    {moodEmojis[diary.mood]}
                  </div>
                </div>
              </div>
            )}
            
            {/* 오버레이 정보 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-3">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white">
                <p className="text-xs font-medium mb-1">{formatRelativeTime(diary.date)}</p>
                {diary.title && (
                  <p className="text-sm font-serif truncate">{diary.title}</p>
                )}
              </div>
            </div>

            {/* 특별한 순간 뱃지 */}
            {diary.specialMoment && (
              <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                ✨
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 