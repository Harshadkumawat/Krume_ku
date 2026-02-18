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

    const mailOptions = {
      from: `"KRUMEKU ARCHIVE" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `ENTRY PROTOCOL COMPLETE: Welcome to the Archive, ${userName.split("")[0]}`,
      html: `
        <div style="background-color: #ffffff; font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #f3f4f6; border-radius: 24px; overflow: hidden;">
          <div style="background-color: #000000; padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px;">KRUMEKU<span style="color: #3b82f6;">.</span></h1>
          </div>
          <div style="padding: 40px; color: #111111;">
            <p style="text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 2px; color: #9ca3af; margin-bottom: 20px;">Identity Verified • Access Granted</p>
            <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 15px;">WELCOME TO THE <span style="color: #3b82f6;">COLLECTIVE.</span></h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
              Hi ${userName}, your registration is complete. You are now part of India's premier streetwear archive. 
            </p>
            <div style="background: #f9fafb; border-radius: 16px; padding: 20px; margin: 30px 0; border: 1px dashed #d1d5db; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; margin-bottom: 10px; color: #6b7280;">NEW MEMBER GIFT</p>
              <h3 style="font-size: 20px; font-weight: 900; margin: 0;">GET 10% OFF</h3>
              <p style="font-size: 11px; color: #9ca3af; margin-top: 5px;">Use code: <span style="color: #000; font-weight: 900;">WELCOME10</span> on your first order.</p>
            </div>
            <a href="${process.env.FRONTEND_URL}" style="display: block; background: #000; color: #fff; text-align: center; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Enter The Archive</a>
          </div>
          <div style="padding: 20px; text-align: center; background: #f9fafb; font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
            © 2026 KRUMEKU COLLECTIVE • STREETWEAR INTELLIGENCE
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
      console.error("Welcome Email send:");
  } catch (error) {
    console.error("Welcome Email Error:", error);
  }
};

module.exports = sendWelcomeEmail;
