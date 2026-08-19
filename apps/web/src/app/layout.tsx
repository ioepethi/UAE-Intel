import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UAE Intelligence",
  description:
    "UAE Person/Company Intelligence & Business Contact Finder — public business research with sourced confidence scoring.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container header-inner">
            <h1>
              <a href="/">UAE Intelligence</a>
            </h1>
            <nav>
              <a href="/">Dashboard</a>
              <a href="/discover">Discover</a>
              <a href="/research">Deep Research</a>
            </nav>
          </div>
        </header>
        <main className="container" style={{ padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
