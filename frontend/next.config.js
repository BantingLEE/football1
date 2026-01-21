/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // EdgeOne Pages 静态导出配置
  // 使用 'export' 模式生成纯静态站点
  // 如果需要 SSR/ISR 功能，请改为 'standalone' 模式
  output: process.env.OUTPUT_MODE || 'export',

  // 图片优化配置 - 静态导出需要禁用图片优化
  images: {
    unoptimized: true,
  },

  // 确保所有路由都带有尾部斜杠（静态托管推荐）
  trailingSlash: true,

  // 环境变量配置
  env: {
    // API 地址 - 生产环境需要配置为实际的后端服务地址
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    // WebSocket 地址 - 实时功能需要
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig
