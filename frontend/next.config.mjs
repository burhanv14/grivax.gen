const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// outputFileTracingExcludes prevents a known Next.js 14 stack overflow
// (RangeError: Maximum call stack size exceeded) in collect-build-traces
// caused by picomatch recursing over large node_modules subtrees.
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip tracing large packages that cause stack overflow in Next.js 14.0.4
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@react-three/**/*',
      'node_modules/three/**/*',
      'node_modules/three-mesh-bvh/**/*',
      'node_modules/reactflow/**/*',
      'node_modules/@xyflow/**/*',
      'node_modules/framer-motion/**/*',
      'node_modules/@radix-ui/**/*',
      'node_modules/sharp/**/*',
      'node_modules/lucide-react/**/*',
    ],
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
