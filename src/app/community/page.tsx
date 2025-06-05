'use client';

import { useEffect } from 'react';
import { useCommunityStore, useAppStore } from '@/lib/store';
import CommunityFeed from '@/components/CommunityFeed';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const { setCurrentUser } = useCommunityStore();

  useEffect(() => {
    // 현재 사용자 정보를 커뮤니티 스토어에 설정
    if (user) {
      setCurrentUser({
        id: user.id,
        nickname: user.nickname
      });
    }
  }, [user, setCurrentUser]);

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                🌍 펫로그 커뮤니티
              </h1>
              <p className="text-sm text-gray-600">
                전 세계 반려동물 가족들과 소통해보세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 커뮤니티 피드 */}
      <CommunityFeed />
    </div>
  );
} 