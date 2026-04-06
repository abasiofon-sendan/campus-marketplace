import { Providers } from './providers';
import { ToastProvider } from '@/context/ToastContext';
import PageLayout from '@/components/PageLayout';
import { Inter, Poppins } from 'next/font/google';

import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'], variable: '--font-poppins' });

export const metadata = {
  title: "Upstart - Student Marketplace",
  description: "Buy and sell products on campus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://icuklzexzhusblkzglnr.supabase.co/storage/v1/object/public/marketplace/logo/Upstart_3_-removebg-preview.png" type="image/png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <ToastProvider>
          <Providers>
            <PageLayout>
              {children}
            </PageLayout>
          </Providers>
        </ToastProvider>
      </body>
    </html>
  );
}
