/** @type {import('next').NextConfig} */
// Care Journey runs at thecaring.app/care-journey via a Vercel rewrite,
// and at care-journey.vercel.app/care-journey directly. basePath keeps both consistent.
const nextConfig = {
  reactStrictMode: true,
  basePath: '/care-journey',
  // assetPrefix is inferred from basePath; add explicitly only if assets misresolve behind the website rewrite.
};

module.exports = nextConfig;
