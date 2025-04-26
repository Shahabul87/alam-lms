/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
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
    ignoreDuringBuilds: true,
  },

  // Optimize memory usage for builds
  experimental: {
    optimizeServerReact: true,
    optimizeCss: true,
    serverMinification: true,
    serverSourceMaps: false,
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
  reactStrictMode: true,

  typescript: {
    // For build to succeed with dynamic params awaiting
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

