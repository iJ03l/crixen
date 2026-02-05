import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

export default function SEO({
    title = "Crixen - AI Social Media Agent",
    description = "Manage multiple brands, automate engagement, and scale your presence with Crixen's secure, user-owned AI agents.",
    image = "https://crixen.xyz/ccc.jpg",
    url = "https://crixen.xyz",
    type = "website"
}: SEOProps) {
    const fullTitle = title === "Crixen - AI Social Media Agent" ? title : `${title} | Crixen`;

    return (
        <Helmet>
            {/* Basic */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
