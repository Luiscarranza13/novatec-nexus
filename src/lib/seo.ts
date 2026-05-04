import { SITE } from "@/lib/site";

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
};

const defaultImage = `${SITE.siteUrl}/og-image.jpg`;

export function seo({ title, description, path = "/", image = defaultImage, noindex }: SeoOptions) {
  const url = new URL(path, SITE.siteUrl).toString();

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: SITE.nombre },
      { name: "keywords", content: SITE.keywords },
      { name: "robots", content: noindex ? "noindex,nofollow" : "index,follow" },
      { property: "og:locale", content: "es_PE" },
      { property: "og:site_name", content: SITE.empresa },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.nombre,
  jobTitle: "Desarrollador Full Stack",
  url: SITE.siteUrl,
  worksFor: {
    "@type": "Organization",
    name: SITE.empresa,
    url: SITE.empresaUrl,
  },
  knowsAbout: [
    "Desarrollo web",
    "Aplicaciones móviles",
    "Sistemas inteligentes",
    "Diseño UI/UX",
    "Supabase",
    "React",
  ],
};
