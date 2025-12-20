import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords?: string;
    canonical?: string;
    openGraph: {
      type?: string;
      title?: string;
      description?: string;
      image?: string;
      url?: string;
    };
    schemaMarkup: object[];
  };
}

export function SEOHead({ seo }: SEOHeadProps) {
  const {
    metaTitle,
    metaDescription,
    keywords,
    canonical,
    openGraph,
    schemaMarkup,
  } = seo;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={openGraph.type || 'website'} />
      <meta property="og:title" content={openGraph.title || metaTitle} />
      <meta property="og:description" content={openGraph.description || metaDescription} />
      {openGraph.image && <meta property="og:image" content={openGraph.image} />}
      {openGraph.url && <meta property="og:url" content={openGraph.url} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={openGraph.title || metaTitle} />
      <meta name="twitter:description" content={openGraph.description || metaDescription} />
      {openGraph.image && <meta name="twitter:image" content={openGraph.image} />}

      {/* JSON-LD Schema Markup */}
      {schemaMarkup.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEOHead;
