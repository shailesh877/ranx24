import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Email Service Utility
 * Handles all email sending functionality
 */

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
    }

    /**
     * Lazy initialization - only initialize when first needed
     */
    ensureInitialized() {
        if (!this.initialized) {
            this.initializeTransporter();
            this.initialized = true;
        }
    }

    /**
     * Initialize email transporter based on environment configuration
     */
    initializeTransporter() {
        try {
            // Debug: Log email configuration status
            console.log('🔍 Email Configuration Debug:');
            console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Not set');
            console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Not set');
            console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || 'Not set');
            console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || 'Not set');

            // Check if email is configured
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
                console.warn('⚠️  Email service not configured. Emails will not be sent.');
                return;
            }

            const emailConfig = {
                host: process.env.EMAIL_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                },
            };

            this.transporter = nodemailer.createTransport(emailConfig);

            // Verify connection
            this.transporter.verify((error, success) => {
                if (error) {
                    console.error('❌ Email service connection failed:', error.message);
                } else {
                    console.log('✅ Email service ready to send emails');
                }
            });
        } catch (error) {
            console.error('❌ Error initializing email service:', error.message);
        }
    }

    /**
     * Load email template and replace placeholders with data
     */
    loadTemplate(templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);

            if (!fs.existsSync(templatePath)) {
                console.error(`Email template not found: ${templateName}`);
                return this.getDefaultTemplate(data);
            }

            let template = fs.readFileSync(templatePath, 'utf-8');

            // Replace placeholders with actual data
            Object.keys(data).forEach(key => {
                const placeholder = new RegExp(`{{${key}}}`, 'g');
                template = template.replace(placeholder, data[key] || '');
            });

            return template;
        } catch (error) {
            console.error('Error loading email template:', error);
            return this.getDefaultTemplate(data);
        }
    }

    /**
     * Default email template fallback
     */
    getDefaultTemplate(data) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">YelloCapp</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                    <div style="background: white; padding: 20px; border-radius: 5px;">
                        ${data.content || 'Thank you for using YelloCapp!'}
                    </div>
                    <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                        © ${new Date().getFullYear()} YelloCapp. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Send email
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email
     * @param {string} options.subject - Email subject
     * @param {string} options.template - Template name (without .html)
     * @param {Object} options.data - Data to inject into template
     * @param {string} options.html - Direct HTML content (alternative to template)
     */
    async sendEmail({ to, subject, template, data = {}, html }) {
        try {
            // Ensure email service is initialized
            this.ensureInitialized();

            // If email service is not configured, log and return
            if (!this.transporter) {
                console.log(`📧 Email would be sent to ${to}: ${subject}`);
                console.log('   (Email service not configured)');
                return { success: false, message: 'Email service not configured' };
            }

            // Generate HTML content
            const htmlContent = html || this.loadTemplate(template, data);

            const mailOptions = {
                from: process.env.EMAIL_FROM || `"YelloCapp" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent to ${to}: ${subject}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send booking confirmation email
     */
    async sendBookingConfirmation(user, booking) {
        return this.sendEmail({
            to: user.email,
            subject: `Booking Confirmed - #${booking._id.toString().slice(-6)}`,
            template: 'bookingConfirmation',
            data: {
                userName: user.name || 'Customer',
                bookingId: booking._id.toString().slice(-6),
                serviceName: booking.service?.name || 'Service',
                bookingDate: new Date(booking.scheduledDate).toLocaleDateString(),
                bookingTime: booking.scheduledTime || 'TBD',
                totalAmount: `₹${booking.totalAmount}`,
                address: booking.address?.fullAddress || 'N/A',
            }
        });
    }

    /**
     * Send worker assignment notification
     */
    async sendWorkerAssignmentToUser(user, booking, worker) {
        return this.sendEmail({
            to: user.email,
            subject: 'Worker Assigned to Your Booking',
            template: 'workerAssigned',
            data: {
                userName: user.name || 'Customer',
                workerName: worker.name || 'Worker',
                workerPhone: worker.mobileNumber || 'N/A',
                workerRating: worker.rating || 'New',
                bookingId: booking._id.toString().slice(-6),
                serviceName: booking.service?.name || 'Service',
            }
        });
    }

    /**
     * Send new booking notification to worker
     */
    async sendNewBookingToWorker(worker, booking, user) {
        return this.sendEmail({
            to: worker.email,
            subject: 'New Booking Assigned',
            template: 'newBookingWorker',
            data: {
                workerName: worker.name || 'Worker',
                customerName: user.name || 'Customer',
                customerPhone: user.mobileNumber || 'N/A',
                serviceName: booking.service?.name || 'Service',
                bookingDate: new Date(booking.scheduledDate).toLocaleDateString(),
                bookingTime: booking.scheduledTime || 'TBD',
                address: booking.address?.fullAddress || 'N/A',
                bookingId: booking._id.toString().slice(-6),
            }
        });
    }

    /**
     * Send booking completion email
     */
    async sendBookingCompletion(user, booking, worker) {
        return this.sendEmail({
            to: user.email,
            subject: 'Booking Completed - Thank You!',
            template: 'bookingCompleted',
            data: {
                userName: user.name || 'Customer',
                workerName: worker?.name || 'Worker',
                serviceName: booking.service?.name || 'Service',
                bookingId: booking._id.toString().slice(-6),
                totalAmount: `₹${booking.totalAmount}`,
                completionDate: new Date().toLocaleDateString(),
            }
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(user, resetToken) {
        const resetUrl = `${process.env.CLIENT_URL || 'https://www.ranx24.com'}/reset-password/${resetToken}`;

        return this.sendEmail({
            to: user.email,
            subject: 'Reset Your Password',
            template: 'forgotPassword',
            data: {
                userName: user.name || 'User',
                resetUrl,
                expiryTime: '1 hour',
            }
        });
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user) {
        return this.sendEmail({
            to: user.email,
            subject: 'Welcome to RanX24!',
            template: 'welcome',
            data: {
                userName: user.name || 'User',
                loginUrl: process.env.CLIENT_URL || 'https://www.ranx24.com',
            }
        });
    }

    /**
     * Send booking cancellation email
     */
    async sendBookingCancellation(user, booking, reason) {
        return this.sendEmail({
            to: user.email,
            subject: 'Booking Cancelled',
            template: 'bookingCancelled',
            data: {
                userName: user.name || 'Customer',
                bookingId: booking._id.toString().slice(-6),
                serviceName: booking.service?.name || 'Service',
                reason: reason || 'As per your request',
                refundInfo: booking.paymentStatus === 'paid' ? 'Refund will be processed within 5-7 business days' : '',
            }
        });
    }

    /**
     * Send payment receipt email
     */
    async sendPaymentReceipt(user, booking, payment) {
        return this.sendEmail({
            to: user.email,
            subject: 'Payment Receipt',
            template: 'paymentReceipt',
            data: {
                userName: user.name || 'Customer',
                bookingId: booking._id.toString().slice(-6),
                transactionId: payment.razorpayPaymentId || 'N/A',
                amount: `₹${payment.amount}`,
                paymentDate: new Date(payment.createdAt).toLocaleDateString(),
                paymentMethod: payment.method || 'Online',
            }
        });
    }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
