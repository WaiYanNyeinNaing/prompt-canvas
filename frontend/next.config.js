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
    ];
  },
};

export default nextConfig;
