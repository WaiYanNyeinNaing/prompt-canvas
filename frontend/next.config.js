/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/models',
        destination: 'http://127.0.0.1:8000/models',
      },
      {
        source: '/chat',
        destination: 'http://127.0.0.1:8000/chat',
      },
      {
        source: '/prompts/:path*',
        destination: 'http://127.0.0.1:8000/prompts/:path*',
      },
    ];
  },
};

export default nextConfig;
