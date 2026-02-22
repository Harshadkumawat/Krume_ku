const nodemailer = require("nodemailer");

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const firstName = userName.split(" ")[0];

    const mailOptions = {
      from: `"KRUMEKU" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Welcome to the Collective, ${firstName} | Get 10% Off Inside`,
      html: `
        <div style="background-color: #f4f4f4; padding: 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
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

              <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 18px 40px; border-radius: 4px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Shop New Arrivals
              </a>
            </div>

            <div style="padding: 20px 40px; background-color: #fafafa; display: flex; justify-content: space-around; text-align: center; border-top: 1px solid #eeeeee;">
              <div style="font-size: 11px; color: #999999; text-transform: uppercase;">✓ Free Shipping</div>
              <div style="font-size: 11px; color: #999999; text-transform: uppercase;">✓ Exclusive Drops</div>
              <div style="font-size: 11px; color: #999999; text-transform: uppercase;">✓ 24/7 Support</div>
            </div>

            <div style="padding: 30px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin-bottom: 10px;">Connect with us @krumeku.collective</p>
              <p>© 2026 KRUMEKU. All rights reserved.</p>
            </div>

          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Welcome Email Error:", error);
  }
};

module.exports = sendWelcomeEmail;
