import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/auth/Providers';

export const metadata: Metadata = {
  title: 'IELTS AI Tutor - Practice with a Conversational AI Examiner',
  description: 'Ace IELTS speaking tests with real-time AI conversation practice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white">
        <Providers>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
