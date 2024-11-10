import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/share/",
        "/api/",
        "/verify-email",
        "/sign-out",
        "/auth-callback",
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL!}/sitemap.xml`,
  }
}
