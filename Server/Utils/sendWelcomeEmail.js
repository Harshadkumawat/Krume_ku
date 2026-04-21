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

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailer = getTransporter();

    if (!mailer) {
      console.error("⚠️ Welcome email skipped — transporter not configured");
      return;
    }

    if (!userEmail) {
      console.error("⚠️ Welcome email skipped — no email provided");
      return;
    }

    const firstName = userName ? String(userName).split(" ")[0] : "there";

    const mailOptions = {
      from: `"KRUMEKU" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome to the Collective, ${firstName} | Get 10% Off Inside`,
      html: `
        <div style="background-color: #f4f4f4; padding: 20px; font-family: Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid #eeeeee;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 800; text-transform: uppercase;">
                KRUMEKU<span style="color: #3b82f6;">.</span>
              </h1>
            </div>

            <div style="padding: 40px; text-align: center;">
              <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 10px; color: #111111;">Welcome to the family.</h2>
              <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 30px;">
                Hi ${firstName}, <br>
                Thanks for joining the Collective. You're now on the list for exclusive drops, early access, and India's finest streetwear archive.
              </p>

              <div style="background-color: #000000; color: #ffffff; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
                <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0; color: #9ca3af;">As a new member, enjoy</p>
                <h3 style="font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px;">10% OFF YOUR FIRST ORDER</h3>
                <div style="display: inline-block; margin-top: 20px; padding: 10px 20px; border: 1px dashed #ffffff; font-family: monospace; font-size: 20px; font-weight: bold;">
                  WELCOME10
                </div>
              </div>

              <a href="${process.env.FRONTEND_URL || "https://krumeku.com"}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 18px 40px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Shop New Arrivals
              </a>
            </div>

            <div style="padding: 20px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #eeeeee;">
              <span style="font-size: 11px; color: #999999; text-transform: uppercase; margin: 0 10px;">✓ Free Shipping</span>
              <span style="font-size: 11px; color: #999999; text-transform: uppercase; margin: 0 10px;">✓ Exclusive Drops</span>
              <span style="font-size: 11px; color: #999999; text-transform: uppercase; margin: 0 10px;">✓ 24/7 Support</span>
            </div>

            <div style="padding: 30px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin-bottom: 10px;">Connect with us @krumeku.collective</p>
              <p>© ${new Date().getFullYear()} KRUMEKU. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    };

    await mailer.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Welcome Email Error:", error.message);
  }
};

module.exports = sendWelcomeEmail;
