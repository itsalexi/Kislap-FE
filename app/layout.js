import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './components/AuthProvider.js';
import Header from './components/Header.js';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Kislap - Smart Business Cards',
    description: 'Digital business cards with QR codes',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Header />
                    <main>{children}</main>
                    <Toaster
                        position="bottom-right"
                        richColors
                        closeButton
                        duration={5000}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}
