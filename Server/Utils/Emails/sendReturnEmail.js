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

const sendReturnEmail = async (userEmail, orderDetails, status) => {
  try {
    const mailer = getTransporter();
    if (!mailer) return;

    if (!userEmail || !orderDetails?.orderId) {
      console.error("⚠️ Return email skipped — missing data");
      return;
    }

    const orderId = orderDetails.orderId || "";
    const shortOrderId = orderId.substring(orderId.length - 8).toUpperCase();
    const isApproved = status === "Approved";
    const isRejected = status === "Rejected";

    const subjectMap = {
      Approved: `RETURN APPROVED: #${shortOrderId}`,
      Rejected: `RETURN UPDATE: #${shortOrderId}`,
      Refunded: `REFUND PROCESSED: #${shortOrderId}`,
    };

    const headingMap = {
      Approved: { text: "RETURN APPROVED.", color: "#22c55e" },
      Rejected: { text: "RETURN DECLINED.", color: "#ef4444" },
      Refunded: { text: "REFUND DONE.", color: "#3b82f6" },
    };

    const bodyMap = {
      Approved:
        "Your return request has been approved. Our team will arrange a pickup shortly. Please keep the item ready in its original condition.",
      Rejected: `Your return request has been reviewed and unfortunately could not be approved.${orderDetails.adminComment ? `<br/><br/><strong style="color:#ffffff;">Reason:</strong> <span style="color:#9ca3af;">${orderDetails.adminComment}</span>` : ""} If you have questions, please contact our support.`,
      Refunded:
        "Your refund has been successfully processed. The amount will reflect in your original payment method within 5–7 business days.",
    };

    const heading = headingMap[status] || {
      text: "RETURN UPDATE.",
      color: "#ffffff",
    };
    const bodyText = bodyMap[status] || "Your return request has been updated.";

    await mailer.sendMail({
      from: `"KRUMEKU" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subjectMap[status] || `RETURN UPDATE: #${shortOrderId}`,
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
                      <h2 style="color:${heading.color};margin:0 0 10px 0;font-size:24px;font-weight:800;font-style:italic;">${heading.text}</h2>
                      <p style="color:#666666;font-size:15px;margin:0 0 35px 0;line-height:1.5;">
                        ${bodyText}
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
                            <td style="color:#555555;font-size:10px;text-transform:uppercase;font-weight:800;letter-spacing:1.5px;padding-bottom:8px;">Return Type</td>
                          </tr>
                          <tr>
                            <td style="color:#ffffff;font-weight:700;font-size:14px;padding-bottom:20px;">${orderDetails.returnType || "Refund"}</td>
                          </tr>
                          ${
                            isApproved
                              ? `
                          <tr>
                            <td style="border-top:1px solid #222;padding-top:20px;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                                📦 Keep the item packed and ready. Our pickup agent will contact you within <strong style="color:#ffffff;">2–3 business days</strong>.
                              </p>
                            </td>
                          </tr>
                          `
                              : ""
                          }
                          ${
                            status === "Refunded"
                              ? `
                          <tr>
                            <td style="border-top:1px solid #222;padding-top:20px;">
                              <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
                                💳 Refund processed to your original payment method within <strong style="color:#ffffff;">5–7 business days</strong>.
                              </p>
                            </td>
                          </tr>
                          `
                              : ""
                          }
                        </table>
                      </div>

                      <!-- CTA -->
                      <div style="text-align:center;margin-top:40px;">
                        <a href="${process.env.FRONTEND_URL || "https://krumeku.com"}/orders"
                          style="display:inline-block;background:#ffffff;color:#000000;padding:18px 40px;border-radius:4px;text-decoration:none;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;">
                          View My Orders
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
  } catch (error) {
    console.error("❌ Return Email Error:", error.message);
  }
};

module.exports = sendReturnEmail;
