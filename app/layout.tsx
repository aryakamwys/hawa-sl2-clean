import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hawa",
  description: "Hawa By SL2",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
