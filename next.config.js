/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images-1.medium.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-images-2.medium.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.medium.com',
        pathname: '/**',
      },
      // Wildcard pattern to allow any domain (for blog images from various sources)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      }
    ],
    domains: ['*'], // Allow all domains as fallback
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60 * 60 * 24, // 24 hours,
    unoptimized: true, // Skip image optimization for unknown domains
  },

  webpack(config) {
    // Keep existing webpack configuration
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ["@svgr/webpack"],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    // Add additional webpack optimizations
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };

    return config;
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Optimize memory usage for builds
  experimental: {
    optimizeServerReact: true,
    optimizeCss: true,
    serverMinification: true,
    serverSourceMaps: false,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'bdgenai.com', 'https://bdgenai.com']
    }
  },

  // Add bcryptjs to external packages for server components
  serverExternalPackages: ["bcryptjs"],

  // Updated compiler configuration to replace .babelrc
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },

  // Increase timeouts
  staticPageGenerationTimeout: 180,
  
  // Add additional performance optimizations
  poweredByHeader: false,

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

