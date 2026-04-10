import './globals.css';

export const metadata = {
    title: 'CUThere — Discover Local Events',
    description: 'Browse and RSVP to campus events instantly.',
    manifest: '/manifest.json',
    icons: {
        apple: '/icons/icon-192x192.png',
    },
};

/** Ensures mobile browsers / WebView use the device width instead of a default ~980px layout. */
export const viewport = {
    width: 'device-width',
    initialScale: 1,
    /** Enables env(safe-area-inset-*) for notched phones & Capacitor WebView */
    viewportFit: 'cover',
    themeColor: '#000000',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
