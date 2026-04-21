const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      `\x1b[31m%s\x1b[0m`,
      "❌ EMAIL_USER or EMAIL_PASS missing in .env",
    );
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
  });

  return transporter;
};

const sendOrderEmail = async (userEmail, orderDetails) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      console.error("⚠️ Email skipped — transporter not configured");
      return;
    }

    if (!userEmail || !orderDetails?.orderId) {
      console.error("⚠️ Email skipped — missing userEmail or orderId");
      return;
    }

    const orderDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const CLOUDINARY_BASE =
      "https://res.cloudinary.com/dftticvtc/image/upload/";
    const items = orderDetails.items || [];

    const productItemsHtml = items
      .map((item) => {
        const fullImageUrl =
          item.image && item.image.startsWith("http")
            ? item.image
            : `${CLOUDINARY_BASE}${item.image || ""}`;

        const priceDisplay =
          typeof item.price === "number"
            ? `₹${item.price.toLocaleString("en-IN")}`
            : "₹0";

        return `
        <tr>
          <td style="padding: 20px 0; border-bottom: 1px solid #222;">
            <table width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td width="70" style="vertical-align: top;">
                  <img src="${fullImageUrl}" width="65" height="65" style="border-radius: 6px; object-fit: cover; display: block; background: #1a1a1a;" alt="${item.name || "Product"}" />
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.5px;">${item.name || "Product"}</p>
                  <p style="margin: 6px 0 0 0; font-size: 11px; color: #888888; text-transform: uppercase;">SIZE: ${item.size || "N/A"} | QTY: ${item.quantity || 1}</p>
                </td>
                <td style="text-align: right; vertical-align: top; min-width: 80px;">
                  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #ffffff;">${priceDisplay}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
      })
      .join("");

    const totalDisplay =
      typeof orderDetails.totalAmount === "number"
        ? `₹${orderDetails.totalAmount.toLocaleString("en-IN")}`
        : "₹0";

    const orderId = orderDetails.orderId || "";
    const shortOrderId = orderId.substring(orderId.length - 8).toUpperCase();

    const mailOptions = {
      from: `"KRUMEKU" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `ORDER CONFIRMED: #${shortOrderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media screen and (max-width: 480px) {
              .mobile-full { width: 100% !important; display: block !important; }
              .mobile-padding { padding: 20px !important; }
              .order-details-value { text-align: left !important; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: Arial, sans-serif;">
          <table width="100%" bgcolor="#000000" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding: 20px;">
                <table width="100%" style="max-width: 600px; background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td align="center" style="padding: 45px 20px; border-bottom: 1px solid #1a1a1a;">
                      <h1 style="margin: 0; color: #ffffff; letter-spacing: 10px; font-size: 26px; font-weight: 900;">KRUMEKU</h1>
                    </td>
                  </tr>
                  <tr>
                    <td class="mobile-padding" style="padding: 40px 35px;">
                      <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px; font-weight: 800; font-style: italic;">CONFIRMED.</h2>
                      <p style="color: #666666; font-size: 15px; margin: 0 0 35px 0; line-height: 1.5;">We've received your order. Our team is preparing your items for delivery.</p>
                      <table width="100%" cellspacing="0" cellpadding="0">
                        ${productItemsHtml}
                      </table>
                      <div style="background: #111111; border: 1px solid #1a1a1a; border-radius: 8px; padding: 25px; margin-top: 35px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr><td style="color: #555555; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; padding-bottom: 8px;">Order ID</td></tr>
                          <tr><td style="color: #ffffff; font-weight: 700; font-size: 14px; padding-bottom: 20px; font-family: monospace;">#${orderId.toUpperCase()}</td></tr>
                          <tr><td style="color: #555555; font-size: 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; padding-bottom: 8px;">Shipping To</td></tr>
                          <tr><td style="color: #ffffff; font-weight: 700; font-size: 14px; padding-bottom: 25px; line-height: 1.4;">${orderDetails.address || "N/A"}</td></tr>
                          <tr>
                            <td style="border-top: 1px solid #222; padding-top: 20px;">
                              <table width="100%">
                                <tr>
                                  <td style="color: #ffffff; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Charged</td>
                                  <td align="right" style="color: #ffffff; font-weight: 900; font-size: 22px;">${totalDisplay}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </div>
                      <div style="text-align: center; margin-top: 40px;">
                        <a href="${process.env.FRONTEND_URL || "https://krumeku.com"}/orders" style="display: inline-block; background: #ffffff; color: #000000; padding: 18px 40px; border-radius: 4px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">View Order History</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 30px; background: #000000; border-top: 1px solid #1a1a1a;">
                      <p style="color: #444444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">© ${new Date().getFullYear()} KRUMEKU COLLECTIVE</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Order email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

module.exports = sendOrderEmail;
