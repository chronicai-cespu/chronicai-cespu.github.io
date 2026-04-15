
import type {Metadata} from 'next';
import './globals.css';
import { HealthProvider } from '@/components/health-context';
import { Navigation } from '@/components/navigation';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'ChronicAI - O Seu Companheiro de Saúde',
  description: 'Acompanhamento de saúde e assistente com IA para cuidados crónicos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <HealthProvider>
            <Navigation />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
            <Toaster />
          </HealthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
