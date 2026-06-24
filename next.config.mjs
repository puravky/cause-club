/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["your-supabase-url.supabase.co"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
