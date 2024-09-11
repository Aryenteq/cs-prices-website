import nodemailer from 'nodemailer';

export const sendMail = async (title: string, receiverEmail: string, content: string) => {
    const transporter = nodemailer.createTransport({
        host: 'webmail.your-server.de',
        port: 587,
        secure: false,
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.COMPANY_EMAIL,
        to: receiverEmail,
        subject: title,
        html: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            throw new Error('Failed to send email');
        }
    });
}