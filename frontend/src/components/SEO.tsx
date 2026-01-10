import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
}

export default function SEO({
  title,
  description = 'Handcrafted woodworking from Wareham, Massachusetts. Custom furniture, CNC signs, laser engraving, and more. Quality craftsmanship you can trust.',
  keywords = 'woodworking, custom furniture, CNC signs, laser engraving, live edge, epoxy, Massachusetts, Wareham, Cape Cod',
  ogImage = '/og-image.jpg',
  ogType = 'website',
}: SEOProps) {
  const fullTitle = title
    ? `${title} | Sawdust & Coffee Woodworking`
    : 'Sawdust & Coffee Woodworking | Custom Woodwork from Cape Cod';

  const siteUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Sawdust & Coffee Woodworking" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional SEO Tags */}
      <meta name="author" content="Sawdust & Coffee Woodworking" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
}
