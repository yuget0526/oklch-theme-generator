import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import type { Metadata, Viewport } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#020202" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: {
      template: "%s | a11yPalette",
      default: t("title"),
    },
    description: t("description"),
    keywords: [
      "color palette",
      "generator",
      "oklch",
      "accessibility",
      "a11y",
      "contrast",
      "tailwind css",
      "design system",
      "color tool",
    ],
    authors: [{ name: "Yuget", url: "https://gofilelab.com" }],
    creator: "Yuget",
    openGraph: {
      type: "website",
      locale: locale === "ja" ? "ja_JP" : "en_US",
      url: `https://a11ypalette.gigaptera.com/${locale}`,
      title: t("title"),
      description: t("description"),
      siteName: "a11yPalette",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "a11yPalette Preview",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@yuget",
      images: ["/og-image.png"],
    },
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" />
        <JsonLd />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
