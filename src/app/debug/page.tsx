'use client';

import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { user, dogs, diaryEntries, initializeUser } = useAppStore();
  const [storageData, setStorageData] = useState<any>(null);

  useEffect(() => {
    // localStorage 데이터 확인
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('pawlog-storage');
      if (data) {
        try {
          setStorageData(JSON.parse(data));
        } catch (e) {
          console.error('localStorage 파싱 오류:', e);
        }
      }
    }
  }, []);

  const handleInitUser = () => {
    initializeUser('test@example.com', '테스트유저');
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">🔍 디버그 페이지</h1>
        
        {/* 사용자 정보 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">👤 사용자 정보</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Nickname:</strong> {user.nickname}</p>
              <p><strong>생성일:</strong> {new Date(user.createdAt).toLocaleString()}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-3">사용자가 없습니다</p>
              <button 
                onClick={handleInitUser}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                테스트 사용자 생성
              </button>
            </div>
          )}
        </div>

        {/* 반려견 정보 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">🐕 반려견 정보</h2>
          {dogs.length > 0 ? (
            <div className="space-y-3">
              {dogs.map(dog => (
                <div key={dog.id} className="border-l-4 border-blue-500 pl-4">
                  <p><strong>{dog.name}</strong> ({dog.breed})</p>
                  <p className="text-sm text-gray-600">생년월일: {new Date(dog.birthDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">등록된 반려견이 없습니다</p>
          )}
        </div>

        {/* 일기 정보 - isPublic 필드 확인 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">📔 일기 정보 (isPublic 필드 확인)</h2>
          {diaryEntries.length > 0 ? (
            <div className="space-y-3">
              {diaryEntries.map(entry => (
                <div key={entry.id} className="border rounded p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{entry.title || '제목 없음'}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.isPublic 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.isPublic ? '🌍 공개' : '🔒 비공개'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{entry.content.substring(0, 100)}...</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>작성자 ID:</strong> {entry.userId || '없음'}</p>
                    <p><strong>닉네임:</strong> {entry.nickname || '없음'}</p>
                    <p><strong>생성일:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
                    <p><strong>isPublic:</strong> {String(entry.isPublic)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">작성된 일기가 없습니다</p>
          )}
        </div>

        {/* localStorage 원본 데이터 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">💾 localStorage 원본 데이터</h2>
          {storageData ? (
            <div className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
              <pre className="text-xs">
                {JSON.stringify(storageData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">localStorage 데이터가 없습니다</p>
          )}
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h2 className="text-lg font-semibold mb-3">🔧 컨트롤</h2>
          <div className="space-x-3">
            <button 
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              새로고침
            </button>
            <button 
              onClick={clearStorage}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              ⚠️ 모든 데이터 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 