const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/quizzes',
        destination: '/assessments',
        permanent: true,
      },
      {
        source: '/quizzes/:path*',
        destination: '/assessments',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
