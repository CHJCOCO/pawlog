'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-1 transition-colors min-w-0 flex-1 ${
                isActive(item.href)
                  ? 'text-orange-500'
                  : 'text-gray-600 hover:text-orange-400'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <span className={`text-xs text-center leading-tight ${isActive(item.href) ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 