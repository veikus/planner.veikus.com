// CSP ships Report-Only for now: it logs violations to the browser console
// instead of blocking anything, since a wrong directive here would be a
// silent, hard-to-notice breakage (analytics not firing, fonts not
// loading) that isn't visible from a server-rendered response. Once
// checked in a real browser with nothing unexpected in the console,
// switch the header key to 'Content-Security-Policy' to enforce it.
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' https://scripts.simpleanalyticscdn.com",
  "connect-src 'self' https://queue.simpleanalyticscdn.com",
  "img-src 'self' https://queue.simpleanalyticscdn.com data:",
  "style-src 'self'",
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
