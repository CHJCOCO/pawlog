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
  }
};

export default nextConfig;
