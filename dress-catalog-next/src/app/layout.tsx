import type { Metadata } from 'next';
import Header from '@/components/Header';
import './globals.css';
export const metadata: Metadata = { title: 'Akshaya Dress Studio', description: 'Browse dresses by category, character name, sizes and price.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Header />{children}</body></html>; }
