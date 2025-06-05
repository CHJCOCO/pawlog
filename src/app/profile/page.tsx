'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/BottomSheet';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Download, 
  Settings, 
  Heart,
  Shield,
  Info,
  Trash2,
  Edit3,
  ChevronRight,
  Database,
  FileText,
  LogOut,
  Camera,
  Lock,
  HelpCircle,
  BookOpen,
  Crown,
  Calendar,
  Stethoscope,
  Pill,
  CheckCircle,
  XCircle,
  Coffee,
  Star,
  Gift
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const { 
    dogs, 
    routineRecords, 
    healthRecords, 
    diaryEntries,
    user,
    updateUser,
    clearAllData,
    updateDog,
    deleteDog,
    logout
  } = useAppStore();
  
  // 알림 설정 상태
  const [notifications, setNotifications] = useState({
    vaccination: true,
    medication: false,
    checkup: true,
  });

  // 반려견 프로필 편집 모달
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedDog, setSelectedDog] = useState<typeof dogs[0] | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    birthDate: '',
    weight: '',
    photo: ''
  });

  // 클라이언트 상태 및 랜덤 일수
  const [isClient, setIsClient] = useState(false);
  const [happyDays, setHappyDays] = useState(0);

  // 클라이언트 마운트 시 랜덤 일수 설정
  useEffect(() => {
    setIsClient(true);
    setHappyDays(Math.floor(Math.random() * 365 + 1));
  }, []);

  // 통계 계산
  const stats = {
    totalDogs: dogs.length,
    totalRecords: routineRecords.length + healthRecords.length + diaryEntries.length,
    thisMonth: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  };

  // 반려견 프로필 편집 시작
  const handleEditProfile = (dog: typeof dogs[0]) => {
    setSelectedDog(dog);
    setEditForm({
      name: dog.name,
      breed: dog.breed,
      birthDate: new Date(dog.birthDate).toISOString().split('T')[0],
      weight: dog.weight.toString(),
      photo: dog.photo || ''
    });
    setIsEditProfileOpen(true);
  };

  // 프로필 저장
  const handleSaveProfile = () => {
    if (!selectedDog) return;

    const updatedDog = {
      ...selectedDog,
      name: editForm.name.trim(),
      breed: editForm.breed.trim(),
      birthDate: new Date(editForm.birthDate).toISOString(),
      weight: parseFloat(editForm.weight) || 0,
      photo: editForm.photo.trim() || undefined
    };

    updateDog(selectedDog.id, updatedDog);
    setIsEditProfileOpen(false);
    setSelectedDog(null);
  };

  // 사진 업로드 시뮬레이션
  const handlePhotoUpload = () => {
    // 실제로는 파일 선택기를 열고 이미지 업로드
    const dummyPhoto = `https://picsum.photos/200/200?random=${Date.now()}`;
    setEditForm(prev => ({ ...prev, photo: dummyPhoto }));
  };

  // 알림 토글
  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // 전체 알림 토글 (마스터 스위치)
  const toggleAllNotifications = () => {
    const hasAnyEnabled = notifications.vaccination || notifications.medication || notifications.checkup;
    const newState = !hasAnyEnabled;
    setNotifications({
      vaccination: newState,
      medication: newState,
      checkup: newState,
    });
  };

  // 전체 알림 상태 확인
  const hasAnyNotificationEnabled = notifications.vaccination || notifications.medication || notifications.checkup;

  // 프리미엄 기능 안내
  const showPremiumAlert = () => {
    alert('🔒 프리미엄 기능입니다!\n\n프리미엄 구독 시 이용 가능:\n• PDF/CSV 데이터 내보내기\n• 클라우드 백업\n• 무제한 사진 저장\n• 고급 분석 리포트');
  };

  // 로그아웃
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await logout();
      router.push('/onboarding');
    }
  };

  // 반려견 삭제
  const handleDeleteDog = (dog: typeof dogs[0]) => {
    if (confirm(`⚠️ ${dog.name}의 모든 정보를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 관련된 모든 기록(루틴, 건강, 일기)도 함께 삭제됩니다.`)) {
      if (prompt(`확인을 위해 "${dog.name}"을 정확히 입력해주세요.`) === dog.name) {
        deleteDog(dog.id);
        alert(`${dog.name}의 모든 정보가 삭제되었습니다.`);
      }
    }
  };

  // 데이터 삭제
  const handleDeleteAllData = () => {
    if (confirm('⚠️ 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      if (prompt('확인을 위해 "삭제"라고 입력해주세요.') === '삭제') {
        clearAllData();
        alert('모든 데이터가 삭제되었습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 pb-20">
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚙️</div>
            <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          </div>
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* 사용자 프로필 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6 border border-pink-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900">{user?.name || '반려인'}</h2>
            <p className="text-gray-600">{user?.email || 'pawlog_user@gmail.com'}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-500">
                  {isClient ? `행복한 반려 생활 ${happyDays}일차` : '행복한 반려 생활'}
                </span>
              </div>
            </div>
          </div>

          {/* 간단한 통계 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{stats.totalDogs}</div>
              <div className="text-xs text-gray-600">우리 가족</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.totalRecords}</div>
              <div className="text-xs text-gray-600">총 기록</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-pink-600">{diaryEntries.length}</div>
              <div className="text-xs text-gray-600">추억 일기</div>
            </div>
          </div>
        </div>

        {/* 🐶 반려견 정보 수정 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6 border border-orange-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🐶 반려견 정보
          </h3>
          
          <div className="space-y-3">
            {dogs.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🐕</div>
                <p className="text-gray-600 mb-3">아직 등록된 반려견이 없어요</p>
                <button
                  onClick={() => router.push('/dogs/add?first=true')}
                  className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  첫 가족 등록하기
                </button>
              </div>
            ) : (
              dogs.map((dog) => (
                <div key={dog.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
                  {dog.photo ? (
                    <img 
                      src={dog.photo} 
                      alt={dog.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center text-xl border-2 border-orange-200">
                      🐕
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{dog.name}</p>
                    <p className="text-sm text-gray-600">{dog.breed} • {dog.weight}kg</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProfile(dog)}
                      className="bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
                      title="프로필 수정"
                    >
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteDog(dog)}
                      className="bg-red-50/80 hover:bg-red-100 p-2 rounded-full shadow-sm transition-colors"
                      title="반려견 삭제"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {dogs.length > 0 && (
              <button
                onClick={() => router.push('/dogs/add')}
                className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-orange-300 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-colors"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  ➕
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-700">새 가족 추가</p>
                  <p className="text-sm text-gray-500">또 다른 반려견 등록하기</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* 🩺 건강 관리 알림 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🩺 건강 관리 알림
          </h3>
          
          <div className="space-y-4">
            {/* 통합 건강 알림 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔔</div>
                <div>
                  <p className="font-medium text-gray-900">건강 관리 알림</p>
                  <p className="text-sm text-gray-600">예방접종, 투약, 건강검진 리마인더</p>
                </div>
              </div>
              <button
                onClick={toggleAllNotifications}
                className={`text-2xl transition-transform ${hasAnyNotificationEnabled ? 'scale-110' : 'scale-100'}`}
              >
                {hasAnyNotificationEnabled ? '🐾' : '🔕'}
              </button>
            </div>

            {/* 세부 알림 설정 */}
            <div className="pl-4 space-y-3">
              <button
                onClick={() => toggleNotification('vaccination')}
                className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-blue-25 to-indigo-25 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">💉</span>
                  <span className="text-sm text-gray-700">예방접종 일정</span>
                </div>
                <div className={`text-xs font-medium ${notifications.vaccination ? 'text-blue-600' : 'text-gray-400'}`}>
                  {notifications.vaccination ? 'ON' : 'OFF'}
                </div>
              </button>
              
              <button
                onClick={() => toggleNotification('medication')}
                className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-green-25 to-emerald-25 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">💊</span>
                  <span className="text-sm text-gray-700">투약 일정</span>
                </div>
                <div className={`text-xs font-medium ${notifications.medication ? 'text-green-600' : 'text-gray-400'}`}>
                  {notifications.medication ? 'ON' : 'OFF'}
                </div>
              </button>
              
              <button
                onClick={() => toggleNotification('checkup')}
                className="w-full flex items-center justify-between p-2 bg-gradient-to-r from-purple-25 to-pink-25 rounded-xl hover:from-purple-50 hover:to-pink-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏥</span>
                  <span className="text-sm text-gray-700">건강검진 일정</span>
                </div>
                <div className={`text-xs font-medium ${notifications.checkup ? 'text-purple-600' : 'text-gray-400'}`}>
                  {notifications.checkup ? 'ON' : 'OFF'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 🧾 데이터 백업 (프리미엄) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6 border border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            🧾 데이터 백업
            <Crown className="w-4 h-4 text-purple-500" />
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={showPremiumAlert}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">PDF로 내보내기</p>
                  <Lock className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-sm text-gray-600">예쁜 형태로 정리된 리포트</p>
              </div>
            </button>

            <button
              onClick={showPremiumAlert}
              className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 hover:from-indigo-100 hover:to-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">CSV로 내보내기</p>
                  <Lock className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-sm text-gray-600">스프레드시트로 분석 가능</p>
              </div>
            </button>

            <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">프리미엄에서 제공돼요</span>
              </div>
              <p className="text-xs text-orange-600">클라우드 백업, 무제한 사진 저장 등 더 많은 기능!</p>
            </div>
          </div>
        </div>

        {/* 📖 사용 가이드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 mb-6 border border-green-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📖 사용 가이드
          </h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">FAQ 보기</p>
                <p className="text-sm text-gray-600">자주 묻는 질문들</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl hover:from-blue-100 hover:to-cyan-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">앱 사용법 알아보기</p>
                <p className="text-sm text-gray-600">처음이신가요? 친절한 가이드</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* 👤 계정 설정 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-red-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            👤 계정 설정
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">계정 이메일</span>
              </div>
              <p className="text-gray-900">{user?.email || 'pawlog_user@gmail.com'}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl hover:from-gray-100 hover:to-slate-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <LogOut className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">로그아웃</p>
                <p className="text-sm text-gray-600">계정에서 안전하게 로그아웃</p>
              </div>
            </button>

            <button
              onClick={handleDeleteAllData}
              className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl hover:from-red-100 hover:to-pink-100 transition-colors border border-red-200"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-red-900">모든 데이터 삭제</p>
                <p className="text-sm text-red-600">복구할 수 없으니 신중히 선택하세요</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* 반려견 프로필 편집 바텀시트 */}
      <BottomSheet isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)}>
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex-shrink-0 px-6 pt-2 pb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="text-2xl">🐕</div>
              프로필 수정
            </h3>
          </div>
          
          {/* 스크롤 가능한 폼 영역 */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-8">
              {/* 사진 */}
              <div className="text-center">
                {editForm.photo ? (
                  <img 
                    src={editForm.photo} 
                    alt="프로필 사진"
                    className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-orange-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full flex items-center justify-center text-4xl mx-auto border-4 border-orange-200">
                    🐕
                  </div>
                )}
                <button
                  onClick={handlePhotoUpload}
                  className="mt-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 mx-auto"
                >
                  <Camera className="w-4 h-4" />
                  사진 변경
                </button>
              </div>

              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="우리 아이 이름"
                />
              </div>

              {/* 품종 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">품종</label>
                <input
                  type="text"
                  value={editForm.breed}
                  onChange={(e) => setEditForm(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="말티즈, 골든리트리버 등"
                />
              </div>

              {/* 생일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">생일</label>
                <input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* 체중 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.weight}
                  onChange={(e) => setEditForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  placeholder="3.5"
                />
              </div>

              {/* 키보드 대응 여백 */}
              <div className="h-16 md:h-4"></div>
            </div>
          </div>

          {/* 고정된 버튼 영역 */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 pt-6 pb-8 shadow-lg" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 py-3 rounded-2xl"
              >
                취소
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={!editForm.name.trim()}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                저장하기
              </Button>
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* 모달이 열렸을 때는 하단 네비게이션 숨김 */}
      {!isEditProfileOpen && <BottomNavigation />}
    </div>
  );
} 