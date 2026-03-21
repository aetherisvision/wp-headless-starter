import type { NextConfig } from "next";

const wpHostname = new URL(
  process.env.WORDPRESS_API_URL ?? "https://example.com"
).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow images from the WordPress backend
        protocol: "https",
        hostname: wpHostname,
      },
      {
        // Gravatar for author avatars
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
    ],
  },
};

export default nextConfig;
