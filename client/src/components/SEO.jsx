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
    // 1. Force update Title
    document.title = fullTitle;

    // 2. Force update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    // 3. Force update Open Graph Image (For WhatsApp/FB)
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
    <Helmet>
      {/* Fallback Helmet Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="theme-color" content="#000000" />
    </Helmet>
  );
};

export default SEO;
