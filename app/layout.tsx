import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dara Afrilia",
  description: "A tiny cosmic love letter, written just for Dara.",
  icons: {
    icon: "/icon.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}