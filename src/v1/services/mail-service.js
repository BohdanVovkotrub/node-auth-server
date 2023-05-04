const nodemailer = require('nodemailer');


class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_SMTP_HOST,
            port: process.env.MAIL_SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.MAIL_SMTP_USER,
                pass: process.env.MAIL_SMTP_PASSWORD,
            }
        });
    };

    async sendAuthVerificationCode(to, code) {
        return await this.transporter.sendMail({
            from: process.env.MAIL_SENDER || process.env.MAIL_SMTP_USER,
            to,
            subject: `Verification code`,
            text: `${code}`,
            html: `
            <div>
                <h1>${code}</h1>
            </div>
            `
        });
    };
};

module.exports = new MailService();