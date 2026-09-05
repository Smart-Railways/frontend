import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sanket-railways.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/trains", "/maintenance", "/assets"],
        disallow: ["/api/*", "/_next/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
