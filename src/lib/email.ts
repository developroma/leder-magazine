import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendSupportReply(
    to: string,
    subject: string,
    userName: string,
    originalMessage: string,
    adminReply: string
): Promise<boolean> {
    try {
        await transporter.sendMail({
            from: `"Leder Support" <${process.env.SMTP_USER || 'support@leder.ua'}>`,
            to,
            subject: `Re: ${subject}`,
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .reply { background: white; padding: 15px; border-left: 4px solid #8B4513; margin: 15px 0; }
        .original { background: #eee; padding: 15px; margin-top: 20px; font-size: 14px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leder</h1>
        </div>
        <div class="content">
            <p>Привіт, ${userName}!</p>
            <p>Дякуємо за звернення. Ось наша відповідь:</p>
            <div class="reply">
                ${adminReply.replace(/\n/g, '<br>')}
            </div>
            <div class="original">
                <strong>Ваше оригінальне повідомлення:</strong><br>
                ${originalMessage.replace(/\n/g, '<br>')}
            </div>
        </div>
        <div class="footer">
            <p>З повагою, команда Leder</p>
            <p>Якщо у вас є додаткові питання, просто відповідайте на цей лист.</p>
        </div>
    </div>
</body>
</html>
            `,
        });
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
}
