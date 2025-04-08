import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'DiscordHubs',
  description: 'Discover and join amazing Discord communities',
};

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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <SidebarProvider>
              <ClientLayout>{children}</ClientLayout>
            </SidebarProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
