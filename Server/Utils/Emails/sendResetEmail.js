const nodemailer = require("nodemailer");

const sendResetEmail = async (userEmail, resetUrl) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"KRUMEKU SECURITY" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `SECURITY PROTOCOL: Password Reset Request`,
      html: `
        <div style="background-color: #fafafa; padding: 40px; font-family: sans-serif;">
          <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 20px; border: 1px solid #eee; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
            <div style="background: #000; padding: 30px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-style: italic;">KRUMEKU<span style="color: #3b82f6;">.</span></h1>
            </div>
            <div style="padding: 40px; text-align: center;">
              <h2 style="font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">Reset Access Key</h2>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                We received a request to reset the password for your Krumeku Archive account. Click the button below to proceed.
              </p>
              <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 18px 30px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; margin: 20px 0;">Reset Password</a>
              <p style="color: #999; font-size: 11px; margin-top: 20px;">
                This link will expire in 15 minutes. <br/> If you didn't request this, please ignore this email.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Reset Email Error:", error);
  }
};

module.exports = sendResetEmail;
