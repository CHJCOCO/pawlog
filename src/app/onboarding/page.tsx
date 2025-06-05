'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import { Mail, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { updateUser, initializeUser } = useAppStore();

  // 이미 로그인된 사용자는 홈으로 리디렉션 (단, 상태가 준비된 후에만)
  useEffect(() => {
    // 약간의 지연을 두어 무한 리디렉션 방지
    const timer = setTimeout(() => {
      const isAuthenticated = localStorage.getItem('pawlog_authenticated');
      if (isAuthenticated) {
        console.log('✅ 이미 로그인된 사용자입니다. 홈으로 이동합니다.');
        router.push('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 여기서는 실제 인증 로직 대신 임시로 성공 처리
    setTimeout(async () => {
      try {
        // 사용자 정보 저장
        await initializeUser(
          formData.email,
          isLogin ? formData.email.split('@')[0] : formData.name
        );
        
        // 로그인 완료 표시
        localStorage.setItem('pawlog_authenticated', 'true');
        
        // 홈페이지로 이동 (홈에서 반려견 여부를 체크하여 적절한 페이지로 리디렉션)
        router.push('/');
      } catch (error) {
        console.error('User initialization failed:', error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleSocialLogin = async (provider: string) => {
    // 실제로는 소셜 로그인 로직 구현
    console.log(`${provider} 로그인`);
    
    try {
      // 임시로 성공 처리
      await initializeUser(
        `user@${provider.toLowerCase()}.com`,
        `${provider} 사용자`
      );
      
      localStorage.setItem('pawlog_authenticated', 'true');
      router.push('/');
    } catch (error) {
      console.error('Social login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 & 환영 메시지 */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🐾</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PawLog
          </h1>
          <p className="text-lg text-gray-600">
            반려견과의 소중한 순간을 기록해요
          </p>
        </div>

        {/* 로그인/회원가입 폼 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="flex rounded-2xl bg-gray-100 p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900"
                  placeholder="이름을 입력하세요"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-400 hover:from-orange-500 hover:to-pink-500 text-white text-lg py-4 rounded-2xl shadow-lg disabled:opacity-50"
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </Button>
          </form>
        </div>

        {/* 소셜 로그인 */}
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <p className="text-center text-gray-600 mb-4">또는 간편하게 시작하기</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              Google로 시작하기
            </button>
            
            <button
              onClick={() => handleSocialLogin('Kakao')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 rounded-2xl transition-colors"
            >
              <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                K
              </div>
              카카오로 시작하기
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          가입하시면 <span className="text-orange-600">이용약관</span> 및 <span className="text-orange-600">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
} 