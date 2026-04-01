import './globals.css';

export const metadata = {
    title: 'cuThere',
    description: 'Browse events scraped from Instagram.',
};

/** Ensures mobile browsers / WebView use the device width instead of a default ~980px layout. */
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    /** Enables env(safe-area-inset-*) for notched phones & Capacitor WebView */
    viewportFit: 'cover',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
