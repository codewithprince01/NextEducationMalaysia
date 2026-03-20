import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for container/VPS deployment
  output: "standalone",

  // Enable gzip compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // Image optimization — allow images from Laravel admin
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.educationmalaysia.in",
        pathname: "/storage/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security + caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Immutable cache for static assets (images, fonts)
        source: "/(.*)\\.(jpg|jpeg|png|gif|svg|webp|avif|ico|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  
  // URL Rewrites for legacy filter patterns
  async rewrites() {
    return [
      {
        source: "/:slug-courses",
        destination: "/filtered-courses/:slug",
      },
    ];
  },

  // Permanent redirects — preserve legacy URLs
  async redirects() {
    return [
      {
        source: "/blogs",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/courses-in-malaysias",
        destination: "/courses-in-malaysia",
        permanent: true,
      },
      {
        source: "/study-malaysia",
        destination: "/",
        permanent: true,
      },
      {
        source: "/students-say",
        destination: "/what-people-say",
        permanent: true,
      },
      {
        source: "/courses",
        destination: "/courses-in-malaysia",
        permanent: true,
      },
      {
        source: "/select-level",
        destination: "/courses-in-malaysia",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
