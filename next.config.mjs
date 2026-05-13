/** @type {import('next').NextConfig} */
const mount = process.env.COSMIC_MOUNT_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  ...(mount
    ? {
        basePath: mount,
        assetPrefix: mount,
      }
    : {}),
};

export default nextConfig;
