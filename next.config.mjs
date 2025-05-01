/** @type {import('next').NextConfig} */
const nextConfig = {
  // строгий режим помогает ловить баги
  reactStrictMode: true,

  // разрешаем <Image> качать аватар из Google
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
}

export default nextConfig