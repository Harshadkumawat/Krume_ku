export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.redirect("/");
  }

  try {
    
    const apiUrl = `https://api.krumeku.com/api/products/${id}`;

    const response = await fetch(apiUrl);
    const jsonResponse = await response.json();

    
    if (!jsonResponse.success || !jsonResponse.data) {
      return res.redirect(`/item/${id}`); 
    }

    const product = jsonResponse.data;

    
    const imageUrl =
      product.images?.[0]?.url || "https://www.krumeku.com/logo.png";
    const title = `${product.productName} | Krumeku`;
    const description = product.description
      ? product.description.substring(0, 150) + "..."
      : "Krumeku - Premium Quality Oversized & Embroidered T-Shirts.";

   
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${description}">
        
        <meta property="og:type" content="product">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="https://www.krumeku.com/product/${id}">
        <meta property="og:site_name" content="Krumeku">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">

        <script>
          window.location.replace("/item/${id}"); 
        </script>
      </head>
      <body style="background-color: #000; color: #fff; font-family: sans-serif; text-align: center; padding-top: 20%;">
        <h2>Loading ${product.productName}...</h2>
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    console.error("OG Fetch Error:", error);
    res.redirect(`/item/${id}`);
  }
}
