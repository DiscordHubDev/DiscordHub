import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { SidebarProvider } from '@/components/ui/sidebar';

import { ThemeProvider } from '@/components/theme-provider';
import SessionProvider from './providers/SessionProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils';

import ClientLayout from './client_layout';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          'h-screen w-full font-sans antialiased bg-[#1e1f22] text-white',
          fontSans.variable,
        )}
      >
        <SidebarProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider session={session}>
              <ClientLayout>{children}</ClientLayout>
            </SessionProvider>
          </ThemeProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
