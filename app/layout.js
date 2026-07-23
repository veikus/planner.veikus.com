import localFont from 'next/font/local';
import { Sora, Cookie } from 'next/font/google';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});
// Self-hosted via next/font instead of a <link> to fonts.googleapis.com in
// Header.jsx/BuyMeACoffee.jsx: avoids the no-page-custom-font lint warning,
// lets the CSP's font-src/style-src stay 'self' with no Google exception,
// and Next fetches these at build time rather than the client doing it.
const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-sora',
});
const cookie = Cookie({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-cookie',
});

export const metadata = {
  metadataBase: new URL('https://planner.veikus.com'),
  title: {
    default: 'Route Planner',
    template: '%s | Route Planner',
  },
  description: 'Find flight routes with minimal transfers',
  openGraph: {
    title: 'Route Planner',
    description: 'Find flight routes with minimal transfers',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${cookie.variable} antialiased`}
      >
        {children}
        {/* 100% privacy-first analytics */}
        <script
          async
          defer
          src="https://scripts.simpleanalyticscdn.com/latest.js"
        ></script>
        <noscript>
          <img
            src="https://queue.simpleanalyticscdn.com/noscript.gif"
            alt=""
            referrerPolicy="no-referrer-when-downgrade"
          />
        </noscript>
      </body>
    </html>
  );
}
