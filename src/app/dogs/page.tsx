'use client';

import { useAppStore } from '@/lib/store';
import { calculateAge, genderEmojis } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import Link from 'next/link';

export default function DogsPage() {
  const { dogs } = useAppStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="text-2xl">🐕</div>
              <h1 className="text-xl font-bold text-gray-900">내 반려견</h1>
            </div>
            <Link href="/dogs/add">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                반려견 추가
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {dogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              아직 등록된 반려견이 없어요
            </h3>
            <p className="text-gray-600 mb-6">
              첫 번째 반려견을 등록해보세요!
            </p>
            <Link href="/dogs/add">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                첫 반려견 등록하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <div key={dog.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* 반려견 사진 */}
                <div className="aspect-square relative">
                  {dog.photo ? (
                    <img 
                      src={dog.photo} 
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-6xl">🐕</div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <Link href="/profile">
                      <Button variant="secondary" size="sm" className="shadow-sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 반려견 정보 */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{dog.name}</h3>
                    <span className="text-lg">{genderEmojis[dog.gender]}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>견종</span>
                      <span className="font-medium text-gray-900">{dog.breed}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>나이</span>
                      <span className="font-medium text-gray-900">
                        {calculateAge(dog.birthDate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>체중</span>
                      <span className="font-medium text-gray-900">{dog.weight}kg</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>중성화</span>
                      <span className="font-medium text-gray-900">
                        {dog.isNeutered ? '완료' : '미완료'}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="mt-4 space-y-2">
                    <Link href={`/dogs/${dog.id}`} className="block">
                      <Button variant="outline" className="w-full">
                        상세 정보 보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 바텀 네비게이션 공간 확보 */}
      <div className="h-20"></div>
    </div>
  );
} 