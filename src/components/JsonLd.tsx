export default function JsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "a11yPalette",
        url: "https://a11ypalette.gigaptera.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://a11ypalette.gigaptera.com/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "a11yPalette",
        applicationCategory: "DesignTool",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description:
          "Generate accessible, consistent color palettes using the OKLCH color space.",
        author: {
          "@type": "Person",
          name: "Yuget",
          url: "https://gofilelab.com",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
