import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description = "Krumeku - Premium Quality Oversized & Embroidered T-Shirts. Express your style with our unique designs.",
  image = "https://www.krumeku.com/og-banner.jpg",
  url = "https://www.krumeku.com",
  type = "website",
}) => {
  const siteName = "Krumeku";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  useEffect(() => {
    document.title = fullTitle;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      ogImage.setAttribute("content", image);
    } else {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      ogImage.content = image;
      document.head.appendChild(ogImage);
    }
  }, [fullTitle, description, image]);

  return (
    <Helmet prioritizeSeoTags>
      {/* 1. Standard Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* 2. Open Graph / Facebook (Essential for WhatsApp/Insta) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />

      {/* 🔥 WhatsApp/Meta Force Image Tags */}
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* 3. Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* 4. Extra Branding */}
      <meta name="theme-color" content="#000000" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
    </Helmet>
  );
};

export default SEO;
