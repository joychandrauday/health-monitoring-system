import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import SessionProviders from '@/lib/sessionProviders';
import StoreProvider from '@/lib/storeProvider';
import ChatIconModal from '@/components/Modules/Chat/ChatIconModal';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { VideoCallModalManager } from '@/components/Modules/VideoCall/VideoCallModalManager';
import { VideoCallProvider } from '@/lib/VideoCallContext';
import { AppProvider } from '@/lib/FirebaseContext';

export const metadata: Metadata = {
  title: {
    default: 'Remote Healthcare Monitoring System',
    template: '%s | Remote Healthcare Monitoring System',
  },
  description:
    'Access advanced remote healthcare monitoring with real-time health tracking, video consultations, and personalized care plans. Connect with healthcare professionals anytime, anywhere.',
  keywords: [
    'remote healthcare',
    'health monitoring',
    'telemedicine',
    'video consultations',
    'health tracking',
    'patient care',
    'healthcare technology',
    'e-health',
  ],
  authors: [{ name: 'Joy Chandra Uday', url: 'https://joychandrauday-nexus.vercel.app/' }],
  creator: 'Joy Chandra Uday',
  publisher: 'Remote Healthcare Monitoring System',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Remote Healthcare Monitoring System',
    description:
      'Empowering patients with real-time health monitoring, video consultations, and personalized care plans. Access healthcare from the comfort of your home.',
    url: 'https://health-monitoring-system-five.vercel.app/',
    siteName: 'Remote Healthcare Monitoring System',
    images: [
      {
        url: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748674627/q7bh2mwdaaz7hmzrbvke.png',
        width: 1200,
        height: 630,
        alt: 'Remote Healthcare Monitoring System Preview',
      },
      {
        url: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748674730/iwzsl8jcsycsnhtjob83.png',
        width: 1200,
        height: 630,
        alt: 'Remote Healthcare Monitoring System Preview',
      },
      {
        url: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748674731/mveissdicqlzx55a8lht.png',
        width: 1200,
        height: 630,
        alt: 'Remote Healthcare Monitoring System Preview',
      },
      {
        url: 'https://res.cloudinary.com/dklikxmpm/image/upload/v1748674733/lic77h0qa5abkxsni3bo.png',
        width: 1200,
        height: 630,
        alt: 'Remote Healthcare Monitoring System Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remote Healthcare Monitoring System',
    description:
      'Real-time health monitoring and video consultations for personalized care. Connect with healthcare professionals today.',
    images: ['https://res.cloudinary.com/dklikxmpm/image/upload/v1748054896/image_fjiqey.png'],
    creator: '@YourTwitterHandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        url: '/favicon-32x32.png',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        url: '/favicon-16x16.png',
        sizes: '16x16',
      },
    ],
  },
  themeColor: '#ffffff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  alternates: {
    canonical: 'https://health-monitoring-system-five.vercel.app/',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" data-theme="light" className="font-sans">
      <head />
      <body>
        <SessionProviders>
          <AppProvider>
            <VideoCallProvider>
              <StoreProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem={false}
                  forcedTheme="light"
                >
                  <div>
                    <main className="min-h-screen overflow-hidden">{children}</main>
                    {session?.user && <ChatIconModal />}
                  </div>
                  <VideoCallModalManager />
                  <Toaster />
                </ThemeProvider>
              </StoreProvider>
            </VideoCallProvider>
          </AppProvider>
        </SessionProviders>
      </body>
    </html>
  );
}