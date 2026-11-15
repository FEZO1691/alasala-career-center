import type { NextConfig } from "next";

// تصدير ثابت: مجلد out/ يعمل من أي استضافة ثابتة (Vercel, Netlify, GitHub Pages)
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  assetPrefix: isProd ? "./" : undefined,
};

export default nextConfig;
