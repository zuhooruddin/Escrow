import type { Metadata } from 'next';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';
import { Fraunces, Inter } from 'next/font/google'

export const metadata: Metadata = {
  title: { default: 'Rakhwali PK — Pakistan\'s Trusted Escrow Platform', template: '%s | Rakhwali PK' },
  description: 'Secure escrow payments for Pakistan. Protect buyers and sellers with trusted third-party fund holding.',
  keywords: ['escrow', 'pakistan', 'freelance', 'secure payment', 'jazzcash', 'easypaisa'],
  icons: { icon: '/favicon.ico' },
};
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-page text-ink antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#f9f9f7',
                color: '#0c1917',
                border: '1px solid #e5dcd0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                boxShadow: '0 4px 20px rgba(12, 25, 23, 0.08)',
                padding: '12px 16px',
                maxWidth: '420px',
              },
              success: {
                iconTheme: { primary: '#064e3b', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#dc3545', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
