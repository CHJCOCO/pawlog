import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 배포를 위한 설정
  eslint: {
    ignoreDuringBuilds: true, // 빌드시 ESLint 에러 무시
  },
  typescript: {
    ignoreBuildErrors: true, // 빌드시 TypeScript 에러 무시
  },
  // 이미지 최적화 설정
  images: {
    unoptimized: true
  },
  webpack: (config, { dev, isServer }) => {
    // 개발 환경에서 webpack 캐시 설정 최적화
    if (dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        // Windows 환경에서의 파일 권한 문제 완화
        compression: false,
        store: 'pack',
        version: 'development',
        // 캐시 경로 안정성 향상
        maxMemoryGenerations: 1,
      };
    }
    return config;
  },
};

export default nextConfig;
