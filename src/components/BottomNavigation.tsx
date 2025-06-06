'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAppStore();

  const navItems = [
    {
      href: '/',
      icon: '🏠',
      label: '홈',
    },
    {
      href: '/records',
      icon: '📊',
      label: '루틴',
    },
    {
      href: '/health',
      icon: '🩺',
      label: '건강',
    },
    {
      href: '/diary',
      icon: '📔',
      label: '일기',
    },
    {
      href: '/community',
      icon: '🌍',
      label: '커뮤니티',
    },
    {
      href: '/profile',
      icon: '👤',
      label: '마이',
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/20 px-3 py-3 z-50 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-2 transition-all duration-300 min-w-0 flex-1 rounded-2xl ${
                isActive(item.href)
                  ? 'text-soft-pink-600 bg-soft-pink-50 scale-105'
                  : 'text-gray-600 hover:text-soft-pink-500 hover:bg-soft-pink-50/50 hover:scale-105'
              }`}
            >
              {item.href === '/profile' ? (
                // 마이 페이지는 프로필 사진 표시
                <div className={`w-6 h-6 transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : ''}`}>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt="프로필"
                      className={`w-6 h-6 rounded-full object-cover ${
                        isActive(item.href) 
                          ? 'ring-2 ring-soft-pink-500 ring-offset-1' 
                          : 'ring-1 ring-gray-300'
                      }`}
                    />
                  ) : (
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-soft-pink-400 to-peach-400 flex items-center justify-center text-white text-xs font-medium ${
                      isActive(item.href) 
                        ? 'ring-2 ring-soft-pink-500 ring-offset-1' 
                        : 'ring-1 ring-gray-300'
                    }`}>
                      {user?.name?.charAt(0) || user?.nickname?.charAt(0) || '👤'}
                    </div>
                  )}
                </div>
              ) : (
                // 다른 탭들은 기존 아이콘 사용
                <div className={`text-xl transition-transform duration-200 ${isActive(item.href) ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
              )}
              <span className={`text-xs text-center leading-tight font-light ${isActive(item.href) ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 