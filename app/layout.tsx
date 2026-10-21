import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Old Mutual Uganda | Payments demo",
  description: "Unofficial, simulated insurance and OMIG unit trust card payments demonstration. No real transactions.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
