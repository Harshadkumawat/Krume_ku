const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
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

const sendCancelEmail = async (userEmail, orderDetails) => {
  try {
    const mailer = getTransporter();
    if (!mailer) return;

    if (!userEmail || !orderDetails?.orderId) {
      console.error("⚠️ Cancel email skipped — missing data");
      return;
    }

    const orderId = orderDetails.orderId || "";
    const shortOrderId = orderId.substring(orderId.length - 8).toUpperCase();
    const totalDisplay =
      typeof orderDetails.totalAmount === "number"
        ? `₹${orderDetails.totalAmount.toLocaleString("en-IN")}`
        : "₹0";

    await mailer.sendMail({
      from: `"KRUMEKU" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `ORDER CANCELLED: #${shortOrderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#000000;font-family:Arial,sans-serif;">
          <table width="100%" bgcolor="#000000" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="padding:20px;">
                <table width="100%" style="max-width:600px;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding:45px 20px;border-bottom:1px solid #1a1a1a;">
                      <h1 style="margin:0;color:#ffffff;letter-spacing:10px;font-size:26px;font-weight:900;">KRUMEKU</h1>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 35px;">
                      <h2 style="color:#ef4444;margin:0 0 10px 0;font-size:24px;font-weight:800;font-style:italic;">CANCELLED.</h2>
                      <p style="color:#666666;font-size:15px;margin:0 0 35px 0;line-height:1.5;">
                        Your order has been successfully cancelled. If a coupon was applied, it has been restored for future use.
                      </p>

                      <!-- Order Info -->
                      <div style="background:#111111;border:1px solid #1a1a1a;border-radius:8px;padding:25px;">
                        <table width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="color:#555555;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:1.5px;padding-bottom:8px;">Order ID</td>
                          </tr>
                          <tr>
                            <td style="color:#ffffff;font-weight:700;font-size:14px;padding-bottom:20px;font-family:monospace;">#${orderId.toUpperCase()}</td>
                          </tr>
                          <tr>
                            <td style="color:#555555;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:1.5px;padding-bottom:8px;">Cancelled Amount</td>
                          </tr>
                          <tr>
                            <td style="color:#ef4444;font-weight:900;font-size:22px;padding-bottom:20px;">${totalDisplay}</td>
                          </tr>
                          <tr>
                            <td style="color:#555555;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:1.5px;padding-bottom:8px;">Payment Method</td>
                          </tr>
                          <tr>
                            <td style="color:#ffffff;font-weight:700;font-size:14px;padding-bottom:20px;">${orderDetails.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}</td>
                          </tr>
                          ${
                            orderDetails.paymentMethod !== "COD"
                              ? `
                          <tr>
                            <td style="border-top:1px solid #222;padding-top:20px;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                                💳 Refund will be processed to your original payment method within <strong style="color:#ffffff;">5–7 business days</strong>.
                              </p>
                            </td>
                          </tr>
                          `
                              : `
                          <tr>
                            <td style="border-top:1px solid #222;padding-top:20px;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                                No payment was charged for this COD order.
                              </p>
                            </td>
                          </tr>
                          `
                          }
                        </table>
                      </div>

                      <!-- CTA -->
                      <div style="text-align:center;margin-top:40px;">
                        <a href="${process.env.FRONTEND_URL || "https://krumeku.com"}/products"
                          style="display:inline-block;background:#ffffff;color:#000000;padding:18px 40px;border-radius:4px;text-decoration:none;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                          Continue Shopping
                        </a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding:30px;background:#000000;border-top:1px solid #1a1a1a;">
                      <p style="color:#444444;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0;">
                        © ${new Date().getFullYear()} KRUMEKU COLLECTIVE
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Cancel email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Cancel Email Error:", error.message);
  }
};

module.exports = sendCancelEmail;
