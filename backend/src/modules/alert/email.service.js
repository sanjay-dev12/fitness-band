import nodemailer from 'nodemailer';

// Create a reusable transporter using a generic SMTP transport.
// In a real application, you would configure these in your .env file.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'handband.alert@example.com',
        pass: process.env.SMTP_PASS || 'password123',
    },
});

/**
 * Send an automatic email alert for low heart rate
 * @param {string} toEmail - The recipient's email address
 * @param {Object} senderUser - The user who triggered the alert
 * @param {number} heartRate - The detected heart rate
 */
export const sendLowHrEmail = async (toEmail, senderUser, heartRate) => {
    try {
        const mailOptions = {
            from: '"Hand Band Alerts" <alerts@handband.app>',
            to: toEmail,
            subject: '⚠️ CRITICAL: Low Heart Rate Alert',
            text: `URGENT ALERT: A low heart rate has been detected for ${senderUser.fullName}.\n\nCurrent Heart Rate: ${heartRate} BPM.\n\nPlease check on them immediately.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #FF5252; border-radius: 8px; max-width: 600px;">
                    <h2 style="color: #FF5252; margin-top: 0;">⚠️ Critical Health Alert</h2>
                    <p style="font-size: 16px;">A dangerously low heart rate has been detected for <strong>${senderUser.fullName}</strong>.</p>
                    <div style="background-color: #ffeaea; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h1 style="color: #FF5252; margin: 0; text-align: center;">${heartRate} BPM</h1>
                    </div>
                    <p style="font-size: 16px;">Please check on them immediately.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #8FAAB2; font-size: 12px; margin-bottom: 0;">
                        This is an automated message from the Hand Band health monitoring system.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email alert sent to ${toEmail}. Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error);
        return false;
    }
};
