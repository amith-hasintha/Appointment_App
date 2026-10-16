import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CarePoint — Appointment Manager',
  description:
    'A modern, reliable, and accessible healthcare appointment management dashboard for clinic administration.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#0f2744" />
      </head>
      <body>{children}</body>
    </html>
  );
}
