import './globals.css';

export const metadata = {
    title: 'cuThere — Discover Local Events',
    description: 'Browse and RSVP to events scraped from Instagram.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
