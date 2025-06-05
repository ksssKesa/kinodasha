/** @type {import('next').NextConfig} */
const nextConfig = {
  // строгий режим помогает ловить баги
  reactStrictMode: true,

  // разрешаем <Image> качать аватар из Google
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  eslint: {
    // игнорировать ошибки ESLint во время `next build`
    ignoreDuringBuilds: true,
  },
}

export default nextConfig