'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 맨 위로 스크롤
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      document.body.style.overflow = 'hidden';
      
      // 모달 내부도 맨 위로 스크롤
      setTimeout(() => {
        if (sheetRef.current) {
          const scrollableElement = sheetRef.current.querySelector('.overflow-y-auto');
          if (scrollableElement) {
            scrollableElement.scrollTop = 0;
          }
        }
      }, 100);

      // 키보드 이벤트 감지 (모바일에서 입력 필드 포커스 시 자동 스크롤)
      const handleInputFocus = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            // 입력 필드가 화면에 보이도록 스크롤
            target.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest' 
            });
          }, 300); // 키보드 애니메이션 대기
        }
      };

      document.addEventListener('focusin', handleInputFocus);
      
      return () => {
        document.removeEventListener('focusin', handleInputFocus);
      };
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end">
      {/* 반투명 배경 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 하단 시트 */}
      <div 
        ref={sheetRef}
        className={`
          relative w-full bg-white rounded-t-3xl shadow-2xl 
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          max-h-[85vh] flex flex-col
          max-w-md mx-auto
          min-h-[50vh]
        `}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center py-3 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* 헤더 */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* 컨텐츠 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
} 