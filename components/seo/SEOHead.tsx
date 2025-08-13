// components/seo/SEOHead.tsx
import { Metadata } from "next";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
}

export function generateMetadata({
  title = "Wakili Msomi - AI Legal Assistant",
  description = "Your AI-powered legal assistant for legal advice and document assistance",
  keywords = "legal assistant, AI lawyer, legal advice, Kenya law, legal documents",
  ogImage = "/wakilimsomi.jpeg",
}: SEOHeadProps = {}): Metadata {
  return {
    title,
    description,
    keywords,
    authors: [{ name: "Wakili Msomi" }],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Wakili Msomi AI Legal Assistant",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
