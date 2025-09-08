/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.whop.com"],
    },
  },
  // CORS headers are handled by middleware.ts for better control
  // async headers() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       headers: [
  //         { key: "Access-Control-Allow-Origin", value: "*" },
  //         { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
  //         { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-whop-user-token, x-questchat-signature" },
  //       ],
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
