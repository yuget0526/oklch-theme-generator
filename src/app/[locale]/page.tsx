import ColorGenerator from "@/components/ColorGenerator";
import { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const p = resolvedSearchParams.p || "";
  const s = resolvedSearchParams.s || "";
  const t = resolvedSearchParams.t || "";
  const m = resolvedSearchParams.m || "light";

  // Default colors (matching ColorGenerator initial state)
  const defaultP = "3b82f6";
  const defaultS = "059669";
  const defaultT = "8b5cf6";
  const defaultM = "light";

  const query = new URLSearchParams();
  query.set("p", (p || defaultP) as string);
  query.set("s", (s || defaultS) as string);
  query.set("t", (t || defaultT) as string);
  query.set("m", (m || defaultM) as string);

  return {
    openGraph: {
      images: [`/api/og?${query.toString()}`],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/api/og?${query.toString()}`],
    },
  };
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <ColorGenerator />
    </main>
  );
}
