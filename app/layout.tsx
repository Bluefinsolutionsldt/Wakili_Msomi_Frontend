// app/layout.tsx
import { Metadata } from "next";
import { inter } from "./fonts";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wakili Msomi - AI Legal Assistant",
  description:
    "Your AI-powered legal assistant for legal advice and document assistance",
  keywords:
    "Wakili Msomi,Tanzania Law,Sheria kiganjani,legal assistant, AI lawyer, legal advice, Kenya law, legal documents",
  authors: [{ name: "Wakili Msomi" }],
  openGraph: {
    title: "Wakili Msomi - AI Legal Assistant",
    description:
      "Your AI-powered legal assistant for legal advice and document assistance",
    type: "website",
    locale: "sw",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wakili Msomi - AI Legal Assistant",
    description:
      "Your AI-powered legal assistant for legal advice and document assistance",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
