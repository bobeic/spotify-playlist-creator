import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <div className="app-shell">
          <div className="aurora aurora-violet" />
          <div className="aurora aurora-emerald" />
          {children}
        </div>
      </body>
    </html>
  );
}
