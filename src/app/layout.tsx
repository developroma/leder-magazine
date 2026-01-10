import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.scss';

const cormorant = Cormorant_Garamond({
    subsets: ['latin', 'cyrillic'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-heading',
    display: 'swap',
});

const montserrat = Montserrat({
    subsets: ['latin', 'cyrillic'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Leder — Шкіряні вироби ручної роботи',
    description:
        'Інтернет-магазин шкіряних виробів ручної роботи. Сумки, гаманці, ремені преміум якості. Доставка по Україні.',
    keywords: 'шкіряні вироби, сумки, гаманці, ремені, handmade, ручна робота',
    openGraph: {
        title: 'Leder — Шкіряні вироби ручної роботи',
        description: 'Інтернет-магазин шкіряних виробів ручної роботи',
        type: 'website',
        locale: 'uk_UA',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="uk" className={`${cormorant.variable} ${montserrat.variable}`}>
            <body>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#2C2C2C',
                            color: '#fff',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-body)',
                        },
                    }}
                />
            </body>
        </html>
    );
}
