import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dress Catalog',
  description: 'Browse dresses by category, character name, sizes and price.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
