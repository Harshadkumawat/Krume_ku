const nodemailer = require("nodemailer");

const sendOrderEmail = async (userEmail, orderDetails) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"KRUMEKU ARCHIVE" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `CONFIRMED: ORDER #${orderDetails.orderId.substring(orderDetails.orderId.length - 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;900&display=swap');
            body { font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background-color: #000000; padding: 40px 20px; text-align: center; }
            .logo { color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1.5px; text-transform: uppercase; font-style: italic; }
            .dot { color: #3b82f6; }
            .content { padding: 40px 30px; color: #111111; }
            .status-badge { display: inline-block; background: #f3f4f6; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px; }
            .headline { font-size: 24px; font-weight: 900; line-height: 1.2; margin-bottom: 10px; text-transform: uppercase; italic; }
            .details-box { background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 20px; padding: 25px; margin: 30px 0; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
            .label { font-weight: 700; color: #9ca3af; text-transform: uppercase; font-size: 10px; }
            .value { font-weight: 900; color: #111111; }
            .footer { padding: 40px 20px; text-align: center; border-top: 1px solid #f3f4f6; }
            .btn { display: inline-block; background: #000000; color: #ffffff; padding: 18px 35px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">KRUMEKU<span class="dot">.</span></div>
            </div>
            
            <div class="content">
              <div class="status-badge">Identity Verified • Order Confirmed</div>
              <h1 class="headline italic">Your gear is being <br/> <span style="color: #3b82f6;">prepared for deployment.</span></h1>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                Thank you for choosing the Archive. We have successfully received your order. Our logistics unit is now processing your artifacts for shipment.
              </p>

              <div class="details-box">
                <div style="margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px;">
                  <span class="label">Manifest Sequence</span><br/>
                  <span style="font-weight: 900; font-size: 16px;">#${orderDetails.orderId.toUpperCase()}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Total Investment</span>
                  <span class="value">₹${orderDetails.totalAmount.toLocaleString("en-IN")}</span>
                </div>
                
                <div class="detail-row">
                  <span class="label">Destination</span>
                  <span class="value">${orderDetails.address}</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/orders" class="btn">Track Manifest</a>
              </div>
            </div>

            <div class="footer">
              <p style="font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px;">
                © 2026 KRUMEKU COLLECTIVE • ALL RIGHTS RESERVED
              </p>
              <p style="font-size: 9px; color: #d1d5db; margin-top: 10px;">
                This is an automated transmission. Do not reply directly to this mail.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Order Email Sent Successfully");
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
};

module.exports = sendOrderEmail;
