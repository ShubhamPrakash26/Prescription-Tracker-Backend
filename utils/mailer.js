import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        // If using Gmail, you need to generate an "App Password"
        // Go to Google Account > Security > 2-Step Verification > App Passwords
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

class Mailer {
    // Send a basic email
    static async sendMail({ to, subject, html, text }) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to,
                subject,
                html,
                text // Fallback plain text version
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    // Send a document share email with attachment (optional)
    static async sendDocumentShareEmail({ 
        to, 
        senderName, 
        documentType, 
        shareLink, 
        attachment = null 
    }) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to,
                subject: `${senderName} shared a ${documentType} with you`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2563eb;">Medical Document Shared</h2>
                        <p style="font-size: 16px; color: #4b5563;">
                            ${senderName} has shared a ${documentType} with you.
                        </p>
                        <p style="font-size: 16px; color: #4b5563;">
                            You can view the document by clicking the button below:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${shareLink}" 
                               style="background-color: #2563eb; color: white; padding: 12px 24px; 
                                      text-decoration: none; border-radius: 6px; font-weight: bold;">
                                View Document
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #6b7280;">
                            Note: This link will expire in 24 hours for security purposes.
                        </p>
                        <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="font-size: 12px; color: #9ca3af;">
                            This is an automated message, please do not reply to this email.
                        </p>
                    </div>
                `
            };

            // Add attachment if provided
            if (attachment) {
                mailOptions.attachments = [{
                    filename: attachment.filename,
                    content: attachment.content,
                    contentType: attachment.contentType
                }];
            }

            const info = await transporter.sendMail(mailOptions);
            console.log('Share email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error('Error sending share email:', error);
            throw error;
        }
    }

    // Send a test email to verify configuration
    static async sendTestEmail() {
        try {
            const info = await this.sendMail({
                to: process.env.EMAIL_USER || 'your-email@gmail.com',
                subject: 'Test Email',
                html: '<h1>Test Email</h1><p>This is a test email to verify the configuration.</p>',
                text: 'Test Email - This is a test email to verify the configuration.'
            });
            return info;
        } catch (error) {
            console.error('Error sending test email:', error);
            throw error;
        }
    }
}

export default Mailer;
