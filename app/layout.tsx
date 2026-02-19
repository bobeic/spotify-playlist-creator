import Link from "next/link";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b p-4 flex gap-4">
          <Link href="/">Home</Link>
          <Link href="/playlists">Playlists</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}
