import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: 'JSONata Playground',
  description: 'JSONata playground with AI-powered mapping assistant',
  icons: {
    icon: '/shivi.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <TooltipProvider>{children}</TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
