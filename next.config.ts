import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable gzip compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // Windows fallback for environments where Next.js type-check workers cannot spawn (EPERM).
  // Enable only when needed: set SKIP_TYPECHECK=1 during build.
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1",
  },

  // No source maps in production — reduces bundle overhead
  productionBrowserSourceMaps: false,

  // Strip console.* in production — reduces JS parse + eval time on mobile
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Tree-shake barrel imports from heavy icon/utility libraries
  // This prevents loading entire icon packs when only a few icons are used
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa",
      "react-icons/md",
      "react-icons/lu",
      "react-icons/bs",
      "react-icons/fi",
      "react-icons/io5",
      "react-icons/vsc",
      "react-icons/bi",
      "lucide-react",
      "framer-motion",
      "swiper",
    ],
  },

  // Image optimization — allow images from Laravel admin
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.educationmalaysia.in",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
        pathname: "/**",
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
          { key: "X-DNS-Prefetch-Control", value: "on" },
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
        source: "/:slug-courses/page-:page",
        destination: "/filtered-courses/:slug/page-:page",
      },
      {
        source: "/:slug-courses",
        destination: "/filtered-courses/:slug",
      },
    ];
  },

  // Permanent redirects — preserve legacy URLs
  async redirects() {
    return [
      // Common legacy typos / renamed listing URLs
      {
        source: "/universitie",
        destination: "/universities",
        permanent: true,
      },
      {
        source: "/universitys",
        destination: "/universities",
        permanent: true,
      },
      {
        source: "/specialisation",
        destination: "/specialization",
        permanent: true,
      },
      {
        source: "/specialisations",
        destination: "/specialization",
        permanent: true,
      },
      {
        source: "/view-our-partner",
        destination: "/view-our-partners",
        permanent: true,
      },
      {
        source: "/what-people-says",
        destination: "/what-people-say",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },

      // FAQ path normalization
      {
        source: "/faqs/:slug",
        destination: "/faq/:slug",
        permanent: true,
      },

      // Universities page aliases seen in older links
      {
        source: "/universities/universities-in-malaysia",
        destination: "/universities/international-school-in-malaysia",
        permanent: true,
      },
      {
        source: "/universities-in-malaysia",
        destination: "/universities/international-school-in-malaysia",
        permanent: true,
      },

      // Legacy course listing aliases
      {
        source: "/courses-in-malaysias",
        destination: "/courses-in-malaysia",
        permanent: true,
      },
      {
        source: "/coursese",
        destination: "/courses",
        permanent: true,
      },

      {
        source: "/blogs",
        destination: "/blog",
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
        source: "/select-level",
        destination: "/courses",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
